import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonicModule, ModalController, LoadingController, ToastController, ActionSheetController } from '@ionic/angular';
import { UserProfileService, UserProfile } from '../services/user-profile.service';
import { addIcons } from 'ionicons';
import { closeOutline, saveOutline, personOutline, imageOutline, cameraOutline, imagesOutline } from 'ionicons/icons';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Component({
  selector: 'app-editar-datos-modal',
  templateUrl: './editar-datos-modal.component.html',
  styleUrls: ['./editar-datos-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule]
})
export class EditarDatosModalComponent {
  @Input() userProfile!: UserProfile;

  formulario: FormGroup;
  private userProfileService = inject(UserProfileService);
  imagenPreview: string | null = null;

  constructor(
    private modalController: ModalController,
    private fb: FormBuilder,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private actionSheetController: ActionSheetController
  ) {
    addIcons({ closeOutline, saveOutline, personOutline, imageOutline, cameraOutline, imagesOutline });
    
    // 1. FORMULARIO ADAPTADO A TUS CAMPOS
    this.formulario = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellidos: ['', [Validators.required, Validators.minLength(2)]],
      photoURL: [''] 
    });
  }

  ngOnInit() {
    if (this.userProfile) {
      // 2. CARGAMOS TUS DATOS REALES
      this.formulario.patchValue({
        nombre: this.userProfile.nombre,
        apellidos: this.userProfile.apellidos,
        photoURL: this.userProfile.photoURL
      });
      this.imagenPreview = this.userProfile.photoURL || 'assets/icon/login.png';
    }
  }

  async seleccionarOrigenImagen() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Cambiar Foto de Perfil',
      buttons: [
        {
          text: 'Tomar Foto',
          icon: 'camera-outline',
          handler: () => { this.procesarCamara(CameraSource.Camera); }
        },
        {
          text: 'Elegir de Galería',
          icon: 'images-outline',
          handler: () => { this.procesarCamara(CameraSource.Photos); }
        },
        { text: 'Cancelar', icon: 'close-outline', role: 'cancel' }
      ]
    });
    await actionSheet.present();
  }

  async procesarCamara(source: CameraSource) {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: source
      });

      if (image.dataUrl) {
        this.imagenPreview = image.dataUrl;
        this.formulario.patchValue({ photoURL: image.dataUrl });
      }
    } catch (error) {
      console.log('Cancelado', error);
    }
  }

  cerrar() {
    this.modalController.dismiss();
  }

  async guardar() {
    if (this.formulario.invalid) {
      this.mostrarToast('Completa nombre y apellidos', 'warning');
      return;
    }

    const loading = await this.loadingController.create({ message: 'Guardando...' });
    await loading.present();

    try {
      // 3. ENVIAMOS LOS DATOS A FIRESTORE
      await this.userProfileService.updateUserProfile(this.formulario.value);
      
      loading.dismiss();
      this.mostrarToast('Perfil actualizado', 'success');
      this.modalController.dismiss({ actualizado: true });
      
    } catch (error) {
      console.error(error);
      loading.dismiss();
      this.mostrarToast('Error al guardar', 'danger');
    }
  }

  async mostrarToast(mensaje: string, color: string) {
    const toast = await this.toastController.create({ message: mensaje, duration: 2000, color: color, position: 'bottom' });
    toast.present();
  }
}