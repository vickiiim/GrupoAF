import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';   
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';     
import { MedicosService } from '../../services/medicos.service'; 

@Component({
  selector: 'app-medicos',
  standalone: true,                               
  imports: [CommonModule, RouterLink, FormsModule], // 👈 Agregado FormsModule
  templateUrl: './medicos.component.html',
  styleUrls: ['./medicos.component.css'],                                
})
export class MedicosComponent implements OnInit {
  medicos: any[] = [];
  esAdmin: boolean = false; 

  constructor(private medicosService: MedicosService) {}

  ngOnInit(): void {
    this.verificarRol();
    this.cargarMedicos();
  }

  // Comprueba si el usuario logueado tiene rol de Administrador
  verificarRol(): void {
    let token = localStorage.getItem('token') || localStorage.getItem('access_token') || localStorage.getItem('jwt');
    
    if (!token) {
      const userStr = localStorage.getItem('user') || localStorage.getItem('usuario');
      if (userStr) {
        try {
          const u = JSON.parse(userStr);
          token = u.token || u.access_token;
        } catch (e) {}
      }
    }

    if (token && token.includes('.')) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        // Detecta el rol sin importar si viene suelto o adentro de usuario
        const rolDetectado = (
          payload.rol || 
          payload.role || 
          payload.usuario?.rol || 
          payload.usuario?.role || 
          ''
        ).toString().toUpperCase().trim();

        this.esAdmin = rolDetectado === 'ADMINISTRADOR' || rolDetectado === 'ADMIN';
        console.log('🛡️ Rol detectado en MedicosComponent:', rolDetectado, '| esAdmin:', this.esAdmin);
      } catch (e) {
        console.error('Error al decodificar token en MedicosComponent:', e);
        this.esAdmin = false;
      }
    } else {
      this.esAdmin = false;
    }
  }

  cargarMedicos(): void {
    this.medicosService.obtenerMedicos().subscribe({
      next: (data: any) => {
        console.log('📌 DATOS RECIBIDOS EN ANGULAR:', data);

        if (Array.isArray(data)) {
          this.medicos = data;
        } else if (data && Array.isArray(data.data)) {
          this.medicos = data.data;
        } else if (data && Array.isArray(data.medicos)) {
          this.medicos = data.medicos;
        } else {
          this.medicos = [];
        }
      },
      error: (err) => {
        console.error('Error al cargar la lista de médicos:', err);
      }
    });
  }

  actualizarTarifa(medico: any, input: HTMLInputElement): void {
    const nuevoValor = Number(input.value);

    if (isNaN(nuevoValor) || nuevoValor <= 0) {
      alert('Por favor ingrese un monto válido');
      return;
    }

    this.medicosService.actualizarTarifa(medico.id, nuevoValor).subscribe({
      next: () => {
        medico.valor_consulta = nuevoValor;
        medico.valorConsulta = nuevoValor;
        alert(`Tarifa actualizada con éxito a $${nuevoValor}`);
      },
      error: (err) => {
        console.error('Error al actualizar la tarifa:', err);
        const msj = err.error?.message || 'Error al actualizar la tarifa. Verifique permisos de administrador.';
        alert(Array.isArray(msj) ? msj.join(', ') : msj);
      }
    });
  }
}
