import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { Medico } from '../medicos/entities/medico.entity';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { EstadosUsuario } from '../enums/roles.enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(Medico)
    private readonly medicoRepository: Repository<Medico>, // Inyección del repositorio de Médicos
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const email = (loginDto.email || (loginDto as any).username || '').trim().toLowerCase();
    const clave = loginDto.clave || (loginDto as any).password || '';

    // 1. Buscamos el usuario de forma limpia (sin leftJoinAndSelect)
    const usuario = await this.usuarioRepository
      .createQueryBuilder('u')
      .where('LOWER(TRIM(u.email)) = :email', { email })
      .getOne();

    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (usuario.estado === EstadosUsuario.BAJA) {
      throw new UnauthorizedException('El usuario se encuentra dado de baja');
    }

    const esClaveValida = await bcrypt
      .compare(clave, usuario.clave)
      .catch(() => false);

    if (!esClaveValida) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 2. Buscamos si este usuario tiene un registro asignado en la tabla de Médicos
    const medico = await this.medicoRepository.findOne({
      where: { usuario: { id: usuario.id } }
    });

    const payload = { sub: usuario.id, email: usuario.email, rol: usuario.rol };
    const accessToken = this.jwtService.sign(payload);
    const nombreCompleto = `${usuario.nombres} ${usuario.apellidos}`.trim();

    return {
      accessToken,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nombres: usuario.nombres,
        apellidos: usuario.apellidos,
        nombre: nombreCompleto,
        nombreCompleto: nombreCompleto,
        rol: usuario.rol,
        idMedico: medico ? medico.id : null, // Devuelve el idMedico (ej: 2) si existe
      } as any,
    };
  }
}