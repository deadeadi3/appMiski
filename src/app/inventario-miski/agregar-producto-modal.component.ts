import { Component, OnInit, Input } from '@angular/core';
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
  @Input() productoEditar: Producto | undefined; // Recibe el producto si estamos editando

  formulario!: FormGroup;
  imagenPrevia: string = 'assets/icon/Legia.svg';
  cargando = false;
  categorias = ['limpieza', 'absorbentes', 'dispensadores'];
  esEdicion = false;

  constructor(
    private modalController: ModalController,
    private formBuilder: FormBuilder,
    private productosService: ProductosService,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.esEdicion = !!this.productoEditar;
    this.inicializarFormulario();
    
    // Si estamos editando, rellenamos el formulario con los datos existentes
    if (this.esEdicion && this.productoEditar) {
      this.cargarDatosEdicion();
    }
  }

  inicializarFormulario() {
    this.formulario = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      code: ['', [Validators.required]],
      category: ['limpieza', Validators.required],
      telefono_de_contacto: ['', [Validators.pattern(/^[0-9\-\+\(\)\s]*$/)]],
      image: [''],
      stock: [0, [Validators.required, Validators.min(0)]],
      description: ['']
    });
  }

  cargarDatosEdicion() {
    if (!this.productoEditar) return;

    this.formulario.patchValue({
      name: this.productoEditar.name,
      code: this.productoEditar.code,
      category: this.productoEditar.category,
      telefono_de_contacto: this.productoEditar.telefono_de_contacto,
      image: this.productoEditar.image,
      stock: this.productoEditar.stock,
      description: this.productoEditar.description
    });

    if (this.productoEditar.image) {
      this.imagenPrevia = this.productoEditar.image;
    }
  }

  actualizarImagenPrevia(event: any) {
    const url = event.target.value;
    if (url) {
      this.imagenPrevia = url;
    } else {
      this.imagenPrevia = 'assets/icon/Legia.svg';
    }
  }

  async guardarProducto() {
    if (!this.formulario.valid) {
      this.mostrarToast('Por favor, revisa los campos obligatorios', 'warning');
      this.formulario.markAllAsTouched();
      return;
    }

    const loading = await this.loadingController.create({
      message: this.esEdicion ? 'Actualizando...' : 'Guardando...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      const datosFormulario = this.formulario.value;

      const productoData: Producto = {
        name: datosFormulario.name.trim(),
        code: datosFormulario.code.trim().toUpperCase(),
        category: datosFormulario.category,
        telefono_de_contacto: datosFormulario.telefono_de_contacto || '',
        image: datosFormulario.image || 'assets/icon/Legia.svg',
        stock: parseInt(datosFormulario.stock) || 0,
        description: datosFormulario.description || '',
        specific_features: this.esEdicion && this.productoEditar ? this.productoEditar.specific_features : {}
      };

      if (this.esEdicion && this.productoEditar?.id) {
        // --- MODO EDITAR ---
        // Mantenemos el ID original
        productoData.id = this.productoEditar.id;
        
        this.productosService.actualizarProducto(this.productoEditar.id, productoData).subscribe({
          next: () => {
            loading.dismiss();
            this.mostrarToast('✅ Producto actualizado correctamente', 'success');
            this.cerrarModal(true);
          },
          error: (error) => {
            loading.dismiss();
            console.error('Error al actualizar:', error);
            this.mostrarToast('❌ Error al actualizar', 'danger');
          }
        });

      } else {
        // --- MODO AGREGAR ---
        this.productosService.agregarProducto(productoData).subscribe({
          next: () => {
            loading.dismiss();
            this.mostrarToast('✅ Producto agregado correctamente', 'success');
            this.cerrarModal(true);
          },
          error: (error) => {
            loading.dismiss();
            console.error('Error al agregar:', error);
            this.mostrarToast('❌ Error al agregar', 'danger');
          }
        });
      }

    } catch (error) {
      loading.dismiss();
      this.mostrarToast('Error inesperado', 'danger');
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

  esCampoInvalido(campo: string): boolean {
    const control = this.formulario.get(campo);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}