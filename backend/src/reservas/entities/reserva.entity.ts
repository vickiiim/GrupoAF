import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne, 
  JoinColumn,
  Index
} from 'typeorm';
import { EstadoReserva } from '../enums/estado-reserva.enum.js';
import { Medico } from '../../medicos/entities/medico.entity.js';
import { Usuario } from '../../usuarios/entities/usuario.entity.js';

@Entity('reservas')
@Index('idx_reservas_medico_fecha', ['idMedico', 'fechaHora'])
@Index('idx_reservas_paciente', ['idPaciente'])
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
    enumName: 'estados_reservas',
    default: EstadoReserva.ACTIVO 
  })
  estado: EstadoReserva;

  @Column({ name: 'valor_consulta', type: 'int' })
  valorConsulta: number;
}
