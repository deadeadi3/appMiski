import { ComponentFixture, TestBed } from '@angular/core/testing';
import {ReporteePage }from "./reportee.page";


describe('Reporte1Page', () => {
  let component: ReporteePage;
  let fixture: ComponentFixture<ReporteePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReporteePage],
    }).compileComponents();

    fixture = TestBed.createComponent(ReporteePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});