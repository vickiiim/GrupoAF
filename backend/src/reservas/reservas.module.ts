import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservasService } from './reservas.service.js';
import { ReservasController } from './reservas.controller.js';
import { Reserva } from './entities/reserva.entity.js';
import { Medico } from '../medicos/entities/medico.entity.js';
import { Usuario } from '../usuarios/entities/usuario.entity.js';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [

      AuthModule,
      PassportModule.register({ defaultStrategy: 'jwt' }),

    TypeOrmModule.forFeature([
      Reserva, 
      Medico, 
      Usuario,
    ])
  ],
  controllers: [ReservasController],
  providers: [ReservasService],
  exports: [ReservasService],
})
export class ReservasModule {}