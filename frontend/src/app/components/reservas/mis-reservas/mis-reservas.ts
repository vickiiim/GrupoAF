import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReservaService } from '../../../services/reserva.service';
import { AuthService } from '../../../services/auth.service';

export interface Reserva {
  id: number;
  idMedico: number;
  nombreMedico?: string;
  fechaHora: string;
  estado?: string;
  valorConsulta?: number;
}

@Component({
  selector: 'app-mis-reservas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mis-reservas.html',
  styleUrl: './mis-reservas.css'
})
export class MisReservas implements OnInit {
  protected reservaService = inject(ReservaService);
  protected authService = inject(AuthService);
  public router = inject(Router);

  reservas: Reserva[] = [];
  cargando: boolean = true;
  mensajeError: string = '';
  mensajeExito: string = '';

  ngOnInit(): void {
    this.cargarReservas();
  }

  // Getter dinámico: evalúa en tiempo real los roles sin desfasarse
  get esAdmin(): boolean {
    // 1. Verificación por AuthService
    const rolService = this.authService.getRole?.();
    if (rolService && (rolService.toUpperCase() === 'ADMINISTRADOR' || rolService.toUpperCase() === 'ADMIN')) {
      return true;
    }

    // 2. Verificación por clave directa en localStorage
    const rolStorage = localStorage.getItem('rol') || localStorage.getItem('role');
    if (rolStorage && (rolStorage.toUpperCase() === 'ADMINISTRADOR' || rolStorage.toUpperCase() === 'ADMIN')) {
      return true;
    }

    // 3. Decodificación directa del payload del token JWT
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      if (token && token.includes('.')) {
        const partes = token.split('.');
        if (partes.length >= 2) {
          const payload = JSON.parse(atob(partes[1]));
          const rolToken = (payload.rol || payload.role || '').toUpperCase();
          return rolToken === 'ADMINISTRADOR' || rolToken === 'ADMIN';
        }
      }
    } catch (e) {
      console.error('Error al decodificar token en esAdmin:', e);
    }

    return false;
  }

  cargarReservas(): void {
    this.cargando = true;
    this.mensajeError = '';
    this.mensajeExito = '';

    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    
    if (!token) {
      this.mensajeError = 'No estás autenticado. Por favor, iniciá sesión.';
      this.cargando = false;
      setTimeout(() => this.router.navigate(['/login']), 2000);
      return;
    }

    const idPacienteLogueado = Number(localStorage.getItem('userId'));

    if (!idPacienteLogueado) {
      this.mensajeError = 'No se encontró la información del usuario logueado.';
      this.cargando = false;
      return;
    }

    this.reservaService.obtenerReservasPorPaciente(idPacienteLogueado).subscribe({
      next: (data) => {
        this.reservas = data;
        this.cargando = false;
      },
      error: (err) => {
        this.cargando = false;
        if (err.status === 401) {
          this.mensajeError = 'Tu sesión expiró. Por favor, volvé a iniciar sesión.';
          setTimeout(() => this.router.navigate(['/login']), 2000);
        } else {
          this.mensajeError = err.error?.message || 'Error al cargar el listado de reservas.';
        }
      }
    });
  }

  // Regla horaria de cancelación según el rol
  puedeCancelar(fechaHoraStr: string | Date): boolean {
    if (!fechaHoraStr) return false;

    const fechaNormalizada = typeof fechaHoraStr === 'string' 
      ? fechaHoraStr.replace(' ', 'T') 
      : fechaHoraStr;

    const fechaTurno = new Date(fechaNormalizada);
    const ahora = new Date();

    // El Administrador puede cancelar hasta el inicio de la consulta
    if (this.esAdmin) {
      return fechaTurno.getTime() > ahora.getTime();
    }

    // El Paciente solo puede cancelar hasta el día anterior
    const inicioTurno = new Date(fechaTurno.getFullYear(), fechaTurno.getMonth(), fechaTurno.getDate());
    const inicioHoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());

    return inicioTurno > inicioHoy;
  }

  // Alias para mantener compatibilidad con el template HTML
  puedeCancelarPaciente(fechaHoraStr: string | Date): boolean {
    return this.puedeCancelar(fechaHoraStr);
  }

  cancelarReserva(idReserva: number): void {
    if (!confirm(`¿Estás seguro de que deseas cancelar la reserva #${idReserva}?`)) {
      return;
    }

    this.reservaService.cancelarReserva(idReserva).subscribe({
      next: () => {
        this.mensajeExito = 'Reserva cancelada correctamente.';
        this.cargarReservas();
      },
      error: (err) => {
        if (err.status === 401) {
          this.mensajeError = 'Sesión expirada. Volvé a iniciar sesión.';
        } else {
          this.mensajeError = err.error?.message || 'No se pudo cancelar la reserva.';
        }
      }
    });
  }
}