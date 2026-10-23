import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity.js';

@Entity('medicos')
export class Medico {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'id_usuario', nullable: true }) 

  @Column({ name: 'valor_consulta', type: 'int', nullable: true, default: 0 }) 
  valorConsulta: number;

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;
}
