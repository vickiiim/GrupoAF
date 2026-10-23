import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('debe llamar al login con una ruta relativa /api/auth', () => {
    service.login({ email: 'admin@clinica.com', clave: '123456' }).subscribe();

    const req = httpMock.expectOne('/api/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.url).not.toContain('localhost:3000');
    req.flush({ accessToken: 'fake-token', usuario: { id: 1, rol: 'ADMINISTRADOR' } });
  });

  it('debe guardar el token en el localStorage al iniciar sesión', () => {
    service.login({ email: 'admin@clinica.com', clave: '123456' }).subscribe();

    const req = httpMock.expectOne('/api/auth/login');
    req.flush({ accessToken: 'fake-token', usuario: { id: 1, rol: 'ADMINISTRADOR' } });

    expect(localStorage.getItem('token')).toBe('fake-token');
    expect(service.isLoggedIn()).toBe(true);
    expect(service.getRole()).toBe('ADMINISTRADOR');
  });

  it('debe limpiar la sesión al hacer logout', () => {
    localStorage.setItem('token', 'fake-token');
    localStorage.setItem('usuario', JSON.stringify({ rol: 'MEDICO' }));

    service.logout();

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('usuario')).toBeNull();
    expect(service.isLoggedIn()).toBe(false);
  });
});
