import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgendaMedico } from './agenda-medico';

describe('AgendaMedico', () => {
  let component: AgendaMedico;
  let fixture: ComponentFixture<AgendaMedico>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgendaMedico],
    }).compileComponents();

    fixture = TestBed.createComponent(AgendaMedico);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
