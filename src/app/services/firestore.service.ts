import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, query, where, orderBy, Timestamp, limit } from '@angular/fire/firestore';
import { Observable, map, catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  private firestore = inject(Firestore);

  /**
   * Obtiene ventas por fecha con opción de incluir/excluir canceladas
   * VERSIÓN OPTIMIZADA - Filtra localmente pero con manejo de errores mejorado
   */
  getVentasPorFecha(
    inicio: Date, 
    fin: Date, 
    incluirCanceladas: boolean = true
  ): Observable<any[]> {
    
    // Logs reducidos para mejor rendimiento
    // console.log('🔍 getVentasPorFecha:', inicio.toLocaleDateString(), '-', fin.toLocaleDateString());

    const ventasRef = collection(this.firestore, 'Ventas');
    
    // Usar catchError para manejar errores de Firebase
    return collectionData(ventasRef, { idField: 'id' }).pipe(
      catchError((error) => {
        console.error('❌ Error al obtener ventas de Firebase:', error);
        // Retornar array vacío en caso de error para no romper la app
        return of([]);
      }),
      map(ventas => {
        if (!ventas || ventas.length === 0) {
          console.log('📡 No hay ventas en Firebase');
          return [];
        }

        // Log reducido
        // console.log('📡 Total ventas:', ventas.length);

        // Filtrar por fecha y estado de forma optimizada
        let ventasFiltradas = ventas.filter((v: any) => {
          // Excluir canceladas si es necesario
          if (!incluirCanceladas && v.estado === 'Cancelado') {
            return false;
          }

          // Convertir fecha de forma segura
          let fechaVenta: Date;
          try {
            fechaVenta = this.convertirAFecha(v.fecha);
            if (!fechaVenta || isNaN(fechaVenta.getTime())) {
              return false;
            }
          } catch (e) {
            console.warn('⚠️ Error al convertir fecha de venta:', v.id);
            return false;
          }

          // Filtrar por rango
          return fechaVenta >= inicio && fechaVenta <= fin;
        });

        // Log reducido
        // console.log('✅ Ventas filtradas:', ventasFiltradas.length);

        // Ordenar por fecha (más recientes primero)
        ventasFiltradas.sort((a, b) => {
          const fechaA = this.convertirAFecha(a['fecha']);
          const fechaB = this.convertirAFecha(b['fecha']);
          return fechaB.getTime() - fechaA.getTime();
        });

        // Limpiar y validar datos
        ventasFiltradas = ventasFiltradas.map((v: any) => {
          return {
            ...v,
            total_venta: Number(v.total_venta) || 0,
            ganancia_neta: Number(v.ganancia_neta) || 0,
            cantidad: Number(v.cantidad) || 0,
            precio_unitario: Number(v.precio_unitario) || 0,
            costo_unitario: Number(v.costo_unitario) || 0,
            nombre_producto: String(v.nombre_producto || 'Sin nombre'),
            cliente: String(v.cliente || 'Sin cliente'),
            estado: String(v.estado || 'Pendiente'),
            metodo_pago: String(v.metodo_pago || 'Efectivo')
          };
        });

        return ventasFiltradas;
      }),
      catchError((error) => {
        console.error('❌ Error al procesar ventas:', error);
        return of([]);
      })
    );
  }

  // Funcion auxiliar para convertir fechas
  private convertirAFecha(fecha: any): Date {
    if (fecha && typeof fecha.toDate === 'function') {
      return fecha.toDate();
    } else if (fecha && fecha.seconds) {
      return new Date(fecha.seconds * 1000);
    } else if (typeof fecha === 'string') {
      return new Date(fecha);
    }
    return new Date();
  }

  /**
   * Obtiene TODAS las ventas sin filtros de fecha
   * Útil para reportes generales
   */
  getTodasLasVentas(incluirCanceladas: boolean = true): Observable<any[]> {
    const ventasRef = collection(this.firestore, 'Ventas');
    const q = query(ventasRef, orderBy('fecha', 'desc'));

    return collectionData(q, { idField: 'id' }).pipe(
      map(ventas => {
        if (!incluirCanceladas) {
          return ventas.filter((v: any) => v.estado !== 'Cancelado');
        }
        return ventas;
      })
    );
  }

  /**
   * Obtiene ventas por estado específico
   */
  getVentasPorEstado(estado: 'Pagado' | 'Pendiente' | 'Cancelado'): Observable<any[]> {
    const ventasRef = collection(this.firestore, 'Ventas');
    const q = query(
      ventasRef,
      where('estado', '==', estado),
      orderBy('fecha', 'desc')
    );

    return collectionData(q, { idField: 'id' });
  }

  /**
   * Obtiene estadísticas generales
   */
  getEstadisticas(): Observable<{
    total: number,
    pagadas: number,
    pendientes: number,
    canceladas: number
  }> {
    const ventasRef = collection(this.firestore, 'Ventas');
    
    return collectionData(ventasRef, { idField: 'id' }).pipe(
      map((ventas: any[]) => {
        return {
          total: ventas.length,
          pagadas: ventas.filter(v => v.estado === 'Pagado').length,
          pendientes: ventas.filter(v => v.estado === 'Pendiente').length,
          canceladas: ventas.filter(v => v.estado === 'Cancelado').length
        };
      })
    );
  }
}