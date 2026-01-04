import { Component, OnInit, inject } from '@angular/core'; // <--- Agregar inject
import { IonicModule, ModalController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AlertController, ToastController, LoadingController } from '@ionic/angular';
import { RouterLink, Router } from '@angular/router'; // <--- Agregar Router
import { addIcons } from 'ionicons';
import { 
  add, cubeOutline, ellipsisVertical, createOutline, 
  trashOutline, chevronBack, chevronForward, searchOutline,
  sparklesOutline, waterOutline, albumsOutline, informationCircleOutline,
  saveOutline, addCircleOutline, close, imageOutline, pricetagOutline,
  barcodeOutline, gridOutline, callOutline, documentTextOutline 
} from 'ionicons/icons';
import { ProductosService, Producto } from 'src/app/inventario-miski/productos.services';
import { AgregarProductoModalComponent } from './agregar-producto-modal.component';
// import { HeaderMiskiComponent } from '../header-miski/header-miski.component'; // <--- Ya no lo necesitamos
import { UserProfileService } from '../services/user-profile.service'; // <--- IMPORTANTE

@Component({
  selector: 'app-inventario-miski',
  templateUrl: './inventario-miski.page.html',
  styleUrls: ['./inventario-miski.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, RouterLink, AgregarProductoModalComponent], // <--- Quitamos HeaderMiskiComponent
})
export class InventarioMiskiPage implements OnInit {
  
  // --- VARIABLES PARA EL HEADER ---
  private router = inject(Router);
  private userProfileService = inject(UserProfileService); // <--- INYECTAR
  avatarUrl: string = 'assets/icon/login.png';
  // --------------------------------

  selectedCategory = 'limpieza';
  searchTerm = '';
  currentPage = 1;
  totalPages = 1;
  itemsPerPage = 10;

  productos: Producto[] = [];
  filteredProducts: Producto[] = [];
  paginatedProducts: Producto[] = [];
  visiblePages: (number | string)[] = [];

  constructor(
    private alertController: AlertController,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private productosService: ProductosService,
    private modalController: ModalController
  ) {
    addIcons({ 
      add, cubeOutline, ellipsisVertical, createOutline, 
      trashOutline, chevronBack, chevronForward, searchOutline,
      sparklesOutline, waterOutline, albumsOutline, informationCircleOutline,
      saveOutline, addCircleOutline, close, imageOutline, pricetagOutline,
      barcodeOutline, gridOutline, callOutline, documentTextOutline
    });
  }

  ngOnInit() {
    this.cargarProductos();

    // SUSCRIPCIÓN PARA AVATAR
    this.userProfileService.userProfile$.subscribe(profile => {
      if (profile && profile.photoURL) {
        this.avatarUrl = profile.photoURL;
      }
    });
  }

 

  // --- FUNCIONES DEL HEADER ---
  irAlPerfil() {
    this.router.navigate(['/perfil-miski']);
  }

  irAlInicio() {
    this.router.navigate(['/button']);
  }
  // -----------------------------

  async cargarProductos() {
    const loading = await this.loadingController.create({
      message: 'Cargando...',
      spinner: 'crescent',
      duration: 5000 
    });
    await loading.present();

    this.productosService.obtenerProductos().subscribe({
      next: (productos) => {
        this.productos = productos;
        this.filterProducts();
        loading.dismiss();
      },
      error: (error) => {
        console.error('Error:', error);
        loading.dismiss();
        this.mostrarToast('Error de conexión', 'danger');
      }
    });
  }

  filterProducts() {
    this.filteredProducts = this.productos.filter(producto => {
      const matchesCategory = producto.category === this.selectedCategory;
      const matchesSearch = producto.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           producto.code.toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });

    this.totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage);
    this.currentPage = 1;
    this.updatePaginatedProducts();
    this.updateVisiblePages();
  }

  updatePaginatedProducts() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedProducts = this.filteredProducts.slice(startIndex, endIndex);
  }

  handleSearch(event: any) {
    this.searchTerm = event.target.value;
    this.filterProducts();
  }

  updateVisiblePages() {
    const pages: (number | string)[] = [];
    if (this.totalPages <= 7) {
      for (let i = 1; i <= this.totalPages; i++) { pages.push(i); }
    } else {
      if (this.currentPage <= 3) { pages.push(1, 2, 3, 4, '...', this.totalPages); } 
      else if (this.currentPage >= this.totalPages - 2) { pages.push(1, '...', this.totalPages - 3, this.totalPages - 2, this.totalPages - 1, this.totalPages); } 
      else { pages.push(1, '...', this.currentPage - 1, this.currentPage, this.currentPage + 1, '...', this.totalPages); }
    }
    this.visiblePages = pages;
  }

  goToPage(page: number | string) {
    if (typeof page === 'number' && page !== this.currentPage) {
      this.currentPage = page;
      this.updatePaginatedProducts();
      this.updateVisiblePages();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedProducts();
      this.updateVisiblePages();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedProducts();
      this.updateVisiblePages();
    }
  }

  async verDetalleProducto(producto: Producto) {
    const alert = await this.alertController.create({
      header: producto.name,
      subHeader: `Código: ${producto.code}`,
      message: `Categoría: ${producto.category}\nStock: ${producto.stock} u.\n\n${producto.description || ''}`,
      buttons: ['Cerrar']
    });
    await alert.present();
  }

  async agregarProducto() {
    const modal = await this.modalController.create({
      component: AgregarProductoModalComponent,
      mode: 'ios' 
    });
    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) this.cargarProductos();
  }

  async editarProducto(producto: Producto, event: Event) {
    event.stopPropagation();
    const modal = await this.modalController.create({
      component: AgregarProductoModalComponent,
      componentProps: { productoEditar: producto },
      mode: 'ios'
    });
    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) this.cargarProductos();
  }

  async eliminarProducto(producto: Producto, event: Event) {
    event.stopPropagation();
    const alert = await this.alertController.create({
      header: '¿Eliminar?',
      message: `Se eliminará "${producto.name}".`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          cssClass: 'danger',
          handler: async () => {
            const loading = await this.loadingController.create({ message: 'Borrando...' });
            await loading.present();
            this.productosService.eliminarProducto(producto.id!, producto).subscribe({
              next: () => {
                loading.dismiss();
                this.mostrarToast('Producto eliminado', 'success');
                this.cargarProductos();
              },
              error: () => {
                loading.dismiss();
                this.mostrarToast('Error al eliminar', 'danger');
              }
            });
          }
        }
      ]
    });
    await alert.present();
  }

  async mostrarToast(mensaje: string, color: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      position: 'bottom',
      color: color
    });
    await toast.present();
  }

  onCategoryChange() {
    this.filterProducts();
  }
}