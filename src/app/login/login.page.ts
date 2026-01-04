import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar,
  IonItem, IonLabel, IonInput, IonButton, 
  NavController, LoadingController, AlertController
} from '@ionic/angular/standalone';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, 
    IonItem, IonLabel, IonInput, IonButton,
    CommonModule, FormsModule
  ]
})
export class LoginPage {
  email: string = '';
  contrasena: string = '';

  constructor(
    private navCtrl: NavController,
    private authService: AuthService,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) {}

  //Funcion asincrona
  async onLogin() {
    // Validar campos vacíos
    if (!this.email || !this.contrasena) {
      await this.mostrarAlerta('Error', 'Por favor ingresa tu email y contraseña');
      return;
    }

    // Mostrar loading
    const loading = await this.loadingCtrl.create({
      message: 'Iniciando sesión...',
      spinner: 'crescent'
    });
    
    await loading.present();

    // Intentar login
    const valido = await this.authService.loginUsuario(this.email, this.contrasena);

    await loading.dismiss();

    if (valido) {
      const user = this.authService.getCurrentUser();
      if (user) {
        const userData = await this.authService.getUserData(user.uid);
        await this.mostrarAlerta('✅ Bienvenido', `Hola ${userData?.['nombre'] || 'Usuario'}`);
        this.navCtrl.navigateForward('/button');  // ← Navega a /button
      }
    } else {
      await this.mostrarAlerta('❌ Error', 'Email o contraseña incorrectos, o usuario inactivo');
    }
  }

  async mostrarAlerta(titulo: string, mensaje: string) {
    const alert = await this.alertCtrl.create({
      header: titulo,
      message: mensaje,
      buttons: ['OK']
    });
    await alert.present();
  }

  irACrearCuenta() {
    this.navCtrl.navigateForward('/registro');
  }
}