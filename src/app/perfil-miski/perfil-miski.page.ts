import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController, LoadingController, ToastController } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { UserProfileService, UserProfile } from '../services/user-profile.service';
import { AuthService } from '../services/auth.service';
import { addIcons } from 'ionicons';
import { 
  personOutline, mailOutline, callOutline, locationOutline, 
  createOutline, logOutOutline, cameraOutline, lockClosedOutline,
  checkmarkCircle, alertCircle, chevronForwardOutline, closeCircle
} from 'ionicons/icons';
import { EditarDatosModalComponent } from './editar-datos-modal.component';
import { CambiarPasswordModalComponent } from './cambiar-password-modal.component';

@Component({
  selector: 'app-perfil-miski',
  templateUrl: './perfil-miski.page.html',
  styleUrls: ['./perfil-miski.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule]
})
export class PerfilMiskiPage implements OnInit {
  
  private router = inject(Router);
  private userProfileService = inject(UserProfileService);
  private authService = inject(AuthService);
  
  // Imagen por defecto
  avatarUrl: string = 'assets/icon/login.png'; 
  
  // Datos del perfil
  userProfile: UserProfile | null = null;

  constructor(
    private modalController: ModalController,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {
    addIcons({ 
      personOutline, mailOutline, callOutline, locationOutline, 
      createOutline, logOutOutline, cameraOutline, lockClosedOutline,
      checkmarkCircle, alertCircle, chevronForwardOutline, closeCircle
    });
  }

  ngOnInit() {
    // SUSCRIPCIÓN CLAVE
    this.userProfileService.userProfile$.subscribe(profile => {
      this.userProfile = profile;
      
      // --- CORRECCIÓN: Actualizamos la variable avatarUrl explícitamente ---
      if (profile && profile.photoURL) {
        this.avatarUrl = profile.photoURL;
        console.log("Foto actualizada en perfil:", this.avatarUrl.substring(0, 30) + "...");
      }
      // --------------------------------------------------------------------
    });
  }

  // --- NAVEGACIÓN ---
  
  irAlInicio() {
    this.router.navigate(['/button']);
  }

  irAlPerfil() {
    // Ya estás aquí
  }

  // --- ACCIONES ---

  async logout() {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }

  async abrirEditarDatos() {
    const modal = await this.modalController.create({
      component: EditarDatosModalComponent,
      componentProps: { 
        // Pasamos una copia
        userProfile: this.userProfile ? { ...this.userProfile } : null 
      }
    });
    await modal.present();
    // No hace falta recargar, el servicio lo hará solo
  }

  async abrirCambiarPassword() {
    const modal = await this.modalController.create({
      component: CambiarPasswordModalComponent
    });
    await modal.present();
  }
}