import { 
  Controller, 
  Get,
  Post, 
  Patch,
  Body, 
  Param,
  Query,
  ParseIntPipe,
  UseGuards
} from '@nestjs/common';
import { ReservasService } from './reservas.service.js';
import { CreateReservaDto } from './dto/create-reserva.dto.js';
import { UpdateEstadoReservaDto } from './dto/update-estado-reserva.dto.js'; // 👈 DTO con @IsIn(['ATENDIDO', 'AUSENTE'])
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
    @Body('rolUsuario') rolUsuario: string = 'PACIENTE',
  ) {
    return this.reservasService.cancelarReserva(id, rolUsuario);
  }

  // 4. Ver agenda diaria del médico
  // Ejemplo: GET /v1/reservas/medico/5/agenda?fecha=2026-10-05
  @Get('medico/:idMedico/agenda')
  obtenerAgendaMedico(
    @Param('idMedico', ParseIntPipe) idMedico: number,
    @Query('fecha') fecha: string,
  ) {
    return this.reservasService.obtenerAgendaMedico(idMedico, fecha);
  }

  // 5. Cambiar estado del turno a ATENDIDO o AUSENTE (Médico)
  // Ejemplo: PATCH /v1/reservas/12/estado con body: { "estado": "ATENDIDO" }
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