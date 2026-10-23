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

  ngOnInit(): void {}

  // Función auxiliar para obtener el ID real del paciente conectado
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
    // 1. Limpiar mensajes previos antes de enviar
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

    // 2. Formatear la fecha seleccionada a YYYY-MM-DD
    const d = new Date(this.fechaSeleccionada);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const fechaFormatted = `${year}-${month}-${day}`;

    const fechaHoraIso = `${fechaFormatted}T${this.hora}:00`;
    const idPacienteLogueado = this.obtenerIdPaciente();

    const dto = {
      idMedico: Number(this.idMedico),
      idPaciente: idPacienteLogueado,
      fechaHora: fechaHoraIso
    };

    // 3. Enviar la reserva al backend
    this.reservaService.crearReserva(dto).subscribe({
      next: () => {
        // En caso de éxito: activamos mensaje verde y borramos cualquier error previo
        this.mensajeError = '';
        this.mensajeExito = '¡Reserva creada con éxito!';
        setTimeout(() => this.router.navigate(['/reservas/mis-turnos']), 1500);
      },
      error: (err) => {
        // En caso de error: OBLIGATORIO vaciar el éxito para que NO salga el cartel verde
        this.mensajeExito = '';

        if (err.status === 401) {
          this.mensajeError = 'Sesión expirada o no autorizada. Iniciá sesión nuevamente.';
        } else if (err.status === 409) {
          this.mensajeError = 'El médico ya tiene un turno reservado en ese horario.';
        } else if (err.status === 400) {
          const msj = Array.isArray(err.error?.message) 
            ? err.error.message.join(', ') 
            : err.error?.message;
          this.mensajeError = msj || 'Datos inválidos o la hora seleccionada ya transcurrió.';
        } else {
          const msj = Array.isArray(err.error?.message) 
            ? err.error.message.join(', ') 
            : err.error?.message;
          this.mensajeError = msj || 'Ocurrió un error al crear la reserva.';
        }
      }
    });
  }
}