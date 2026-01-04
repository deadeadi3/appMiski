import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { IonicModule, AlertController, ToastController, ModalController, ActionSheetController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { EditarDatosModalComponent } from './editar-datos-modal.component';
import { CambiarPasswordModalComponent } from './cambiar-password-modal.component';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Auth, updatePassword, User, signOut } from '@angular/fire/auth';
import { Firestore, doc, getDoc, updateDoc, setDoc } from '@angular/fire/firestore';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import { UserProfileService } from '../services/user-profile.service';
import { HeaderMiskiComponent } from '../header-miski/header-miski.component';

@Component({
  selector: 'app-perfil-miski',
  templateUrl: './perfil-miski.page.html',
  styleUrls: ['./perfil-miski.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, RouterModule, CommonModule, HeaderMiskiComponent],
})
export class PerfilMiskiPage implements OnInit {
  notifEnabled = true;
  diasActivos: number = 1;
  
  // Esta es la imagen por defecto si el usuario es nuevo y no tiene foto
  defaultImage = 'https://ionicframework.com/docs/img/demos/avatar.svg';
  
  // Esta variable controla lo que se ve en pantalla
  currentImage: SafeResourceUrl | string = this.defaultImage;

  userData: any = {
    nombre: '',
    apellidos: '',
    dni: '',
    email: '',
    usuario: '',
    activo: true,
    rol: 'Usuario',
    telefono: '',
    foto: null,
    fechaCreacion: null
  };

  private currentUser: User | null = null;

  constructor(
    private alertController: AlertController,
    private toastController: ToastController,
    private router: Router,
    private modalController: ModalController,
    private actionSheetController: ActionSheetController,
    private auth: Auth,
    private firestore: Firestore,
    private storage: Storage,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
    private userProfileService: UserProfileService
  ) {}

  async ngOnInit() {
    // Escuchar el estado de autenticación
    this.auth.onAuthStateChanged(async (user) => {
      if (user) {
        this.currentUser = user;
        console.log('Usuario detectado UID:', user.uid); // Debug
        await this.loadUserData();
      } else {
        this.router.navigate(['/login']);
      }
    });
  }

  // Si la imagen falla (link roto), pone la default
  handleImgError(event: any) {
    event.target.src = this.defaultImage;
  }

  async loadUserData() {
    if (!this.currentUser) return;
    
    // Referencia al documento EXACTO de este usuario (JFlores o Paolo)
    const userDocRef = doc(this.firestore, 'usuarios', this.currentUser.uid);

    try {
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const data = userDoc.data();
        this.userData = { ...this.userData, ...data };
        
        // --- AQUÍ ESTÁ LA SOLUCIÓN DE LA FOTO ---
        if (data['foto'] && data['foto'].trim() !== '') {
          console.log('Foto encontrada en BD:', data['foto']);
          // Importante: Le decimos a Angular que confíe en esta URL guardada
          this.currentImage = this.sanitizer.bypassSecurityTrustResourceUrl(data['foto']);
          // 🔴 ACTUALIZAR EL SERVICIO DE PERFIL PARA QUE SE REFLEJE EN TODOS LOS HEADERS
          this.userProfileService.setAvatar(data['foto']);
        } else {
          // Si no tiene foto, usamos la default
          this.currentImage = this.defaultImage;
          this.userProfileService.setAvatar(this.defaultImage);
        }
        
        this.cdr.detectChanges(); // Actualizar la vista
      } else {
        // Crear perfil si no existe
        this.userData.nombre = this.currentUser.displayName || 'Usuario';
        this.userData.email = this.currentUser.email || '';
        this.userData.fechaCreacion = new Date();
        await setDoc(userDocRef, this.userData);
      }
      this.calcularDiasActivos();
    } catch (error) {
      console.error('Error cargando usuario:', error);
    }
  }

  calcularDiasActivos() {
    if (this.userData.fechaCreacion) {
      const registro = this.userData.fechaCreacion.seconds 
        ? new Date(this.userData.fechaCreacion.seconds * 1000) 
        : new Date(this.userData.fechaCreacion);
      const hoy = new Date();
      const diffTime = Math.abs(hoy.getTime() - registro.getTime());
      this.diasActivos = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
  }

  async verPerfil() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Cambiar Foto de Perfil',
      buttons: [
        {
          text: 'Seleccionar de Galería',
          icon: 'images',
          handler: () => { this.cambiarFoto(CameraSource.Photos); }
        },
        {
          text: 'Tomar Foto',
          icon: 'camera',
          handler: () => { this.cambiarFoto(CameraSource.Camera); }
        },
        {
          text: 'Cancelar',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  async cambiarFoto(source: CameraSource) {
    if (!this.currentUser) return;
    try {
      const image = await Camera.getPhoto({
        quality: 80, // Bajé un poco la calidad para que suba más rápido
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: source
      });

      if (image.dataUrl) {
        // 1. Mostrar instantáneamente mientras sube
        this.currentImage = this.sanitizer.bypassSecurityTrustResourceUrl(image.dataUrl);
        this.cdr.detectChanges();

        const loadingToast = await this.toastController.create({ message: 'Guardando foto...', duration: 1000 });
        loadingToast.present();

        // 2. Subir a Firebase Storage con nombre único
        const fileName = `profile_${this.currentUser.uid}_${Date.now()}.jpg`;
        const storageRef = ref(this.storage, `profiles/${fileName}`);
        
        const response = await fetch(image.dataUrl);
        const blob = await response.blob();
        await uploadBytes(storageRef, blob);
        
        // 3. Obtener URL pública
        const downloadURL = await getDownloadURL(storageRef);
        console.log('Nueva URL generada:', downloadURL);
        
        // 4. GUARDAR EN EL USUARIO ESPECÍFICO (JFlores o Paolo)
        const userDocRef = doc(this.firestore, 'usuarios', this.currentUser.uid);
        await updateDoc(userDocRef, { foto: downloadURL });

        // Actualizar datos locales
        this.userData.foto = downloadURL;
        
        // 🔴 ACTUALIZAR EL SERVICIO DE PERFIL PARA QUE SE REFLEJE EN TODOS LOS HEADERS
        this.userProfileService.setAvatar(downloadURL);
        
        const toast = await this.toastController.create({ message: '📸 Foto actualizada', duration: 2000, color: 'success' });
        toast.present();
      }
    } catch (error) {
      console.error('Error foto:', error);
    }
  }

  // ... Resto de funciones (editarDatos, cambiarPassword, logout) se mantienen igual ...
  async editarDatos() {
    const modal = await this.modalController.create({
      component: EditarDatosModalComponent,
      componentProps: { userData: this.userData }
    });

    modal.onDidDismiss().then(async (data) => {
      if (data.data && this.currentUser) {
        const userDocRef = doc(this.firestore, 'usuarios', this.currentUser.uid);
        await updateDoc(userDocRef, {
          nombre: data.data.nombre,
          apellidos: data.data.apellidos,
          dni: data.data.dni,
          usuario: data.data.usuario,
          telefono: data.data.telefono
        });
        this.userData = { ...this.userData, ...data.data };
        this.cdr.detectChanges();
        const toast = await this.toastController.create({ message: '✅ Datos actualizados', duration: 2000, color: 'success' });
        toast.present();
      }
    });
    return await modal.present();
  }

  async cambiarPassword() {
    const modal = await this.modalController.create({ component: CambiarPasswordModalComponent });
    modal.onDidDismiss().then(async (data) => {
      if (data.data?.success && this.currentUser) {
        try {
          await updatePassword(this.currentUser, data.data.newPassword);
          const toast = await this.toastController.create({ message: '🔒 Contraseña cambiada', duration: 2000, color: 'success' });
          toast.present();
        } catch (error) {
          const toast = await this.toastController.create({ message: '❌ Error al cambiar contraseña', duration: 2000, color: 'danger' });
          toast.present();
        }
      }
    });
    return await modal.present();
  }

  async configurarNotificaciones() {
    this.notifEnabled = !this.notifEnabled;
    const message = this.notifEnabled ? '🔔 Notificaciones ON' : '🔕 Notificaciones OFF';
    const toast = await this.toastController.create({ message, duration: 1000, color: 'dark' });
    toast.present();
  }

  async logout() {
    const alert = await this.alertController.create({
      header: '¿Cerrar sesión?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Salir',
          cssClass: 'danger',
          handler: async () => {
            await signOut(this.auth);
            this.router.navigate(['/login']);
          }
        }
      ]
    });
    await alert.present();
  }
}