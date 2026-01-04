import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent,
  IonButton, 
  IonButtons,
  IonIcon
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  cubeOutline, 
  personOutline, 
  barChartOutline, 
  gitCompareOutline,
  menuOutline, 
  searchOutline 
} from 'ionicons/icons';
import { UserProfileService } from '../services/user-profile.service'; // <--- IMPORTANTE

@Component({
  selector: 'app-button',
  templateUrl: 'button.page.html',
  styleUrls: ['button.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonContent,
    IonButton, 
    IonButtons,
    IonIcon
  ],
})
export class ButtonPage {
  
  private router = inject(Router);
  private userProfileService = inject(UserProfileService); 
  avatarUrl: string = 'assets/icon/login.png';

  constructor() {
    addIcons({
      cubeOutline,
      personOutline,
      barChartOutline,
      gitCompareOutline,
      menuOutline,
      searchOutline
    });
  }

  ngOnInit() {
    // ESTO HACE LA MAGIA: Escucha cambios en tiempo real
    this.userProfileService.userProfile$.subscribe(profile => {
      if (profile && profile.photoURL) {
        this.avatarUrl = profile.photoURL;
      }
    });
  }

  // --- Funciones de Navegación ---

  irAlInicio() {
    this.router.navigate(['/home-miski']);
  }

  irAlPerfil() {
    this.router.navigate(['/perfil-miski']);
  }

  // Compatible con tu HTML anterior si usaba aPerfil
  aPerfil() {
    this.irAlPerfil();
  }

  iraInventario() {
    this.router.navigate(['/inventario-miski']);
  }

  iraReporte() {
    this.router.navigate(['/reportee']);
  }

  irMovimientos() {
    this.router.navigate(['/movimientos-miski']);
  }
  
  // Compatible con posible nombre anterior
  iraMovimientos() {
    this.irMovimientos();
  }

  // Función dummy para el click en content
  hideRecentSearches() {
    // Ya no se usa la búsqueda aquí, pero evita errores si el HTML lo llama
  }
}