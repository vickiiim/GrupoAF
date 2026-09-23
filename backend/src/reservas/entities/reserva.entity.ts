import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne, 
  JoinColumn 
} from 'typeorm';
import { EstadoReserva } from '../enums/estado-reserva.enum.js';
import { Medico } from '../../medicos/entities/medico.entity.js';
import { Usuario } from '../../usuarios/entities/usuario.entity.js';

@Entity('reservas')
export class Reserva {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'id_medico' })
  idMedico: number;

  @ManyToOne(() => Medico, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_medico' })
  medico: Medico;

  @Column({ name: 'id_paciente' })
  idPaciente: number;

  @ManyToOne(() => Usuario, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_paciente' })
  paciente: Usuario;

  @Column({ type: 'timestamp', name: 'fecha_hora' })
  fechaHora: Date;

  @Column({ 
    type: 'enum', 
    enum: EstadoReserva, 
    default: EstadoReserva.ACTIVO 
  })
  estado: EstadoReserva;

  @Column({ name: 'valor_consulta', type: 'int' })
  valorConsulta: number;
}
