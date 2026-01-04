import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PerfilMiskiPage } from './perfil-miski.page';
import { AlertController, ToastController, IonicModule } from '@ionic/angular';
// Importante: Si usas routerLink, necesitas RouterTestingModule o proveer ActivatedRoute
import { RouterTestingModule } from '@angular/router/testing'; 

describe('PerfilMiskiPage', () => {
  let component: PerfilMiskiPage;
  let fixture: ComponentFixture<PerfilMiskiPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // Como es componente standalone, lo importamos, no lo declaramos
      imports: [PerfilMiskiPage, IonicModule.forRoot(), RouterTestingModule],
      providers: [AlertController, ToastController] // Proveedores necesarios
    }).compileComponents();

    fixture = TestBed.createComponent(PerfilMiskiPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});