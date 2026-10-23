import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { RolesUsuario, EstadosUsuario } from '../../enums/roles.enum';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  documento: string;

  @Column()
  apellidos: string;

  @Column()
  nombres: string;

  @Column({ unique: true })
  email: string;

  @Column()
  clave: string;

  @Column({ type: 'enum', enum: EstadosUsuario, default: EstadosUsuario.ACTIVO })
  estado: EstadosUsuario;

  @Column({ type: 'enum', enum: RolesUsuario })
  rol: RolesUsuario;
}