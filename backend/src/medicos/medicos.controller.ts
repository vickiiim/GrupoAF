import { Controller, Patch, Param, Body, ParseIntPipe, UseGuards, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MedicosService } from './medicos.service';
import { UpdateTarifaDto } from './dto/update-tarifa.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesUsuario } from '../enums/roles.enum';

@ApiTags('médicos')
@ApiBearerAuth()
@Controller('v1/medicos') // Escucha en /api/v1/medicos
export class MedicosController {
  constructor(private readonly medicosService: MedicosService) {}

  @Get() async findAll() { return await this.medicosService.findAll(); }
  @Patch(':id/tarifa')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolesUsuario.ADMINISTRADOR)
  @ApiOperation({ summary: 'Actualizar la tarifa/valor de consulta de un médico (Solo Administrador)' })
  async updateTarifa(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTarifaDto,
  ) {
    return await this.medicosService.updateTarifa(id, dto.valor_consulta);
  }
}