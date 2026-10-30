import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 1. Buscamos el token en las posibles claves de localStorage
  let token = localStorage.getItem('token') || 
              localStorage.getItem('access_token') || 
              localStorage.getItem('jwt');

  // Si no está suelto, buscamos si está dentro de un objeto guardado
  if (!token) {
    const userStr = localStorage.getItem('user') || localStorage.getItem('usuario');
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        token = u.token || u.access_token;
      } catch (e) {}
    }
  }

  // Si no hay token, al login
  if (!token) {
    console.warn('⛔ authGuard: No se encontró token en localStorage. Redirigiendo a login.');
    router.navigate(['/login']);
    return false;
  }

  const expectedRoles: string[] = route.data?.['roles'];

  // Si la ruta no exige roles específicos, se permite el acceso directo
  if (!expectedRoles || expectedRoles.length === 0) {
    return true;
  }

  // 2. Extraer rol: probamos AuthService primero
  let userRole = authService.getRole ? authService.getRole() : null;

  // Si no lo dio el service, decodificamos el payload del JWT
  if (!userRole && token.includes('.')) {
    try {
      const segmentos = token.split('.');
      if (segmentos.length >= 2) {
        const rawPayload = atob(segmentos[1]);
        const payload = JSON.parse(rawPayload);
        userRole = payload.rol || payload.role || payload.usuario?.rol || payload.usuario?.role;
      }
    } catch (e) {
      console.error('Error al decodificar token en authGuard:', e);
    }
  }

  const rol = (userRole || '').toString().toUpperCase().trim();
  console.log(`🔍 authGuard verificando ruta "${state.url}" -> Rol detectado: "${rol}", Roles permitidos:`, expectedRoles);

  // 3. Comprobamos si tiene permiso
  const esAdmin = rol === 'ADMIN' || rol === 'ADMINISTRADOR';

  const tienePermiso = expectedRoles.some((exp) => {
    const esperado = exp.toUpperCase().trim();
    if (esperado === 'ADMIN' || esperado === 'ADMINISTRADOR') {
      return esAdmin;
    }
    return esperado === rol;
  });

  if (!tienePermiso) {
    alert(`⛔ Acceso Denegado: No tienes permisos para acceder a esta sección.\nTu rol es: ${rol || 'Desconocido'}`);

    // Redirige según el rol para evitar bucles hacia rutas no permitidas
    if (esAdmin) {
      router.navigate(['/medicos']);
    } else if (rol === 'MEDICO') {
      router.navigate(['/reservas/agenda-medico']);
    } else {
      router.navigate(['/reservas/mis-turnos']);
    }

    return false;
  }

  return true;
};