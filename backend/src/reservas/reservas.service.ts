import { 
  Injectable, 
  BadRequestException, 
  NotFoundException, 
  ConflictException 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual } from 'typeorm'; 

import { Reserva } from './entities/reserva.entity.js';
import { CreateReservaDto } from './dto/create-reserva.dto.js';
import { EstadoReserva } from './enums/estado-reserva.enum.js';
import { Medico } from '../medicos/entities/medico.entity.js';
import { Usuario } from '../usuarios/entities/usuario.entity.js';
@Injectable()
export class ReservasService {
  constructor(
    @InjectRepository(Reserva)
    private readonly reservaRepository: Repository<Reserva>,
    @InjectRepository(Medico)
    private readonly medicoRepository: Repository<Medico>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  // 1. Crear nueva reserva
  async crearReserva(createReservaDto: CreateReservaDto): Promise<Reserva> {
    const { idMedico, idPaciente, fechaHora } = createReservaDto;
    const fechaTurno = new Date(fechaHora);
    const ahora = new Date();

    // Validar que la fecha no sea en el pasado
    if (fechaTurno < ahora) {
      throw new BadRequestException('No se pueden reservar turnos en fechas u horas pasadas.');
    }

    // Validar franja horaria (8:00 a 16:00 hs)
    const hora = fechaTurno.getHours();
    if (hora < 8 || hora >= 16) {
      throw new BadRequestException('El horario de atención es de 8:00 a 16:00 hs.');
    }

    // Validar anticipación máxima de 30 días
    const fechaLimite = new Date();
    fechaLimite.setDate(ahora.getDate() + 30);
    if (fechaTurno > fechaLimite) {
      throw new BadRequestException(
        'Las reservas se pueden realizar con un máximo de 30 días de anticipación.',
      );
    }

    // Verificar que el médico exista
    const medico = await this.medicoRepository.findOne({ where: { id: idMedico } });
    if (!medico) {
      throw new NotFoundException(`El médico con ID ${idMedico} no existe.`);
    }

    // Verificar que el paciente exista
    const paciente = await this.usuarioRepository.findOne({ where: { id: idPaciente } });
    if (!paciente) {
      throw new NotFoundException(`El paciente con ID ${idPaciente} no existe.`);
    }

    // Verificar si el médico ya tiene turno ocupado a esa hora
    const turnoOcupado = await this.reservaRepository.findOne({
      where: {
        idMedico,
        fechaHora: fechaTurno,
        estado: EstadoReserva.ACTIVO,
      },
    });

    if (turnoOcupado) {
      throw new ConflictException('El médico ya tiene un turno reservado en ese horario.');
    }

    // Guardar la reserva congelando el valor de la consulta
    const valorFinal = medico.valorConsulta ?? (medico as any).valor_consulta ?? 0;

    const nuevaReserva = this.reservaRepository.create({
      idMedico,
      idPaciente,
      fechaHora: fechaTurno,
      estado: EstadoReserva.ACTIVO,
      valorConsulta: Number(valorFinal),
    });

    return await this.reservaRepository.save(nuevaReserva);
  }

  // 2. Obtener reservas de un paciente
  async obtenerPorPaciente(idPaciente: number): Promise<any[]> {
    const reservas = await this.reservaRepository.find({
      where: { idPaciente },
      relations: {
        medico: {
          usuario: true, 
        },
      },
      order: { fechaHora: 'ASC' },
    });

    return reservas.map((r) => ({
      ...r,
      nombreMedico: r.medico?.usuario 
        ? `${r.medico.usuario.nombres} ${r.medico.usuario.apellidos}`
        : `Médico #${r.idMedico}`,
    }));
  }

  // 3. Cancelar reserva (reglas para Paciente y Administrador)
  async cancelarReserva(idReserva: number, rolUsuario: string): Promise<Reserva> {
    const reserva = await this.reservaRepository.findOneBy({ id: idReserva });

    if (!reserva) {
      throw new NotFoundException('La reserva no existe');
    }

    const ahora = new Date();
    const fechaTurno = new Date(reserva.fechaHora);

    // REGLA PACIENTE: Solo hasta el día anterior (23:59:59 del día previo)
    if (rolUsuario === 'PACIENTE') {
      const limitePaciente = new Date(fechaTurno);
      limitePaciente.setDate(limitePaciente.getDate() - 1);
      limitePaciente.setHours(23, 59, 59, 999);

      if (ahora > limitePaciente) {
        throw new BadRequestException(
          'Los pacientes solo pueden cancelar turnos hasta el día anterior a la consulta.',
        );
      }
    }

    // REGLA ADMINISTRADOR: Hasta el momento de inicio de la consulta
    if (rolUsuario === 'ADMINISTRADOR') {
      if (ahora >= fechaTurno) {
        throw new BadRequestException(
          'No se puede cancelar un turno que ya inició o transcurrió.',
        );
      }
    }

    reserva.estado = EstadoReserva.CANCELADO;
    return await this.reservaRepository.save(reserva);
  }

  // 4. Obtener la agenda diaria del médico
  async obtenerAgendaMedico(idMedico: number, fechaStr: string): Promise<Reserva[]> {
    const inicioDia = new Date(`${fechaStr}T00:00:00`);
    const finDia = new Date(`${fechaStr}T23:59:59`);

    return await this.reservaRepository.find({
      where: {
        idMedico,
        fechaHora: Between(inicioDia, finDia),
      },
      relations: {
        paciente: true,
      },
      order: { fechaHora: 'ASC' },
    });
  }

  // 5. Cambiar el estado del turno (ATENDIDO o AUSENTE)
  async cambiarEstadoTurno(idReserva: number, nuevoEstado: EstadoReserva) {
  const reserva = await this.reservaRepository.findOneBy({ id: idReserva });

  if (!reserva) {
    throw new NotFoundException('La reserva no existe.');
  }

  // Validar que no se atienda un turno con fecha futura
  if ((nuevoEstado === EstadoReserva.ATENDIDO || nuevoEstado === EstadoReserva.AUSENTE) && new Date(reserva.fechaHora) > new Date()) {
  throw new BadRequestException('No se puede registrar la asistencia/ausencia de un turno con fecha futura.');
}

  reserva.estado = nuevoEstado;
  return await this.reservaRepository.save(reserva);
}

  // 6. Obtener próximos turnos
  async obtenerProximosTurnos(idMedico: number) {
  const ahora = new Date();

  return await this.reservaRepository.find({
    where: {
      idMedico: idMedico,
      fechaHora: MoreThanOrEqual(ahora),
      estado: EstadoReserva.ACTIVO,
    },
    relations: { paciente: true, },
    order: {
      fechaHora: 'ASC',
    },
    take: 10,
  });
}
}
