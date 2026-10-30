import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { ReservaService } from './reserva.service';

describe('ReservaService', () => {
  let service: ReservaService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(ReservaService);
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

  it('debe crear la reserva con una ruta relativa /api/v1/reservas', () => {
    service.crearReserva({ idMedico: 1, idPaciente: 2, fechaHora: '2026-10-15T09:00:00.000Z' }).subscribe();

    const req = httpMock.expectOne('/api/v1/reservas');
    expect(req.request.method).toBe('POST');
    expect(req.request.url).not.toContain('localhost:3000');
    req.flush({});
  });

  it('debe obtener las reservas del paciente con una ruta relativa', () => {
    service.obtenerReservasPorPaciente(7).subscribe();

    const req = httpMock.expectOne('/api/v1/reservas/paciente/7');
    expect(req.request.method).toBe('GET');
    expect(req.request.url).not.toContain('localhost:3000');
    req.flush([]);
  });

  it('debe enviar el token JWT en el encabezado Authorization', () => {
    localStorage.setItem('token', 'fake-token');

    service.obtenerAgendaMedico(3, '2026-10-15').subscribe();

    const req = httpMock.expectOne('/api/v1/reservas/medico/3/agenda?fecha=2026-10-15');
    expect(req.request.headers.get('Authorization')).toBe('Bearer fake-token');
    req.flush([]);
  });
});
