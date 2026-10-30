import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { Usuario } from '../usuarios/entities/usuario.entity';
import { Medico } from '../medicos/entities/medico.entity';
import { Reserva } from '../reservas/entities/reserva.entity';
import { EstadoReserva } from '../reservas/enums/estado-reserva.enum';
import { EstadosUsuario, RolesUsuario } from '../enums/roles.enum';

interface UsuarioSemilla {
  documento: string;
  apellidos: string;
  nombres: string;
  email: string;
  rol: RolesUsuario;
  valorConsulta?: number;
  matricula?: number;
}

interface ReservaSemilla {
  emailMedico: string;
  emailPaciente: string;
  diasDesdeHoy: number;
  hora: number;
  estado: EstadoReserva;
}

const USUARIOS_SEMILLA: UsuarioSemilla[] = [
  {
    documento: '10000001',
    nombres: 'Valentina',
    apellidos: 'Ríos',
    email: 'admin@clinica.com',
    rol: RolesUsuario.ADMINISTRADOR,
  },
  {
    documento: '20000001',
    nombres: 'Martín',
    apellidos: 'Gómez',
    email: 'medico@clinica.com',
    rol: RolesUsuario.MEDICO,
    matricula: 1001,
    valorConsulta: 30000,
  },
  {
    documento: '30000001',
    nombres: 'Sofía',
    apellidos: 'Martínez',
    email: 'paciente@clinica.com',
    rol: RolesUsuario.PACIENTE,
  },
  {
    documento: '20000002',
    nombres: 'Laura',
    apellidos: 'Benítez',
    email: 'laura.benitez@clinica.com',
    rol: RolesUsuario.MEDICO,
    matricula: 1002,
    valorConsulta: 25000,
  },
  {
    documento: '20000003',
    nombres: 'Diego',
    apellidos: 'Sosa',
    email: 'diego.sosa@clinica.com',
    rol: RolesUsuario.MEDICO,
    matricula: 1003,
    valorConsulta: 28000,
  },
];

const RESERVAS_SEMILLA: ReservaSemilla[] = [
  {
    emailMedico: 'medico@clinica.com',
    emailPaciente: 'paciente@clinica.com',
    diasDesdeHoy: 2,
    hora: 10,
    estado: EstadoReserva.ACTIVO,
  },
  {
    emailMedico: 'laura.benitez@clinica.com',
    emailPaciente: 'paciente@clinica.com',
    diasDesdeHoy: 4,
    hora: 15,
    estado: EstadoReserva.ACTIVO,
  },
  {
    emailMedico: 'diego.sosa@clinica.com',
    emailPaciente: 'paciente@clinica.com',
    diasDesdeHoy: 6,
    hora: 9,
    estado: EstadoReserva.ACTIVO,
  },
];

const BCRYPT_ROUNDS = 10;
const VALOR_CONSULTA_ANTERIOR = 5000;

@Injectable()
export class SeedersService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedersService.name);

  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(Medico)
    private readonly medicoRepository: Repository<Medico>,
    @InjectRepository(Reserva)
    private readonly reservaRepository: Repository<Reserva>,
    private readonly configService: ConfigService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    if (!this.seedEnabled()) {
      this.logger.log(
        'Seeders deshabilitados (SEED_DEFAULT_USERS=false). No se crean datos de prueba.',
      );
      return;
    }

    try {
      const usuarios = new Map<string, Usuario>();

      for (const semilla of USUARIOS_SEMILLA) {
        const usuario = await this.ensureUsuario(semilla);
        usuarios.set(semilla.email, usuario);
      }

      for (const semilla of USUARIOS_SEMILLA) {
        if (semilla.rol !== RolesUsuario.MEDICO) continue;

        const usuario = usuarios.get(semilla.email);
        if (usuario) {
          await this.ensurePerfilMedico(
            usuario,
            semilla.matricula ?? 0,
            semilla.valorConsulta ?? 0,
          );
        }
      }

      await this.ensureReservasSemilla(usuarios);

      this.logger.log('Seeders verificados: datos de prueba disponibles.');
    } catch (error) {
      const detalle = error instanceof Error ? error.stack : String(error);
      this.logger.error('No se pudieron inicializar los datos de prueba.', detalle);
      throw error;
    }
  }

  private seedEnabled(): boolean {
    const valor = this.configService.get<string>('SEED_DEFAULT_USERS', 'true');
    return (valor ?? 'true').toLowerCase() !== 'false';
  }

  private defaultPassword(): string {
    return this.configService.get<string>('SEED_DEFAULT_PASSWORD', '123456') ?? '123456';
  }

  private async ensureUsuario(semilla: UsuarioSemilla): Promise<Usuario> {
    const email = semilla.email.trim().toLowerCase();

    const existente = await this.usuarioRepository.findOne({ where: { email } });
    if (existente) {
      return await this.actualizarUsuarioSemilla(existente, semilla);
    }

    const usuario = this.usuarioRepository.create({
      documento: semilla.documento,
      apellidos: semilla.apellidos,
      nombres: semilla.nombres,
      email,
      clave: await bcrypt.hash(this.defaultPassword(), BCRYPT_ROUNDS),
      estado: EstadosUsuario.ACTIVO,
      rol: semilla.rol,
    });

    const guardado = await this.usuarioRepository.save(usuario);
    this.logger.log(`Usuario de prueba creado: ${email} (${semilla.rol}).`);
    return guardado;
  }

  private async actualizarUsuarioSemilla(
    usuario: Usuario,
    semilla: UsuarioSemilla,
  ): Promise<Usuario> {
    const cambios: Partial<Usuario> = {};

    if (usuario.nombres !== semilla.nombres) cambios.nombres = semilla.nombres;
    if (usuario.apellidos !== semilla.apellidos) cambios.apellidos = semilla.apellidos;
    if (usuario.rol !== semilla.rol) cambios.rol = semilla.rol;
    if (usuario.estado !== EstadosUsuario.ACTIVO) cambios.estado = EstadosUsuario.ACTIVO;

    if (Object.keys(cambios).length === 0) {
      this.logger.debug(
        `Usuario ${usuario.email} ya existe y está actualizado (id ${usuario.id}).`,
      );
      return usuario;
    }

    Object.assign(usuario, cambios);
    const actualizado = await this.usuarioRepository.save(usuario);
    this.logger.log(`Usuario de prueba actualizado: ${usuario.email}.`);
    return actualizado;
  }

  private async ensurePerfilMedico(
    usuario: Usuario,
    matricula: number,
    valorConsulta: number,
  ): Promise<Medico> {
    const existente = await this.medicoRepository.findOne({
      where: { usuario: { id: usuario.id } },
    });

    if (existente) {
      let modificado = false;

      // Completa la matrícula si el perfil se creó antes de incorporarla.
      if (!existente.matricula || Number(existente.matricula) !== matricula) {
        existente.matricula = matricula;
        modificado = true;
        this.logger.log(
          `Matrícula del médico ${usuario.email} actualizada a ${matricula}.`,
        );
      }

      const valorActual = Number(existente.valorConsulta ?? 0);
      const usaValorPorDefecto =
        valorActual === 0 || valorActual === VALOR_CONSULTA_ANTERIOR;

      if (usaValorPorDefecto && valorActual !== valorConsulta) {
        existente.valorConsulta = valorConsulta;
        modificado = true;
        this.logger.log(
          `Tarifa del médico ${usuario.email} actualizada a $${valorConsulta}.`,
        );
      }

      if (modificado) {
        await this.medicoRepository.save(existente);
      }

      return existente;
    }

    const medico = this.medicoRepository.create({
      usuario,
      matricula,
      valorConsulta,
    });

    const guardado = await this.medicoRepository.save(medico);
    this.logger.log(
      `Perfil de médico creado para ${usuario.email} (id ${guardado.id}).`,
    );
    return guardado;
  }

  private async ensureReservasSemilla(
    usuarios: Map<string, Usuario>,
  ): Promise<void> {
    for (const semilla of RESERVAS_SEMILLA) {
      const paciente = usuarios.get(semilla.emailPaciente);
      const usuarioMedico = usuarios.get(semilla.emailMedico);

      if (!paciente || !usuarioMedico) continue;

      const medico = await this.medicoRepository.findOne({
        where: { usuario: { id: usuarioMedico.id } },
      });

      if (!medico) continue;

      // Se busca por paciente + médico sin filtrar por estado para no
      // resucitar una reserva de ejemplo que el usuario haya cancelado.
      const existente = await this.reservaRepository.findOne({
        where: {
          idPaciente: paciente.id,
          idMedico: medico.id,
        },
      });

      if (existente) {
        this.logger.debug(
          `Reserva de prueba ya existe para ${paciente.email} y ${usuarioMedico.email}.`,
        );
        continue;
      }

      const reserva = this.reservaRepository.create({
        idMedico: medico.id,
        idPaciente: paciente.id,
        fechaHora: this.fechaFutura(semilla.diasDesdeHoy, semilla.hora),
        estado: semilla.estado,
        valorConsulta: Number(medico.valorConsulta ?? 0),
      });

      const guardada = await this.reservaRepository.save(reserva);
      this.logger.log(
        `Reserva de prueba creada: #${guardada.id} - ${paciente.email} con ${usuarioMedico.email}.`,
      );
    }
  }

  private fechaFutura(diasDesdeHoy: number, hora: number): Date {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + diasDesdeHoy);

    // La clínica no atiende los domingos.
    while (fecha.getDay() === 0) {
      fecha.setDate(fecha.getDate() + 1);
    }

    fecha.setHours(hora, 0, 0, 0);
    return fecha;
  }
}
