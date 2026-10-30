import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ReservaService } from '../../../services/reserva.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';

@Component({
  selector: 'app-crear-reserva',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    MatFormFieldModule, 
    MatInputModule, 
    MatDatepickerModule
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './crear-reserva.html',
  styleUrl: './crear-reserva.css'
})
export class CrearReserva implements OnInit {
  protected reservaService = inject(ReservaService);
  protected router = inject(Router);

  // Campos del formulario
  idMedico: number | null = null;
  fechaSeleccionada: Date | null = null;
  hora: string = '08:00';
  
  // Gestión de Pacientes y Administrador
  esAdmin: boolean = false;
  idPacienteSeleccionado: number | null = null;

  // Mensajes de feedback
  mensajeError: string = '';
  mensajeExito: string = '';

  horariosDisponibles: string[] = [
    '08:00', '09:00', '10:00', '11:00', 
    '12:00', '13:00', '14:00', '15:00'
  ];

  // Filtro que bloquea los Domingos (0) directamente en el selector de fecha
  filtroDomingos = (d: Date | null): boolean => {
    const dia = (d || new Date()).getDay();
    return dia !== 0; 
  };

  ngOnInit(): void {
    const rol = this.obtenerRolUsuario();
    this.esAdmin = rol === 'ADMINISTRADOR' || rol === 'ADMIN';
  }

  // Detectar el rol del usuario desde localStorage o Token JWT
  private obtenerRolUsuario(): string {
    const rolLocal = localStorage.getItem('rol') || localStorage.getItem('role');
    if (rolLocal) return rolLocal.toUpperCase();

    const userJson = localStorage.getItem('usuario') || localStorage.getItem('user');
    if (userJson) {
      try {
        const u = JSON.parse(userJson);
        const r = u.rol || u.role || u.tipo;
        if (r) return (typeof r === 'string' ? r : r.nombre || '').toUpperCase();
      } catch (e) {}
    }

    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    if (token && token.includes('.')) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const r = payload.rol || payload.role || payload.tipo;
        if (r) return String(r).toUpperCase();
      } catch (e) {
        console.error('Error decodificando token:', e);
      }
    }
    return 'PACIENTE';
  }

  // Obtener el ID del paciente logueado (cuando NO es Admin)
  private obtenerIdPaciente(): number {
    const userIdLocal = localStorage.getItem('userId') || localStorage.getItem('id');
    if (userIdLocal && !isNaN(Number(userIdLocal))) {
      return Number(userIdLocal);
    }

    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    if (token && token.includes('.')) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return Number(payload.sub || payload.id || payload.userId || 1);
      } catch (e) {
        console.error('Error decodificando token:', e);
      }
    }
    return 1;
  }

  guardarReserva(): void {
    // 1. Limpiar mensajes previos
    this.mensajeError = '';
    this.mensajeExito = '';

    const token = localStorage.getItem('token') || localStorage.getItem('access_token');

    if (!token) {
      this.mensajeError = 'No estás autenticado. Por favor, volvé a iniciar sesión.';
      return;
    }

    if (!this.idMedico || !this.fechaSeleccionada || !this.hora) {
      this.mensajeError = 'Por favor complete todos los campos obligatorios.';
      return;
    }

    // 2. Determinar qué idPaciente enviar
    let idPacienteFinal: number;

    if (this.esAdmin) {
      if (!this.idPacienteSeleccionado) {
        this.mensajeError = 'Como Administrador, debe ingresar el ID del paciente.';
        return;
      }
      idPacienteFinal = Number(this.idPacienteSeleccionado);
    } else {
      idPacienteFinal = this.obtenerIdPaciente();
    }

    // 3. Formatear la fecha a YYYY-MM-DD
    const d = new Date(this.fechaSeleccionada);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const fechaFormatted = `${year}-${month}-${day}`;

    const fechaHoraIso = `${fechaFormatted}T${this.hora}:00`;

    const dto = {
      idMedico: Number(this.idMedico),
      idPaciente: idPacienteFinal,
      fechaHora: fechaHoraIso
    };

    // 4. Enviar la reserva al backend
    this.reservaService.crearReserva(dto).subscribe({
      next: (res) => {
        this.mensajeExito = '¡Turno reservado con éxito!';
        setTimeout(() => {
          this.router.navigate(['/reservas/mis-turnos']);
        }, 1500);
      },
      error: (err) => {
        console.error('Error al guardar reserva:', err);
        this.mensajeError = err.error?.message || 'Error al guardar el turno. Verifique disponibilidad.';
      }
    });
  }
}