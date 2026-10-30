import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface LoginDto {
  email: string;
  clave: string;
}

export interface AuthResponse {
  accessToken: string;
  usuario: {
    id: number;
    email: string;
    nombres: string;
    apellidos: string;
    rol: string;
    estado?: string;
    idMedico?: number | null;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);

  /**
   * Rutas relativas: en desarrollo el proxy de Angular (proxy.conf.json)
   * y en produccion Nginx reenvian /api hacia el backend NestJS.
   */
  private apiUrl = '/api/auth';

  login(credentials: LoginDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((res: any) => {
        const token = res?.accessToken || res?.access_token || res?.token;
        if (token) {
          localStorage.setItem('token', token);
          if (res?.usuario) {
            localStorage.setItem('usuario', JSON.stringify(res.usuario));
          }
        }
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUser(): any {
    const usuario = localStorage.getItem('usuario');
    return usuario ? JSON.parse(usuario) : null;
  }

  getRole(): string | null {
    const usuario = this.getUser();
    return usuario ? usuario.rol : null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  }
}
