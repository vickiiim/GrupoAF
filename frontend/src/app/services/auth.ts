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
    rol: 'ADMINISTRADOR' | 'MEDICO' | 'PACIENTE';
    estado: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/auth';

  login(credentials: LoginDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((res) => {
        if (res.accessToken) {
          localStorage.setItem('jwt_token', res.accessToken);
          localStorage.setItem('user_info', JSON.stringify(res.usuario));
        }
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem('jwt_token');
  }

  getUser(): any {
    const user = localStorage.getItem('user_info');
    return user ? JSON.parse(user) : null;
  }

  getRole(): string | null {
    const user = this.getUser();
    return user ? user.rol : null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_info');
  }
}
