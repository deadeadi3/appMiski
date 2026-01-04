import { Component } from '@angular/core';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cambiar-password-modal',
  templateUrl: './cambiar-password-modal.component.html',
  styleUrls: ['./cambiar-password-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule]
})
export class CambiarPasswordModalComponent {
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';

  // Contraseña mockeada (en producción, verifica con backend)
  mockCurrentPassword = 'password123';

  constructor(
    private modalController: ModalController,
    private toastController: ToastController
  ) {}

  async cambiarPassword() {
    // Validaciones
    if (this.currentPassword !== this.mockCurrentPassword) {
      const toast = await this.toastController.create({
        message: '❌ Contraseña actual incorrecta',
        duration: 2000,
        position: 'bottom',
        color: 'danger'
      });
      toast.present();
      return;
    }

    if (this.newPassword.length < 6) {
      const toast = await this.toastController.create({
        message: '❌ La nueva contraseña debe tener al menos 6 caracteres',
        duration: 2000,
        position: 'bottom',
        color: 'danger'
      });
      toast.present();
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      const toast = await this.toastController.create({
        message: '❌ Las contraseñas no coinciden',
        duration: 2000,
        position: 'bottom',
        color: 'danger'
      });
      toast.present();
      return;
    }

    // Simula cambio (en producción, envía a backend)
    console.log('Contraseña cambiada a:', this.newPassword);

    // Cierra el modal con éxito
    this.modalController.dismiss({ success: true });
  }

  cerrarModal() {
    this.modalController.dismiss();
  }
}