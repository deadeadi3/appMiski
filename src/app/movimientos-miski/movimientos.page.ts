import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController, AlertController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HistorialService, Movimiento } from '../services/historial.service';
import { HeaderMiskiComponent } from '../header-miski/header-miski.component';

@Component({
  selector: 'app-movimientos',
  templateUrl: './movimientos.page.html',
  styleUrls: ['./movimientos.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HeaderMiskiComponent]
})
export class MovimientosPage implements OnInit {

  listaCompleta: Movimiento[] = []; 
  listaVisual: Movimiento[] = [];   
  textoBuscar: string = '';
  filtroTipo: string = 'Todos'; 

  constructor(
    private historialService: HistorialService,
    private navCtrl: NavController,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    this.historialService.obtenerMovimientos().subscribe(datos => {
      this.listaCompleta = datos;
      this.aplicarFiltros();
    });
  }

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

  irAPerfil() {
    this.navCtrl.navigateForward('/perfil-miski');
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
}
