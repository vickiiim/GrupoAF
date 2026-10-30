import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { CrearReserva } from './components/reservas/crear-reserva/crear-reserva';
import { MisReservas } from './components/reservas/mis-reservas/mis-reservas';
import { AgendaMedico } from './components/reservas/agenda-medico/agenda-medico';
import { MedicosComponent } from './components/medicos/medicos.component';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },

  // 1. Pacientes y Administradores
  { 
    path: 'reservas/nueva', 
    component: CrearReserva, 
    canActivate: [authGuard],
    data: { roles: ['PACIENTE', 'ADMINISTRADOR', 'ADMIN'] } 
  },
  { 
    path: 'reservas/mis-turnos', 
    component: MisReservas, 
    canActivate: [authGuard],
    data: { roles: ['PACIENTE', 'ADMINISTRADOR', 'ADMIN'] } 
  },

  // 2. Médicos y Administradores (Permite al Admin supervisar la agenda)
  { 
    path: 'reservas/agenda', 
    component: AgendaMedico, 
    canActivate: [authGuard],
    data: { roles: ['MEDICO', 'ADMINISTRADOR', 'ADMIN'] } 
  },

  // 3. Solo Administradores
  { 
    path: 'medicos', 
    component: MedicosComponent, 
    canActivate: [authGuard],
    data: { roles: ['ADMINISTRADOR', 'ADMIN'] } 
  }, 

  { path: '**', redirectTo: 'login' }
];