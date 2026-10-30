import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SeedersService } from './seeders.service';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { Medico } from '../medicos/entities/medico.entity';
import { Reserva } from '../reservas/entities/reserva.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario, Medico, Reserva])],
  providers: [SeedersService],
})
export class SeedersModule {}
