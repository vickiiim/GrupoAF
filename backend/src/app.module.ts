import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { Usuario } from './usuarios/entities/usuario.entity';
import { Medico } from './medicos/entities/medico.entity';
import { MedicosModule } from './medicos/medicos.module'; 
import { ReservasModule } from './reservas/reservas.module';
import { Reserva } from './reservas/entities/reserva.entity';
import { SeedersModule } from './seeders/seeders.module';

@Module({
  controllers: [AppController],
  providers: [AppService],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', 'postgres'),
        database: configService.get<string>('DB_DATABASE', 'clinica_db'),
        entities: [Reserva, Usuario, Medico],
        synchronize: true, 
    }),
  }),
    AuthModule,
    ReservasModule,
    MedicosModule, 
    SeedersModule,
  ],
})
export class AppModule {}