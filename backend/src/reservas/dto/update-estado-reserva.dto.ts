import { IsIn, IsNotEmpty } from 'class-validator';
import { EstadoReserva } from '../enums/estado-reserva.enum';

export class UpdateEstadoReservaDto {
  @IsNotEmpty({ message: 'El estado es obligatorio' })
  @IsIn([EstadoReserva.ATENDIDO, EstadoReserva.AUSENTE], {
    message: 'El estado debe ser únicamente ATENDIDO o AUSENTE',
  })
  estado: EstadoReserva;
}