import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReservaService } from '../../../services/reserva.service';

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
  protected router = inject(Router);

  reservas: Reserva[] = [];
  cargando: boolean = true;
  mensajeError: string = '';
  mensajeExito: string = '';

  ngOnInit(): void {
    this.cargarReservas();
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

  // Getters para clasificar reservas activas e históricas
  get reservasActivas(): Reserva[] {
    const ahora = new Date();
    return this.reservas.filter(r => 
      r.estado === 'ACTIVO' && new Date(r.fechaHora) >= ahora
    );
  }

  get reservasHistoricas(): Reserva[] {
    const ahora = new Date();
    return this.reservas.filter(r => 
      r.estado !== 'ACTIVO' || new Date(r.fechaHora) < ahora
    );
  }

    puedeCancelarPaciente(fechaHoraStr: string | Date): boolean {
    if (!fechaHoraStr) return false;

    const fechaTurno = new Date(fechaHoraStr);
    const hoy = new Date();

    const inicioTurno = new Date(fechaTurno.getFullYear(), fechaTurno.getMonth(), fechaTurno.getDate());
    const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

    return inicioTurno > inicioHoy;
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