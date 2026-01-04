import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, CollectionReference, writeBatch } from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';
import { HistorialService } from '../services/historial.service';

export interface Producto {
  id?: string;
  code: string;
  name: string;
  category: string;
  telefono_de_contacto: string;
  specific_features: {
    [key: string]: any;
  };
  stock?: number;
  description?: string;
  image?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductosService {
  private productosCollection: CollectionReference;

  constructor(
    private firestore: Firestore,
    private historialService: HistorialService // Inyectamos el historial
  ) {
    this.productosCollection = collection(this.firestore, 'productos');
  }

  agregarProducto(producto: Producto): Observable<string> {
    // Registramos en el historial
    this.historialService.registrarMovimiento('Creación', producto);

    return from(addDoc(this.productosCollection, producto)).pipe(
      map(docRef => docRef.id)
    );
  }

  obtenerProductos(): Observable<Producto[]> {
    return from(getDocs(this.productosCollection)).pipe(
      map(snapshot => 
        snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Producto))
      )
    );
  }

  obtenerProductosPorCategoria(categoria: string): Observable<Producto[]> {
    const q = query(this.productosCollection, where('category', '==', categoria));
    return from(getDocs(q)).pipe(
      map(snapshot => 
        snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Producto))
      )
    );
  }

  actualizarProducto(id: string, producto: Partial<Producto>): Observable<void> {
    const docRef = doc(this.firestore, 'productos', id);
    
    // Registramos la edición (aseguramos que tenga nombre)
    const datosCompletos = { name: 'Producto Editado', ...producto };
    this.historialService.registrarMovimiento('Edición', datosCompletos);

    return from(updateDoc(docRef, { ...producto }));
  }

  eliminarProducto(id: string, productoCompleto: any): Observable<void> {
    const docRef = doc(this.firestore, 'productos', id);
    
    // Registramos la eliminación
    this.historialService.registrarMovimiento('Eliminación', productoCompleto);

    return from(deleteDoc(docRef));
  }

  async borrarTodoElInventario() {
    const productosRef = collection(this.firestore, 'productos');
    
    const snapshot = await getDocs(productosRef);
    
    const batch = writeBatch(this.firestore);

    snapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    this.historialService.registrarMovimiento('Eliminación', { 
      name: '⚠️ LIMPIEZA MASIVA DE INVENTARIO',
      image: '',
      code: 'SYSTEM',
      category: 'ADMIN',
      stock: 0,
      description: 'Se eliminaron todos los productos mediante el botón de vaciar.'
    });

    return batch.commit();
  }
}