
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  errorMessage: string = '';
  loading: boolean = false;

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    clave: ['', [Validators.required, Validators.minLength(4)]]
  });

onSubmit(): void {
  if (this.loginForm.invalid) {
    this.loginForm.markAllAsTouched();
    return;
  }

  this.loading = true;
  this.errorMessage = '';

  this.authService.login(this.loginForm.value).subscribe({
    next: (res: any) => {
      this.loading = false;
      console.log('Respuesta del backend en Login:', res);

      // 1. Obtener el Token
      const token = res.access_token || res.accessToken || res.token;

      if (token) {
        localStorage.setItem('token', token);
      } else {
        this.errorMessage = 'El servidor no devolvió un token de acceso válido.';
        return;
      }

      // 2. Decodificar de forma segura el payload del JWT (segunda parte del token)
      let payload: any = {};
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          // Reemplazamos caracteres de Base64Url a Base64 estándar
          const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(
            window
              .atob(base64)
              .split('')
              .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          );
          payload = JSON.parse(jsonPayload);
        }
      } catch (e) {
        console.error('Error al decodificar JWT:', e);
      }

      // 3. Armar el objeto de usuario priorizando la respuesta del backend o el JWT
      const usuario = res.usuario || res.user || {
        id: res.userId || res.id || payload.sub || payload.id,
        rol: res.rol || payload.rol,
        idMedico: res.idMedico || payload.idMedico || payload.id
      };

      localStorage.setItem('usuario', JSON.stringify(usuario));

      if (usuario.id) {
        localStorage.setItem('userId', usuario.id.toString());
      }

      // 4. Redirigir según el ROL
      const rolUsuario = usuario.rol || payload.rol;

      if (rolUsuario === 'MEDICO') {
        this.router.navigate(['/reservas/agenda']);
      } else {
        this.router.navigate(['/reservas/mis-turnos']);
      }
    },
    error: (err) => {
      this.loading = false;
      this.errorMessage = err.error?.message || 'Credenciales inválidas o usuario inactivo.';
    }
  });
  }
}