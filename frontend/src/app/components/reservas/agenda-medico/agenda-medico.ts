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
  esAdmin: boolean = false;

  // Filtro que deshabilita los Domingos (0) en el calendario
  filtroDomingos = (d: Date | null): boolean => {
    const dia = (d || new Date()).getDay();
    return dia !== 0; 
  };

  // Función para resaltar en el calendario los días con turnos activos o confirmados
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

  ngOnInit(): void {
    this.detectarRol();
    
    // Si es Administrador, asignamos por defecto el ID 1 para que pueda consultar agendas
    if (this.esAdmin) {
      this.idMedico = 1;
    } else {
      this.obtenerIdMedico();
    }

    this.cargarAgenda();
    this.cargarProximosTurnos();
  }

  // Detectar si el usuario logueado tiene rol de Administrador
  detectarRol(): void {
    const rolLocal = localStorage.getItem('rol') || localStorage.getItem('role');
    if (rolLocal) {
      this.esAdmin = rolLocal.toUpperCase() === 'ADMINISTRADOR' || rolLocal.toUpperCase() === 'ADMIN';
      return;
    }

    const userStr = localStorage.getItem('usuario') || localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        const r = user.rol || user.role || user.tipo;
        if (r) {
          const rolStr = typeof r === 'string' ? r : r.nombre || '';
          this.esAdmin = rolStr.toUpperCase() === 'ADMINISTRADOR' || rolStr.toUpperCase() === 'ADMIN';
        }
      } catch (e) {}
    }
  }

  // Extraer el ID del Médico logueado desde localStorage (cuando es un Médico)
  obtenerIdMedico(): void {
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

  // Cargar turnos del día seleccionado para el idMedico
  cargarAgenda(): void {
    if (!this.idMedico) {
      console.warn('⚠️ No se puede cargar la agenda: idMedico es 0.');
      this.turnos = [];
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
        this.errorMessage = err.error?.message || 'Error al cargar la agenda del médico.';
        this.cargando = false;
      }
    });
  }

  // Método para que el Médico marque el turno como ATENDIDO o AUSENTE
  marcarEstado(idTurno: number, nuevoEstado: 'ATENDIDO' | 'AUSENTE'): void {
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

  // Método para que el Administrador cancele un turno desde la agenda
  cancelarReserva(idReserva: number): void {
    if (!confirm('¿Está seguro de que desea cancelar esta reserva?')) return;

    this.reservaService.cancelarReserva(idReserva).subscribe({
      next: () => {
        alert('Reserva cancelada con éxito.');
        this.cargarAgenda();
        this.cargarProximosTurnos();
      },
      error: (err) => {
        alert(err.error?.message || 'No se pudo cancelar la reserva.');
      }
    });
  }

  // Cargar próximos turnos para resaltar días en el calendario
  cargarProximosTurnos(): void {
    if (!this.idMedico) {
      this.proximosTurnos = [];
      return;
    }

    const servicio = this.reservaService as any;
    const metodo = servicio.obtenerProximosTurnos || servicio.getProximosTurnos;

    if (metodo) {
      metodo.call(this.reservaService, this.idMedico).subscribe({
        next: (data: any) => {
          this.proximosTurnos = data;
        },
        error: (err: any) => console.error('Error al cargar próximos turnos:', err)
      });
    }
  }
}