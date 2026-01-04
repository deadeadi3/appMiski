import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController, LoadingController, ToastController } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProductosService, Producto } from './productos.services';

@Component({
  selector: 'app-agregar-producto-modal',
  templateUrl: './agregar-producto-modal.component.html',
  styleUrls: ['./agregar-producto-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, ReactiveFormsModule]
})
export class AgregarProductoModalComponent implements OnInit {
  formulario!: FormGroup;
  imagenPrevia: string = 'assets/icon/Legia.svg';
  cargando = false;
  categorias = ['limpieza', 'absorbentes', 'dispensadores'];
  
  constructor(
    private modalController: ModalController,
    private formBuilder: FormBuilder,
    private productosService: ProductosService,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.inicializarFormulario();
  }

  inicializarFormulario() {
    this.formulario = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      code: ['', [Validators.required, Validators.minLength(2)]],
      category: ['limpieza', Validators.required],
      telefono_de_contacto: ['', [Validators.pattern(/^[0-9\-\+\(\)\s]*$/)]],
      image: ['assets/icon/Legia.svg'],
      stock: [0, [Validators.required, Validators.min(0)]],
      description: ['']
    });
  }

  actualizarImagenPrevia(event: any) {
    const url = event.target.value;
    if (url) {
      const img = new Image();
      img.onload = () => {
        this.imagenPrevia = url;
      };
      img.onerror = () => {
        this.imagenPrevia = 'assets/icon/Legia.svg';
        this.mostrarToast('URL de imagen inválida', 'warning');
      };
      img.src = url;
    } else {
      this.imagenPrevia = 'assets/icon/Legia.svg';
    }
  }

  async guardarProducto() {
    if (!this.formulario.valid) {
      this.mostrarToast('Completa todos los campos requeridos correctamente', 'warning');
      return;
    }

    const loading = await this.loadingController.create({
      message: '⏳ Agregando producto...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      const nuevoProducto: Producto = {
        name: this.formulario.get('name')?.value.trim(),
        code: this.formulario.get('code')?.value.trim().toUpperCase(),
        category: this.formulario.get('category')?.value,
        telefono_de_contacto: this.formulario.get('telefono_de_contacto')?.value || '',
        image: this.formulario.get('image')?.value || 'assets/icon/Legia.svg',
        stock: parseInt(this.formulario.get('stock')?.value) || 0,
        description: this.formulario.get('description')?.value || '',
        specific_features: {}
      };

      this.productosService.agregarProducto(nuevoProducto).subscribe({
        next: (id) => {
          loading.dismiss();
          this.mostrarToast('✅ Producto agregado exitosamente', 'success');
          this.cerrarModal(true);
        },
        error: (error) => {
          loading.dismiss();
          console.error('Error al agregar producto:', error);
          this.mostrarToast('❌ Error al agregar producto', 'danger');
        }
      });
    } catch (error) {
      loading.dismiss();
      this.mostrarToast('❌ Error inesperado', 'danger');
    }
  }

  cerrarModal(guardado: boolean = false) {
    this.modalController.dismiss(guardado);
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

  obtenerErrorCampo(campo: string): string {
    const control = this.formulario.get(campo);
    if (control?.hasError('required')) {
      return `${this.capitalizarCampo(campo)} es obligatorio`;
    }
    if (control?.hasError('minlength')) {
      const minLength = control.getError('minlength').requiredLength;
      return `${this.capitalizarCampo(campo)} debe tener al menos ${minLength} caracteres`;
    }
    if (control?.hasError('pattern')) {
      return `${this.capitalizarCampo(campo)} contiene caracteres inválidos`;
    }
    if (control?.hasError('min')) {
      return `${this.capitalizarCampo(campo)} no puede ser negativo`;
    }
    return '';
  }

  capitalizarCampo(campo: string): string {
    return campo.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  esCampoInvalido(campo: string): boolean {
    const control = this.formulario.get(campo);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  compareFn(c1: any, c2: any): boolean {
    return c1 === c2;
  }
}
