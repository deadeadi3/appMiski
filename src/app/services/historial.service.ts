import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, query, orderBy, Timestamp, getDocs, writeBatch } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface Movimiento {
  id?: string;
  accion: 'Creación' | 'Edición' | 'Eliminación';
  producto: string;
  fecha: any;
  image?: string; 
  detalles?: {
    code: string;
    category: string;
    stock: number;
    description?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class HistorialService {

  constructor(private firestore: Firestore) { }

  async registrarMovimiento(accion: 'Creación' | 'Edición' | 'Eliminación', producto: any) {
    const registro = {
      accion: accion,
      producto: producto.name,
      image: producto.image || '', 
      fecha: Timestamp.now(),
      detalles: {
        code: producto.code || 'S/C',
        category: producto.category || 'General',
        stock: producto.stock || 0,
        description: producto.description || ''
      }
    };
    const historialRef = collection(this.firestore, 'historial_movimientos');
    return addDoc(historialRef, registro);
  }

  obtenerMovimientos(): Observable<Movimiento[]> {
    const historialRef = collection(this.firestore, 'historial_movimientos');
    const q = query(historialRef, orderBy('fecha', 'desc'));
    return collectionData(q, { idField: 'id' }) as Observable<Movimiento[]>;
  }

  async borrarTodoElHistorial() {
    const historialRef = collection(this.firestore, 'historial_movimientos');
    const snapshot = await getDocs(historialRef);
    const batch = writeBatch(this.firestore);
    
    snapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    return batch.commit();
  }
}