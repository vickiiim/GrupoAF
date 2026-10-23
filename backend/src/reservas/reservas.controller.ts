import { 
  Controller, 
  Get,
  Post, 
  Patch,
  Body, 
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  Request
} from '@nestjs/common';
import { ReservasService } from './reservas.service.js';
import { CreateReservaDto } from './dto/create-reserva.dto.js';
import { UpdateEstadoReservaDto } from './dto/update-estado-reserva.dto.js';
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

  // 2. Obtener reservas por ID de paciente 
  @Get('paciente/:idPaciente')
  obtenerPorPaciente(@Param('idPaciente', ParseIntPipe) idPaciente: number) {
    return this.reservasService.obtenerPorPaciente(idPaciente);
  }

  // 3. Cancelar reserva (Paciente o Administrador)
  @Patch(':id/cancelar')
  cancelar(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
    @Body('rolUsuario') rolBody?: string,
  ) {
    // Extrae el rol del token autenticado (req.user), del body si viene, o por defecto 'PACIENTE'
    const rolUsuario = (req.user?.rol || req.user?.role || rolBody || 'PACIENTE').toUpperCase();
    return this.reservasService.cancelarReserva(id, rolUsuario);
  }

  // 4. Ver agenda diaria del médico
  @Get('medico/:idMedico/agenda')
  obtenerAgendaMedico(
    @Param('idMedico', ParseIntPipe) idMedico: number,
    @Query('fecha') fecha: string,
  ) {
    return this.reservasService.obtenerAgendaMedico(idMedico, fecha);
  }

  // 5. Cambiar estado del turno a ATENDIDO o AUSENTE (Médico)
  @Patch(':id/estado')
  cambiarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEstadoDto: UpdateEstadoReservaDto,
  ) {
    return this.reservasService.cambiarEstadoTurno(id, updateEstadoDto.estado);
  }

  // 6. Obtener próximos turnos
  @Get('medico/:id/proximos')
  async obtenerProximosTurnos(@Param('id') idMedico: number) {
    return await this.reservasService.obtenerProximosTurnos(+idMedico);
  }
}