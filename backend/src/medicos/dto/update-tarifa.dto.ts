import { IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTarifaDto {
  @ApiProperty({ example: 7500, description: 'Nuevo valor de la consulta' })
  @IsNumber({}, { message: 'El valor de la consulta debe ser un número' })
  @Min(0, { message: 'El valor de la consulta no puede ser negativo' })
  valor_consulta: number;
}