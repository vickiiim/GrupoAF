import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({ description: 'Token de acceso JWT Bearer' })
  accessToken: string;

  @ApiProperty({ description: 'Datos básicos del usuario autenticado' })
  usuario: {
    id: number;
    email: string;
    nombreCompleto: string;
    rol: string;
  };
}
