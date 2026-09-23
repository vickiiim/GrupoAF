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

        // 1. Obtener el Token (soporta access_token, accessToken o token)
        const token = res.access_token || res.accessToken || res.token;

        if (token) {
          localStorage.setItem('token', token);
        } else {
          this.errorMessage = 'El servidor no devolvió un token de acceso válido.';
          return;
        }

        // 2. Obtener el ID del usuario (si no viene en el body, lo decodificamos del JWT)
        let userId = res.usuario?.id || res.user?.id || res.userId || res.id;

        if (!userId && token) {
          try {
            // NestJS guarda habitualmente el ID del usuario en el campo 'sub' del JWT
            const payloadBase64 = token.split('.');
            const decodedJson = atob(payloadBase64);
            const decoded = JSON.parse(decodedJson);
            userId = decoded.sub || decoded.id || decoded.userId;
          } catch (e) {
            console.error('Error al decodificar JWT:', e);
          }
        }

        if (userId) {
          localStorage.setItem('userId', userId.toString());
        }

        // 3. Redirigir a Mis Turnos
        this.router.navigate(['/reservas/mis-turnos']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Credenciales inválidas o usuario inactivo.';
      }
    });
  }
}
