import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController, AlertController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HistorialService, Movimiento } from '../services/historial.service';
import { UserProfileService } from '../services/user-profile.service'; // <--- NUEVO IMPORT

@Component({
  selector: 'app-movimientos',
  templateUrl: './movimientos.page.html',
  styleUrls: ['./movimientos.scss'], // Asegúrate que coincida (movimientos.page.scss o movimientos.scss)
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class MovimientosPage implements OnInit {

  // --- TUS VARIABLES ORIGINALES ---
  listaCompleta: Movimiento[] = []; 
  listaVisual: Movimiento[] = [];   
  textoBuscar: string = '';
  filtroTipo: string = 'Todos'; 

  // --- NUEVA VARIABLE PARA EL HEADER ---
  avatarUrl: string = 'assets/icon/login.png';

  // Inyectamos el servicio de perfil además de los tuyos
  private userProfileService = inject(UserProfileService);

  constructor(
    private historialService: HistorialService,
    private navCtrl: NavController,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    // 1. CARGAR HISTORIAL (TU LÓGICA)
    this.historialService.obtenerMovimientos().subscribe(datos => {
      this.listaCompleta = datos;
      this.aplicarFiltros();
    });

    // 2. CARGAR AVATAR (NUEVA LÓGICA)
    this.userProfileService.userProfile$.subscribe(profile => {
      if (profile && profile.photoURL) {
        this.avatarUrl = profile.photoURL;
      }
    });
  }

  // --- TUS FUNCIONES DE FILTRO Y LÓGICA ---

  aplicarFiltros() {
    this.listaVisual = this.listaCompleta.filter(item => {
      const coincideTexto = item.producto.toLowerCase().includes(this.textoBuscar.toLowerCase());
      const coincideTipo = this.filtroTipo === 'Todos' || item.accion === this.filtroTipo;
      return coincideTexto && coincideTipo;
    });
  }

  cambiarFiltro(tipo: string) {
    this.filtroTipo = tipo;
    this.aplicarFiltros();
  }

  async confirmarBorrado() {
    console.log("Clic en borrar detectado");
    const alert = await this.alertController.create({
      header: '¿Borrar historial?',
      message: 'Se eliminarán todos los registros. Esta acción no se puede deshacer.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { 
          text: 'Sí, borrar todo', 
          cssClass: 'danger-button',
          handler: () => {
            this.borrarHistorial();
          }
        }
      ]
    });
    await alert.present();
  }

  async borrarHistorial() {
    try {
      await this.historialService.borrarTodoElHistorial();
    } catch (error) {
      console.error("Error al borrar:", error);
    }
  }

  async verDetalle(item: Movimiento) {
    if (!item.detalles) {
      const alert = await this.alertController.create({
        header: item.producto, message: 'Sin detalles.', buttons: ['OK']
      });
      await alert.present();
      return;
    }
    const mensaje = `📂 Categoría: ${item.detalles.category || 'N/A'}\n🔢 Código: ${item.detalles.code || 'N/A'}\n📦 Stock: ${item.detalles.stock || 0}\n📝 Nota: ${item.detalles.description || ''}`;
    
    const alert = await this.alertController.create({
      header: item.producto, subHeader: item.accion, message: mensaje, buttons: ['Cerrar'], cssClass: 'alerta-detalles'
    });
    await alert.present();
  }

  // --- FUNCIONES DE NAVEGACIÓN DEL HEADER ---

  // Renombrado a irAlPerfil para coincidir con el HTML del Header
  irAlPerfil() {
    this.navCtrl.navigateForward('/perfil-miski');
  }

  // Nueva función requerida por el Header
  irAlInicio() {
    this.navCtrl.navigateBack('/button'); // Redirige a tu home real
  }
}