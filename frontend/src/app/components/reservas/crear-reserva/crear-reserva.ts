import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ReservaService } from '../../../services/reserva.service';

@Component({
  selector: 'app-crear-reserva',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crear-reserva.html',
  styleUrl: './crear-reserva.css'
})
export class CrearReserva implements OnInit {
  protected reservaService = inject(ReservaService);
  protected router = inject(Router);

  // Campos del formulario
  idMedico: number | null = null;
  fecha: string = '';
  hora: string = '08:00';
  
  // Mensajes de feedback
  mensajeError: string = '';
  mensajeExito: string = '';

  // Horarios permitidos (de 08:00 a 15:00 hs para finalizar a las 16:00 hs)
  horariosDisponibles: string[] = [
    '08:00', '09:00', '10:00', '11:00', 
    '12:00', '13:00', '14:00', '15:00'
  ];

  ngOnInit(): void {}

  guardarReserva(): void {
    this.mensajeError = '';
    this.mensajeExito = '';

    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    console.log('Token guardado:', token);
    console.log('UserId guardado:', localStorage.getItem('userId'));

    if (!token) {
      this.mensajeError = 'No estás autenticado. Por favor, volvé a iniciar sesión.';
      return;
    }

    if (!this.idMedico || !this.fecha || !this.hora) {
      this.mensajeError = 'Por favor complete todos los campos obligatorios.';
      return;
    }

    // 🔹 Se envía la fecha/hora en formato local sin la "Z" para evitar el desfase de zona horaria
    const fechaHoraIso = `${this.fecha}T${this.hora}:00`;
    const idPacienteLogueado = Number(localStorage.getItem('userId')) || 1;

    const dto = {
      idMedico: Number(this.idMedico),
      idPaciente: idPacienteLogueado,
      fechaHora: fechaHoraIso
    };

    this.reservaService.crearReserva(dto).subscribe({
      next: () => {
        this.mensajeExito = '¡Reserva creada con éxito!';
        setTimeout(() => this.router.navigate(['/reservas/mis-turnos']), 1500);
      },
      error: (err) => {
        if (err.status === 401) {
          this.mensajeError = 'Sesión expirada o no autorizada. Iniciá sesión nuevamente.';
        } else if (err.status === 409) {
          this.mensajeError = 'El médico ya tiene un turno reservado en ese horario.';
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
