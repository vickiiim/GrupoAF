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

  // 1. POST /api/v1/reservas
  crearReserva(dto: CreateReservaDto): Observable<Reserva> {
    return this.http.post<Reserva>(this.apiUrl, dto, { headers: this.getHeaders() });
  }

  // 2. GET /api/v1/reservas/paciente/:idPaciente
  obtenerReservasPorPaciente(idPaciente: number): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(`${this.apiUrl}/paciente/${idPaciente}`, { headers: this.getHeaders() });
  }

  // 3. PATCH /api/v1/reservas/:id/cancelar
  cancelarReserva(id: number): Observable<Reserva> {
    return this.http.patch<Reserva>(`${this.apiUrl}/${id}/cancelar`, {}, { headers: this.getHeaders() });
  }

  // 4. GET /api/v1/reservas/medico/:idMedico/agenda?fecha=YYYY-MM-DD
  obtenerAgendaMedico(idMedico: number, fecha: string): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(`${this.apiUrl}/medico/${idMedico}/agenda?fecha=${fecha}`, {
      headers: this.getHeaders()
    });
  }

  // 5. PATCH /api/v1/reservas/:id/estado
  cambiarEstadoTurno(id: number, estado: 'ATENDIDO' | 'AUSENTE'): Observable<Reserva> {
    return this.http.patch<Reserva>(
      `${this.apiUrl}/${id}/estado`,
      { estado },
      { headers: this.getHeaders() }
    );
  }
  
 // 6. GET /api/v1/reservas/medico/:id/proximos
  getProximosTurnos(idMedico: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/medico/${idMedico}/proximos`, {
      headers: this.getHeaders()
    });
  }
  }
