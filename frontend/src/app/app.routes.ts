import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';

import { CrearReserva } from './components/reservas/crear-reserva/crear-reserva';
import { MisReservas } from './components/reservas/mis-reservas/mis-reservas';
import { AgendaMedico } from './components/reservas/agenda-medico/agenda-medico';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },

  { path: 'reservas/nueva', component: CrearReserva },
  { path: 'reservas/mis-turnos', component: MisReservas },
  { path: 'reservas/agenda', component: AgendaMedico },

  { path: '**', redirectTo: 'login' }
];
