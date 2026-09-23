import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reserva, CreateReservaDto } from '../models/reserva.model';

@Injectable({ providedIn: 'root' })
export class ReservaService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/v1/reservas';

  // Obtener el token del localStorage
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // POST /api/v1/reservas
  crearReserva(dto: CreateReservaDto): Observable<Reserva> {
    return this.http.post<Reserva>(this.apiUrl, dto, { headers: this.getHeaders() });
  }

  // GET /api/v1/reservas/paciente/:idPaciente
  obtenerReservasPorPaciente(idPaciente: number): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(`${this.apiUrl}/paciente/${idPaciente}`, { headers: this.getHeaders() });
  }

  // PATCH /api/v1/reservas/:id/cancelar
  cancelarReserva(id: number): Observable<Reserva> {
    return this.http.patch<Reserva>(`${this.apiUrl}/${id}/cancelar`, {}, { headers: this.getHeaders() });
  }
}
