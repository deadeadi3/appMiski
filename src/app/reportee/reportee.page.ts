import { Component, ViewChild, ElementRef, inject, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardContent, 
  IonCardHeader, IonCardTitle, IonButtons, IonNote, IonIcon, IonFabButton, 
  IonFab, IonFabList, IonButton, IonLabel, IonItem, IonList, IonSegmentButton, IonSegment,
  IonBadge, IonChip, IonSkeletonText, IonRefresher, IonRefresherContent,
  IonGrid, IonRow, IonCol, IonProgressBar,
  AlertController, ToastController
} from '@ionic/angular/standalone';
import { Chart, registerables } from 'chart.js';
import { FirestoreService } from '../services/firestore.service';
import { HeaderMiskiComponent } from '../header-miski/header-miski.component';
import { addIcons } from 'ionicons';
import { 
  trendingUpOutline, trendingDownOutline, statsChartOutline, 
  documentTextOutline, refreshOutline, downloadOutline, shareOutline,
  calendarOutline, cashOutline, cartOutline, alertCircleOutline,
  filterOutline, closeOutline, logoWhatsapp, copyOutline, 
  checkmarkCircleOutline, checkmarkCircle, closeCircle, receiptOutline, 
  trophyOutline, timeOutline, personOutline, addOutline, barChartOutline,
  eyeOutline, eyeOffOutline
} from 'ionicons/icons';

Chart.register(...registerables);

interface VentaDetalle {
  producto: string;
  cantidad: number;
  total: number;
  fecha: string;
  cliente: string;
}

@Component({
  selector: 'app-reportee',
  templateUrl: './reportee.page.html',
  styleUrls: ['./reportee.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, 
    IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonButtons, IonNote, 
    IonIcon, IonFabButton, IonFab, IonFabList, IonButton, IonLabel, IonItem, IonList, 
    IonSegmentButton, IonSegment, IonBadge, IonChip, IonSkeletonText, 
    IonRefresher, IonRefresherContent, IonGrid, IonRow, IonCol, IonProgressBar, HeaderMiskiComponent
  ]
})
export class ReporteePage implements AfterViewInit, OnDestroy {

  @ViewChild('myChartCanvas') private chartCanvas!: ElementRef;
  public chart: Chart | undefined;
  private destroy$ = new Subject<void>();
  
  private firestoreService = inject(FirestoreService);
  private alertController = inject(AlertController);
  private toastController = inject(ToastController);

  isLoading = true;
  filtroActual = 'mes';
  incluirCanceladas = true;
  fechaActual: string = '';
  
  fechaInicio: string = '';
  fechaFin: string = '';
  usandoFechasPersonalizadas = false;
  
  datosCargados = false;
  graficoListo = false;

  kpiData = {
    ventas: 0,
    utilidad: 0,
    margen: 0,
    items: 0,
    facturas: 0,
    ticketPromedio: 0,
    crecimiento: 0
  };

  comparacion = {
    ventas: 0,
    utilidad: 0,
    facturas: 0
  };

  topProductos: any[] = [];
  ventasRecientes: VentaDetalle[] = [];
  
  private MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  // Variables para almacenar datos del gráfico
  private chartLabels: string[] = [];
  private chartIngresos: number[] = [];
  private chartCostos: number[] = [];

  constructor() {
    addIcons({
      filterOutline,
      calendarOutline,
      closeCircle,
      cashOutline,
      trendingUpOutline,
      statsChartOutline,
      cartOutline,
      receiptOutline,
      refreshOutline,
      trophyOutline,
      alertCircleOutline,
      timeOutline,
      checkmarkCircleOutline,
      checkmarkCircle,
      personOutline,
      documentTextOutline,
      addOutline,
      shareOutline,
      trendingDownOutline,
      downloadOutline,
      closeOutline,
      logoWhatsapp,
      copyOutline,
      barChartOutline,
      eyeOutline,
      eyeOffOutline
    });

    const hoy = new Date();
    this.fechaActual = hoy.toLocaleDateString('es-PE', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    this.fechaFin = hoy.toISOString();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    this.fechaInicio = inicioMes.toISOString();
  }

  ngAfterViewInit(): void {
    console.log('🎬 ngAfterViewInit - Canvas disponible:', !!this.chartCanvas);
    if (!this.datosCargados) {
      setTimeout(() => {
        this.cargarDatos('mes');
      }, 0);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.chart) {
      this.chart.destroy();
    }
  }

  async toggleCanceladas() {
    this.incluirCanceladas = !this.incluirCanceladas;
    await this.cargarDatos(this.filtroActual);
  }

  async handleRefresh(event: any) {
    await this.cargarDatos(this.filtroActual);
    event.target.complete();
    
    const toast = await this.toastController.create({
      message: 'Datos actualizados correctamente',
      duration: 2000,
      position: 'top',
      color: 'success',
      icon: 'checkmark-circle-outline'
    });
    toast.present();
  }

  async cargarDatos(tipoFiltro: string): Promise<void> {
    console.log('🔄 Iniciando carga de datos para filtro:', tipoFiltro);
    this.isLoading = true;
    this.filtroActual = tipoFiltro;
    
    let inicio: Date, fin: Date;
    
    if (this.usandoFechasPersonalizadas) {
      inicio = new Date(this.fechaInicio);
      fin = new Date(this.fechaFin);
      fin.setHours(23, 59, 59, 999);
    } else {
      const rango = this.calcularRangoFechas(tipoFiltro);
      inicio = rango.inicio;
      fin = rango.fin;
    }

    console.log('📅 Rango de fechas:', inicio, 'a', fin);

    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 20000)
      );

      const ventasPromise = firstValueFrom(
        this.firestoreService.getVentasPorFecha(inicio, fin, this.incluirCanceladas)
          .pipe(takeUntil(this.destroy$))
      );
      
      const ventas = await Promise.race([ventasPromise, timeoutPromise]) as any[];
      
      console.log('✅ Ventas cargadas:', ventas.length);
      
      // Procesar ventas
      this.procesarVentas(ventas);
      this.datosCargados = true;
      this.isLoading = false;
      
      // IMPORTANTE: Esperar a que Angular actualice el DOM
      // y luego inicializar el gráfico
      if (ventas.length > 0) {
        // Intentar múltiples veces hasta que el canvas esté disponible
        this.intentarCrearGrafico(0);
      } else {
        this.graficoListo = false;
        console.log('⚠️ No hay ventas para mostrar el gráfico');
      }
      
      // Cargar comparación en background
      if (!this.usandoFechasPersonalizadas) {
        this.cargarComparacionAsync(tipoFiltro).catch(() => {});
      }
      
    } catch (error: any) {
      console.error('❌ Error al cargar datos:', error);
      this.isLoading = false;
      this.datosCargados = true;
      this.graficoListo = false;
      
      if (!error.message?.includes('Timeout')) {
        await this.mostrarError('Error al cargar los datos. Por favor, intenta nuevamente.');
      }
    }
  }

  // Nuevo método para intentar crear el gráfico con reintentos
  private intentarCrearGrafico(intento: number): void {
    const maxIntentos = 10;
    
    console.log(`🔍 Intento ${intento + 1}/${maxIntentos} - Canvas:`, !!this.chartCanvas);
    
    if (this.chartCanvas && this.chartCanvas.nativeElement) {
      console.log('✨ Canvas encontrado, creando gráfico...');
      this.initializeOrUpdateChart();
    } else if (intento < maxIntentos) {
      // Intentar de nuevo después de 100ms
      setTimeout(() => {
        this.intentarCrearGrafico(intento + 1);
      }, 100);
    } else {
      console.error('❌ No se pudo encontrar el canvas después de', maxIntentos, 'intentos');
      this.graficoListo = false;
    }
  }

  private initializeOrUpdateChart(): void {
    if (!this.chartCanvas || !this.chartCanvas.nativeElement) {
      console.warn('⚠️ Canvas no disponible en initializeOrUpdateChart');
      return;
    }

    // SIEMPRE destruir y recrear el gráfico cuando cambian los datos
    // Esto evita problemas con los arrays de diferentes tamaños
    if (this.chart) {
      console.log('🔄 Destruyendo gráfico anterior y creando uno nuevo');
      this.chart.destroy();
      this.chart = undefined;
    }

    // Crear el gráfico
    console.log('🆕 Creando nuevo gráfico');
    this.createChart();
    this.graficoListo = true;
  }

  private async cargarComparacionAsync(tipoFiltro: string): Promise<void> {
    try {
      const { inicio: inicioAnterior, fin: finAnterior } = this.calcularRangoPeriodoAnterior(tipoFiltro);
      const ventasAnteriores = await firstValueFrom(
        this.firestoreService.getVentasPorFecha(inicioAnterior, finAnterior, this.incluirCanceladas)
      );
      this.calcularComparacion(ventasAnteriores);
      console.log('📊 Comparación calculada:', this.comparacion);
    } catch (error) {
      console.error('❌ Error al cargar comparación:', error);
    }
  }

  procesarVentas(ventas: any[]) {
    console.log('📊 Procesando', ventas.length, 'ventas');
    
    let sumaVentas = 0;
    let sumaUtilidad = 0;
    let sumaItems = 0;
    const mapProductos = new Map<string, any>();
    
    let labels: string[] = [];
    let ingresos: number[] = [];
    let costos: number[] = [];
    
    if (this.filtroActual === 'dia' || this.usandoFechasPersonalizadas) {
      const diasMap = new Map<string, { ingreso: number, costo: number }>();
      
      ventas.forEach(venta => {
        let fechaObj = this.convertirFecha(venta.fecha);
        const diaKey = fechaObj.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });
        
        const total = Number(venta.total_venta) || 0;
        const ganancia = Number(venta.ganancia_neta) || 0;
        
        if (!diasMap.has(diaKey)) {
          diasMap.set(diaKey, { ingreso: 0, costo: 0 });
        }
        const dia = diasMap.get(diaKey)!;
        dia.ingreso += total;
        dia.costo += (total - ganancia);
      });
      
      labels = Array.from(diasMap.keys());
      ingresos = Array.from(diasMap.values()).map(d => d.ingreso);
      costos = Array.from(diasMap.values()).map(d => d.costo);
      
    } else if (this.filtroActual === 'semana') {
      const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      labels = DIAS_SEMANA;
      ingresos = new Array(7).fill(0);
      costos = new Array(7).fill(0);
      
      ventas.forEach(venta => {
        let fechaObj = this.convertirFecha(venta.fecha);
        const diaIndex = fechaObj.getDay();
        
        const total = Number(venta.total_venta) || 0;
        const ganancia = Number(venta.ganancia_neta) || 0;
        
        ingresos[diaIndex] += total;
        costos[diaIndex] += (total - ganancia);
      });
      
    } else {
      labels = this.MONTHS;
      ingresos = new Array(12).fill(0);
      costos = new Array(12).fill(0);
      
      ventas.forEach(venta => {
        let fechaObj = this.convertirFecha(venta.fecha);
        const mesIndex = fechaObj.getMonth();
        
        const total = Number(venta.total_venta) || 0;
        const ganancia = Number(venta.ganancia_neta) || 0;
        
        if (mesIndex >= 0 && mesIndex <= 11) {
          ingresos[mesIndex] += total;
          costos[mesIndex] += (total - ganancia);
        }
      });
    }
    
    // Guardar datos del gráfico
    this.chartLabels = labels;
    this.chartIngresos = ingresos;
    this.chartCostos = costos;
    
    console.log('📈 Datos del gráfico preparados:', {
      labels: this.chartLabels.length,
      ingresos: this.chartIngresos.length,
      costos: this.chartCostos.length,
      totalIngresos: ingresos.reduce((a, b) => a + b, 0)
    });
    
    this.ventasRecientes = [];

    ventas.forEach((venta) => {
      const total = Number(venta.total_venta) || 0;
      const ganancia = Number(venta.ganancia_neta) || 0; 
      const cantidad = Number(venta.cantidad) || 0;

      sumaVentas += total;
      sumaUtilidad += ganancia;
      sumaItems += cantidad;

      if (this.ventasRecientes.length < 10) {
        this.ventasRecientes.push({
          producto: venta.nombre_producto || 'Producto',
          cantidad: cantidad,
          total: total,
          fecha: this.formatearFecha(venta.fecha),
          cliente: venta.cliente || 'Cliente'
        });
      }

      const nombre = venta.nombre_producto || 'Sin nombre';
      if (mapProductos.has(nombre)) {
        const p = mapProductos.get(nombre);
        p.cantidad += cantidad;
        p.total += total;
      } else {
        mapProductos.set(nombre, {
          nombre: nombre,
          cantidad: cantidad,
          total: total
        });
      }
    });

    // Calcular KPIs
    this.kpiData.ventas = sumaVentas;
    this.kpiData.utilidad = sumaUtilidad;
    this.kpiData.items = sumaItems;
    this.kpiData.facturas = ventas.length;
    this.kpiData.ticketPromedio = ventas.length > 0 ? sumaVentas / ventas.length : 0;
    this.kpiData.margen = sumaVentas > 0 ? (sumaUtilidad / sumaVentas) * 100 : 0;

    // Top productos
    this.topProductos = Array.from(mapProductos.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    console.log('💰 KPIs calculados:', this.kpiData);
    console.log('🏆 Top productos:', this.topProductos.length);
  }
  
  get tieneDatosGrafico(): boolean {
    const tieneLabels = this.chartLabels.length > 0;
    const tieneIngresos = this.chartIngresos.some(ing => ing > 0);
    const resultado = tieneLabels && tieneIngresos && this.datosCargados;
    
    console.log('🔍 tieneDatosGrafico:', {
      tieneLabels,
      tieneIngresos,
      datosCargados: this.datosCargados,
      resultado
    });
    
    return resultado;
  }

  convertirFecha(fecha: any): Date {
    if (fecha && fecha.seconds) {
      return new Date(fecha.seconds * 1000);
    } else if (fecha && fecha.toDate) {
      return fecha.toDate();
    } else {
      return new Date(fecha);
    }
  }

  calcularComparacion(ventasAnteriores: any[]) {
    let sumaVentasAnt = 0;
    let sumaUtilidadAnt = 0;

    ventasAnteriores.forEach(venta => {
      sumaVentasAnt += Number(venta.total_venta) || 0;
      sumaUtilidadAnt += Number(venta.ganancia_neta) || 0;
    });

    if (sumaVentasAnt > 0) {
      this.comparacion.ventas = ((this.kpiData.ventas - sumaVentasAnt) / sumaVentasAnt) * 100;
      this.comparacion.utilidad = ((this.kpiData.utilidad - sumaUtilidadAnt) / sumaUtilidadAnt) * 100;
    } else {
      this.comparacion.ventas = 0;
      this.comparacion.utilidad = 0;
    }
    
    if (ventasAnteriores.length > 0) {
      this.comparacion.facturas = ((this.kpiData.facturas - ventasAnteriores.length) / ventasAnteriores.length) * 100;
    } else {
      this.comparacion.facturas = 0;
    }

    this.kpiData.crecimiento = this.comparacion.ventas;
  }

  calcularRangoFechas(filtro: string) {
    const ahora = new Date();
    let inicio = new Date(ahora);
    let fin = new Date(ahora);

    fin.setHours(23, 59, 59, 999);

    if (filtro === 'dia') {
      inicio.setHours(0, 0, 0, 0);
    } else if (filtro === 'semana') {
      inicio.setDate(ahora.getDate() - 7);
      inicio.setHours(0, 0, 0, 0);
    } else if (filtro === 'mes') {
      inicio.setDate(1);
      inicio.setHours(0, 0, 0, 0);
    }

    return { inicio, fin };
  }

  calcularRangoPeriodoAnterior(filtro: string) {
    const { inicio, fin } = this.calcularRangoFechas(filtro);
    const diferencia = fin.getTime() - inicio.getTime();
    
    const finAnterior = new Date(inicio.getTime() - 1);
    const inicioAnterior = new Date(finAnterior.getTime() - diferencia);

    return { inicio: inicioAnterior, fin: finAnterior };
  }

  formatearFecha(fecha: any): string {
    const fechaObj = this.convertirFecha(fecha);
    
    const dia = fechaObj.getDate().toString().padStart(2, '0');
    const mes = (fechaObj.getMonth() + 1).toString().padStart(2, '0');
    const hora = fechaObj.getHours().toString().padStart(2, '0');
    const min = fechaObj.getMinutes().toString().padStart(2, '0');
    
    return dia + '/' + mes + ' ' + hora + ':' + min;
  }

  cambiarFiltro(event: any) {
    this.usandoFechasPersonalizadas = false;
    this.cargarDatos(event.detail.value);
  }

  async abrirSelectorFechas() {
    const alert = await this.alertController.create({
      header: 'Filtrar por Fechas',
      message: 'Selecciona el rango de fechas para el reporte',
      inputs: [
        {
          name: 'fechaInicio',
          type: 'date',
          value: this.fechaInicio.split('T')[0],
          label: 'Fecha Inicio'
        },
        {
          name: 'fechaFin',
          type: 'date',
          value: this.fechaFin.split('T')[0],
          label: 'Fecha Fin'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Aplicar',
          handler: (data) => {
            if (data.fechaInicio && data.fechaFin) {
              this.fechaInicio = new Date(data.fechaInicio + 'T00:00:00').toISOString();
              this.fechaFin = new Date(data.fechaFin + 'T23:59:59').toISOString();
              this.usandoFechasPersonalizadas = true;
              this.filtroActual = 'personalizado';
              this.cargarDatos('personalizado');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  limpiarFiltroFechas() {
    this.usandoFechasPersonalizadas = false;
    this.cambiarFiltro({ detail: { value: 'mes' } });
  }

  createChart() {
    try {
      if (!this.chartCanvas || !this.chartCanvas.nativeElement) {
        console.warn('⚠️ Canvas no disponible');
        return;
      }

      const canvasElement = this.chartCanvas.nativeElement;
      
      canvasElement.width = canvasElement.offsetWidth;
      canvasElement.height = 250;

      // Destruir gráfico anterior
      if (this.chart) {
        this.chart.destroy();
        this.chart = undefined;
      }

      const ctx = canvasElement.getContext('2d');
      if (!ctx) {
        console.error('❌ No se pudo obtener el contexto del canvas');
        return;
      }

      console.log('📊 Creando gráfico con:', this.chartLabels.length, 'labels');

      this.chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: this.chartLabels,
          datasets: [
            { 
              label: 'Ingresos (S/.)', 
              data: this.chartIngresos, 
              borderColor: '#0066ff', 
              backgroundColor: 'rgba(0, 102, 255, 0.1)', 
              fill: true, 
              tension: 0.4,
              borderWidth: 3,
              pointRadius: 4,
              pointHoverRadius: 6
            },
            { 
              label: 'Costos (S/.)', 
              data: this.chartCostos, 
              borderColor: '#eb445a', 
              backgroundColor: 'transparent', 
              borderDash: [5,5], 
              tension: 0.4, 
              pointRadius: 0,
              borderWidth: 2
            }
          ]
        },
        options: { 
          responsive: true, 
          maintainAspectRatio: false, 
          plugins: { 
            legend: { 
              position: 'top',
              labels: {
                usePointStyle: true,
                padding: 15,
                font: { size: 12, weight: 600 }
              }
            },
            tooltip: {
              backgroundColor: 'rgba(0,0,0,0.8)',
              padding: 12,
              titleFont: { size: 14, weight: 600 },
              bodyFont: { size: 13 },
              cornerRadius: 8,
              callbacks: {
                label: (context: any) => {
                  return ' ' + context.dataset.label + ': S/. ' + context.parsed.y.toFixed(2);
                }
              }
            }
          }, 
          scales: { 
            y: { 
              beginAtZero: true,
              grid: { color: 'rgba(0,0,0,0.05)' },
              ticks: { 
                font: { size: 11 },
                callback: function(value: any) {
                  return 'S/. ' + value;
                }
              }
            }, 
            x: { 
              grid: { display: false },
              ticks: { font: { size: 11 } }
            } 
          } 
        }
      });
      
      console.log('✅ Gráfico creado correctamente');
    } catch (error) {
      console.error('❌ Error al crear el gráfico:', error);
    }
  }

  actualizarChart(labels: string[], ingresos: number[], costos: number[]) {
    if (this.chart) {
      this.chart.data.labels = labels;
      this.chart.data.datasets[0].data = ingresos;
      this.chart.data.datasets[1].data = costos;
      this.chart.update('none');
      console.log('✅ Gráfico actualizado con', labels.length, 'puntos');
    }
  }

  randomize() { 
    console.log('🔄 Actualizando datos manualmente...');
    this.cargarDatos(this.filtroActual); 
  }

  async exportarReporte() {
    this.mostrarToast('Función de exportación próximamente', 'document-outline');
  }

  async compartirReporte() {
    this.mostrarToast('Función de compartir próximamente', 'share-outline');
  }

  async mostrarError(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 3000,
      position: 'top',
      color: 'danger',
      icon: 'alert-circle-outline'
    });
    toast.present();
  }

  async mostrarToast(mensaje: string, icono: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      position: 'bottom',
      icon: icono
    });
    toast.present();
  }

  getTrendIcon(value: number): string {
    return value >= 0 ? 'trending-up-outline' : 'trending-down-outline';
  }

  getTrendColor(value: number): string {
    return value >= 0 ? 'success' : 'danger';
  }

  get rangoFechasTexto(): string {
    if (!this.usandoFechasPersonalizadas) return '';
    const inicio = new Date(this.fechaInicio);
    const fin = new Date(this.fechaFin);
    return inicio.toLocaleDateString('es-PE') + ' - ' + fin.toLocaleDateString('es-PE');
  }
}