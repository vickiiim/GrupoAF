import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearReserva } from './crear-reserva';

describe('CrearReserva', () => {
  let component: CrearReserva;
  let fixture: ComponentFixture<CrearReserva>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearReserva],
    }).compileComponents();

    fixture = TestBed.createComponent(CrearReserva);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
