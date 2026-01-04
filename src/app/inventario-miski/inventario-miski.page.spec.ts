import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InventarioMiskiPage } from './inventario-miski.page';

describe('InventarioMiskiPage', () => {
  let component: InventarioMiskiPage;
  let fixture: ComponentFixture<InventarioMiskiPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(InventarioMiskiPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
