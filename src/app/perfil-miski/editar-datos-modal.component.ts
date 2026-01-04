import { Component, Input, OnInit } from '@angular/core';  // ← Agregado OnInit
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-editar-datos-modal',
  templateUrl: './editar-datos-modal.component.html',
  styleUrls: ['./editar-datos-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule]
})
export class EditarDatosModalComponent implements OnInit {
  @Input() userData: any;
  editedData: any;
  constructor(
    private modalController: ModalController,
    private toastController: ToastController
  ) {}
  ngOnInit() {
    this.editedData = { ...this.userData };
  }
  async guardarCambios() {
    if (!this.editedData.nombre || !this.editedData.email) {
      const toast = await this.toastController.create({
        message: '❌ Completa nombre y email',
        duration: 2000,
        position: 'bottom',
        color: 'danger'
      });
      toast.present();
      return;
    }
    this.modalController.dismiss(this.editedData);
  }
  cerrarModal() {
    this.modalController.dismiss();
  }
}