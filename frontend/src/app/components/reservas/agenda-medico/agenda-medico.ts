import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReservaService } from '../../../services/reserva.service';
import { Reserva } from '../../../models/reserva.model';
import { MatFormFieldModule } from '@angular/material/form-field'; 
import { MatInputModule } from '@angular/material/input'; 
import { MatDatepickerModule } from '@angular/material/datepicker'; 
import { provideNativeDateAdapter } from '@angular/material/core';

@Component({
  selector: 'app-agenda-medico',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatDatepickerModule
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './agenda-medico.html',
  styleUrl: './agenda-medico.css',
})
export class AgendaMedico implements OnInit {
  fechaSeleccionada: Date = new Date();
  
  turnos: Reserva[] = [];
  proximosTurnos: any[] = [];
  cargando: boolean = false;
  idMedico: number = 0;
  errorMessage: string = ''; 

  // Filtro que deshabilita los Domingos (0) en el calendario
  filtroDomingos = (d: Date | null): boolean => {
    const dia = (d || new Date()).getDay();
    return dia !== 0; 
  };

  // Función para resaltar en el calendario los días con turnos
  dateClass = (cellDate: Date) => {
    if (!cellDate || !this.proximosTurnos.length) return '';

    const tieneTurno = this.proximosTurnos.some(t => {
      const fechaLimpia = typeof t.fechaHora === 'string' ? t.fechaHora.replace(' ', 'T') : t.fechaHora;
      const fechaTurno = new Date(fechaLimpia);

      return (
        fechaTurno.getFullYear() === cellDate.getFullYear() &&
        fechaTurno.getMonth() === cellDate.getMonth() &&
        fechaTurno.getDate() === cellDate.getDate() &&
        (t.estado?.toUpperCase() === 'ACTIVO' || t.estado?.toUpperCase() === 'CONFIRMADA')
      );
    });

    return tieneTurno ? 'dia-con-turno' : '';
  };    

  constructor(private reservaService: ReservaService) {}

  ngOnInit() {
    this.obtenerIdMedico();
    this.cargarAgenda();
    this.cargarProximosTurnos();
  }

   obtenerIdMedico() {
    const userStr = localStorage.getItem('usuario') || localStorage.getItem('user');
    
    console.log('🔍 1. Contenido de localStorage:', userStr);

    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        console.log('🔍 2. Objeto de usuario parseado:', user);

        // Intenta obtener el ID buscando en idMedico, medico.id, medicoId o id
        this.idMedico = user.idMedico || user.medico?.id || user.medicoId || user.id || 0;

        console.log('🎯 3. ID de Médico final asignado:', this.idMedico);

        if (this.idMedico === 0) {
          console.warn('⚠️ No se encontró ningún ID de médico válido en el objeto del usuario.');
        }
      } catch (e) {
        console.error('❌ Error al parsear JSON del localStorage:', e);
      }
    } else {
      console.warn('⚠️ No existe "usuario" ni "user" en localStorage. ¡Hacé Login de nuevo!');
    }
  }

  cargarAgenda() {
    if (!this.idMedico) {
      console.warn('⚠️ No se puede cargar la agenda: idMedico es 0.');
      return;
    }

    if (!this.fechaSeleccionada) return;

    // Formato local YYYY-MM-DD sin desfasaje UTC
    const d = new Date(this.fechaSeleccionada);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const fechaFormatted = `${year}-${month}-${day}`;

    console.log(`📡 Solicitando agenda para ID Médico ${this.idMedico} en la fecha ${fechaFormatted}...`);

    this.cargando = true;

    this.reservaService.obtenerAgendaMedico(this.idMedico, fechaFormatted).subscribe({
      next: (data) => {
        console.log('📦 Turnos de la fecha recibidos:', data);
        this.turnos = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('❌ Error al cargar la agenda:', err);
        this.cargando = false;
      }
    });
  }

  marcarEstado(idTurno: number, nuevoEstado: 'ATENDIDO' | 'AUSENTE') {
    if (!confirm(`¿Confirmás marcar el turno como ${nuevoEstado}?`)) return;

    this.reservaService.cambiarEstadoTurno(idTurno, nuevoEstado).subscribe({
      next: () => {
        alert(`Turno marcado como ${nuevoEstado} con éxito.`);
        this.cargarAgenda();
        this.cargarProximosTurnos();
      },
      error: (err) => {
        alert(err.error?.message || 'Error al actualizar el estado del turno.');
      }
    });
  }

  cargarProximosTurnos(): void {
    if (!this.idMedico) return;

    this.reservaService.getProximosTurnos(this.idMedico).subscribe({
      next: (data) => {
        this.proximosTurnos = data;
      },
      error: (err) => console.error('Error al cargar próximos turnos:', err)
    });
  }
}