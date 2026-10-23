import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reserva, CreateReservaDto } from '../models/reserva.model';

@Injectable({ providedIn: 'root' })
export class ReservaService {
  private http = inject(HttpClient);
  private apiUrl = '/api/v1/reservas';

  // Obtener headers con Bearer token
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // Obtiene el rol del usuario actual desde localStorage o payload JWT
  private getRolActual(): string {
    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    let rol = localStorage.getItem('rol') || localStorage.getItem('role') || 'PACIENTE';

    if (token && token.includes('.')) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        rol = payload.rol || payload.role || rol;
      } catch (e) {
        console.error('Error al leer el rol para cancelación:', e);
      }
    }
    return rol.toUpperCase();
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
    const rolUsuario = this.getRolActual();
    // Se envía el rol actual en el body para que el backend autorice la cancelación de Admin
    return this.http.patch<Reserva>(
      `${this.apiUrl}/${id}/cancelar`, 
      { rolUsuario }, 
      { headers: this.getHeaders() }
    );
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