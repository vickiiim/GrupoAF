import { 
  Controller, 
  Get,
  Post, 
  Patch,
  Body, 
  Param,
  ParseIntPipe,
  UseGuards
} from '@nestjs/common';
import { ReservasService } from './reservas.service.js';
import { CreateReservaDto } from './dto/create-reserva.dto.js';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@ApiTags('reservas')
@ApiBearerAuth()
@Controller('v1/reservas')
@UseGuards(JwtAuthGuard)
export class ReservasController {
  constructor(
    private readonly reservasService: ReservasService,
  ) {}

  // 1. Crear reserva
  @Post()
  crear(@Body() createReservaDto: CreateReservaDto) {
    return this.reservasService.crearReserva(createReservaDto);
  }

  // 2. Obtener reservas por id de paciente 
  @Get('paciente/:idPaciente')
  obtenerPorPaciente(@Param('idPaciente', ParseIntPipe) idPaciente: number) {
    return this.reservasService.obtenerPorPaciente(idPaciente);
  }

  // 3. Cancelar reserva
  @Patch(':id/cancelar')
    cancelar(
  @Param('id', ParseIntPipe) id: number,
  @Body('rolUsuario') rolUsuario: string = 'PACIENTE', // O extraerlo del token JWT
  ) {
  return this.reservasService.cancelarReserva(id, rolUsuario);
  }

}


