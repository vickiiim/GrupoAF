import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { RolesUsuario, EstadosUsuario } from '../../enums/roles.enum';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  // TEXT NOT NULL UNIQUE, tal como exige el modelo de datos de la consigna.
  @Column({ type: 'text', unique: true })
  documento: string;

  @Column({ type: 'text' })
  apellidos: string;

  @Column({ type: 'text' })
  nombres: string;

  // El modelo pide TEXT NOT NULL. Se agrega UNIQUE para que el login por
  // email sea determinístico (no existan dos usuarios con el mismo email).
  @Column({ type: 'text', unique: true })
  email: string;

  @Column({ type: 'text' })
  clave: string;

  @Column({
    type: 'enum',
    enum: EstadosUsuario,
    enumName: 'estados_usuarios',
    default: EstadosUsuario.ACTIVO,
  })
  estado: EstadosUsuario;

  @Column({ type: 'enum', enum: RolesUsuario, enumName: 'roles_usuarios' })
  rol: RolesUsuario;
}
