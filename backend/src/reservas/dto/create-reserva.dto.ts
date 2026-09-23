import { ApiProperty } from '@nestjs/swagger';
import { 
  IsInt, 
  IsNotEmpty, 
  IsDateString 
} from 'class-validator';

export class CreateReservaDto {
  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  idMedico: number;

  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  idPaciente: number;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  fechaHora: string; // Formato ISO 8601 (ej: "2026-10-05T10:00:00.000Z")
}