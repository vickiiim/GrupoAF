import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MedicosService {
  private apiUrl = '/api/v1/medicos';

  constructor(private http: HttpClient) {}

  // Obtiene las cabeceras HTTP incluyendo el Token JWT
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // 1. Obtener la lista de médicos 
  obtenerMedicos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  // 2. Actualizar la tarifa 
  actualizarTarifa(idMedico: number, nuevoValor: number): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}/${idMedico}/tarifa`,
      { valor_consulta: nuevoValor },
      { headers: this.getHeaders() }
    );
  }
}
