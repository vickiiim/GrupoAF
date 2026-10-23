export type EstadoReserva = 'ACTIVO' | 'ATENDIDO' | 'AUSENTE' | 'CANCELADO';

export interface CreateReservaDto {
  idMedico: number;
  idPaciente: number;
  fechaHora: string; // Formato ISO: "2026-10-15T09:00:00.000Z"
}

export interface Reserva {
  id: number;
  idMedico: number;
  idPaciente: number;
  fechaHora: string;
  estado: EstadoReserva;
  valorConsulta: number;
  medico?: any;
  paciente?: any;
}
