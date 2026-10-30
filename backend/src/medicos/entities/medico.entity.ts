import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity.js';

@Entity('medicos')
export class Medico {
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * Matrícula profesional del médico.
   * La consigna la exige como INT NOT NULL.
   */
  @Column({ type: 'int' })
  matricula: number;

  @Column({ name: 'valor_consulta', type: 'int', default: 0 })
  valorConsulta: number;

  /**
   * Un usuario con rol MEDICO tiene como máximo un perfil en esta tabla.
   * La columna id_usuario es la clave foránea y queda protegida con UNIQUE.
   */
  @OneToOne(() => Usuario, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;
}
