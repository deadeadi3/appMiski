import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonList,
  IonItem,
  IonInput,
  IonButton,
  NavController,
  LoadingController,
  AlertController
} from '@ionic/angular/standalone';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonList,
    IonItem,
    IonInput,
    IonButton,
    CommonModule,
    FormsModule
  ]
})
export class RegistroPage {
  nombre = '';
  apellidos = '';
  usuario = '';
  dni = '';
  email = '';
  contrasena = '';

  constructor(
    private navCtrl: NavController,
    private authService: AuthService,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) {}

  async onRegistro() {
    // 1️⃣ Validar campos vacíos
    if (!this.nombre || !this.apellidos || !this.usuario || !this.dni || !this.email || !this.contrasena) {
      await this.mostrarAlerta('Error', 'Por favor completa todos los campos');
      return;
    }

    // 2️⃣ Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      await this.mostrarAlerta('Error', 'Por favor ingresa un email válido');
      return;
    }

    // 3️⃣ Validar longitud de contraseña
    if (this.contrasena.length < 6) {
      await this.mostrarAlerta('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    // 4️⃣ Validar DNI (8 dígitos)
    if (this.dni.length !== 8 || isNaN(Number(this.dni))) {
      await this.mostrarAlerta('Error', 'El DNI debe tener 8 dígitos numéricos');
      return;
    }

    // 5️⃣ Mostrar loading
    const loading = await this.loadingCtrl.create({
      message: 'Registrando usuario...',
      spinner: 'crescent'
    });
    await loading.present();

    // 6️⃣ Intentar registrar
    try {
      const exito = await this.authService.registrarUsuario(
        this.nombre,
        this.apellidos,
        this.usuario,
        this.dni,
        this.email,
        this.contrasena
      );

      await loading.dismiss();

      if (exito) {
        // Registro exitoso
        const alert = await this.alertCtrl.create({
          header: '✅ Registro exitoso',
          message: 'Tu cuenta ha sido creada correctamente. Ya puedes iniciar sesión.',
          buttons: [{
            text: 'Ir a Login',
            handler: () => {
              // Limpiar formulario
              this.limpiarFormulario();
              // Navegar al login
              this.navCtrl.navigateBack('/login');
            }
          }]
        });
        await alert.present();
      }

    } catch (error: any) {
      await loading.dismiss();
      
      // 7️⃣ Manejar errores específicos de Firebase
      let mensaje = 'No se pudo crear la cuenta. Intenta nuevamente.';
      
      if (error.code === 'auth/email-already-in-use') {
        mensaje = '❌ Este email ya está registrado.\n\n¿Ya tienes cuenta? Ve a la página de login.\n\nO usa otro email para registrarte.';
      } else if (error.code === 'auth/invalid-email') {
        mensaje = '❌ El formato del email no es válido';
      } else if (error.code === 'auth/weak-password') {
        mensaje = '❌ La contraseña es muy débil. Debe tener al menos 6 caracteres';
      } else if (error.code === 'auth/network-request-failed') {
        mensaje = '❌ Error de conexión. Verifica tu internet';
      } else if (error.code === 'auth/too-many-requests') {
        mensaje = '❌ Demasiados intentos. Espera un momento e intenta de nuevo';
      } else {
        mensaje = `❌ Error: ${error.message}`;
      }

      await this.mostrarAlerta('Error de Registro', mensaje);
      
      console.error('Error completo:', error);
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

  limpiarFormulario() {
    this.nombre = '';
    this.apellidos = '';
    this.usuario = '';
    this.dni = '';
    this.email = '';
    this.contrasena = '';
  }

  irACrearCuenta() {
    this.navCtrl.navigateForward('/login');
  }
}