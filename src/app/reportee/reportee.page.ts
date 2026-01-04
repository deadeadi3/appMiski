import { Component, ViewChild, ElementRef, inject, AfterViewInit, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { RouterLink, Router } from '@angular/router';
import { UserProfileService } from '../services/user-profile.service'; // <--- IMPORTANTE

// --- LIBRERÍAS DE PDF Y COMPARTIR ---
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
// ------------------------------------

import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonCard, IonCardContent, 
  IonCardHeader, IonCardTitle, IonCardSubtitle, IonButtons, IonNote, IonIcon, IonFabButton, 
  IonFab, IonFabList, IonButton, IonLabel, IonItem, IonList, IonSegmentButton, IonSegment,
  IonBadge, IonChip, IonSkeletonText, IonRefresher, IonRefresherContent,
  IonGrid, IonRow, IonCol, IonProgressBar,
  AlertController, ToastController, Platform, LoadingController
} from '@ionic/angular/standalone';
import { Chart, registerables } from 'chart.js';
import { FirestoreService } from '../services/firestore.service';
import { addIcons } from 'ionicons';
import { 
  trendingUpOutline, trendingDownOutline, statsChartOutline, 
  documentTextOutline, refreshOutline, downloadOutline, shareSocialOutline,
  calendarOutline, cashOutline, cartOutline, alertCircleOutline,
  filterOutline, closeOutline, logoWhatsapp, copyOutline, 
  checkmarkCircleOutline, checkmarkCircle, closeCircle, receiptOutline, 
  trophyOutline, timeOutline, personOutline, addOutline, barChartOutline,
  eyeOutline, eyeOffOutline, chevronDownOutline, todayOutline, 
  calendarNumberOutline, pieChartOutline, cubeOutline, gridOutline,
  fileTrayOutline, chevronDownCircleOutline, shareOutline, saveOutline
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
    IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCardSubtitle, IonButtons, IonNote, 
    IonIcon, IonFabButton, IonFab, IonFabList, IonButton, IonLabel, IonItem, IonList, 
    IonSegmentButton, IonSegment, IonBadge, IonChip, IonSkeletonText, 
    IonRefresher, IonRefresherContent, IonGrid, IonRow, IonCol, IonProgressBar, 
    RouterLink
  ]
})
export class ReporteePage implements AfterViewInit, OnDestroy, OnInit {

  @ViewChild('myChartCanvas') private chartCanvas!: ElementRef;
  public chart: Chart | undefined;
  private destroy$ = new Subject<void>();
  private userProfileService = inject(UserProfileService); // <--- INYECTAR
  avatarUrl: string = 'assets/icon/login.png';

  // Servicios Inyectados
  private firestoreService = inject(FirestoreService);
  private alertController = inject(AlertController);
  private toastController = inject(ToastController);
  private loadingController = inject(LoadingController);
  private router = inject(Router);
  private platform = inject(Platform);


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

  private chartLabels: string[] = [];
  private chartIngresos: number[] = [];
  private chartCostos: number[] = [];

  constructor() {
    addIcons({
      filterOutline, calendarOutline, closeCircle, cashOutline, 
      trendingUpOutline, statsChartOutline, cartOutline, receiptOutline, 
      refreshOutline, trophyOutline, alertCircleOutline, timeOutline, 
      checkmarkCircleOutline, checkmarkCircle, personOutline, 
      documentTextOutline, addOutline, shareSocialOutline, trendingDownOutline, 
      downloadOutline, closeOutline, logoWhatsapp, copyOutline, 
      barChartOutline, eyeOutline, eyeOffOutline, chevronDownOutline,
      todayOutline, calendarNumberOutline, pieChartOutline, cubeOutline,
      gridOutline, fileTrayOutline, chevronDownCircleOutline, shareOutline, saveOutline
    });

    const hoy = new Date();
    this.fechaActual = hoy.toLocaleDateString('es-PE', { 
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    });
    this.fechaFin = hoy.toISOString();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    this.fechaInicio = inicioMes.toISOString();
  }


  ngAfterViewInit(): void {
    if (!this.datosCargados) {
      setTimeout(() => {
        this.cargarDatos('mes');
      }, 0);
    }
  }


  ngOnInit() {
    // SUSCRIPCIÓN PARA AVATAR
    this.userProfileService.userProfile$.subscribe(profile => {
      if (profile && profile.photoURL) {
        this.avatarUrl = profile.photoURL;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.chart) {
      this.chart.destroy();
    }
  }

  async handleRefresh(event: any) {
    await this.cargarDatos(this.filtroActual);
    event.target.complete();
  }

  // --- LÓGICA DE DATOS ---
  async cargarDatos(tipoFiltro: string): Promise<void> {
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

    try {
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 20000));
      const ventasPromise = firstValueFrom(
        this.firestoreService.getVentasPorFecha(inicio, fin, this.incluirCanceladas).pipe(takeUntil(this.destroy$))
      );
      
      const ventas = await Promise.race([ventasPromise, timeoutPromise]) as any[];
      
      this.procesarVentas(ventas);
      this.datosCargados = true;
      this.isLoading = false;
      
      if (ventas.length > 0) {
        this.intentarCrearGrafico(0);
      } else {
        this.graficoListo = false;
      }
      
      if (!this.usandoFechasPersonalizadas) {
        this.cargarComparacionAsync(tipoFiltro).catch(() => {});
      }
      
    } catch (error: any) {
      console.error('Error al cargar datos:', error);
      this.isLoading = false;
      this.datosCargados = true;
      if (!error.message?.includes('Timeout')) {
        await this.mostrarError('Error al cargar los datos.');
      }
    }
  }

  // --- PROCESAMIENTO ---
  procesarVentas(ventas: any[]) {
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
        if (!diasMap.has(diaKey)) diasMap.set(diaKey, { ingreso: 0, costo: 0 });
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
    
    this.chartLabels = labels;
    this.chartIngresos = ingresos;
    this.chartCostos = costos;
    
    this.ventasRecientes = [];
    ventas.forEach((venta) => {
      const total = Number(venta.total_venta) || 0;
      const ganancia = Number(venta.ganancia_neta) || 0; 
      const cantidad = Number(venta.cantidad) || 0;
      sumaVentas += total;
      sumaUtilidad += ganancia;
      sumaItems += cantidad;

      const nombre = venta.nombre_producto || 'Sin nombre';
      if (mapProductos.has(nombre)) {
        const p = mapProductos.get(nombre);
        p.cantidad += cantidad;
        p.total += total;
      } else {
        mapProductos.set(nombre, { nombre: nombre, cantidad: cantidad, total: total });
      }
    });

    this.kpiData.ventas = sumaVentas;
    this.kpiData.utilidad = sumaUtilidad;
    this.kpiData.items = sumaItems;
    this.kpiData.facturas = ventas.length;
    this.kpiData.margen = sumaVentas > 0 ? (sumaUtilidad / sumaVentas) * 100 : 0;

    this.topProductos = Array.from(mapProductos.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }

  // --- GRÁFICO Y UTILIDADES ---
  private intentarCrearGrafico(intento: number): void {
    const maxIntentos = 10;
    if (this.chartCanvas && this.chartCanvas.nativeElement) {
      this.initializeOrUpdateChart();
    } else if (intento < maxIntentos) {
      setTimeout(() => { this.intentarCrearGrafico(intento + 1); }, 100);
    }
  }

  private initializeOrUpdateChart(): void {
    if (!this.chartCanvas || !this.chartCanvas.nativeElement) return;
    if (this.chart) {
      this.chart.destroy();
      this.chart = undefined;
    }
    this.createChart();
    this.graficoListo = true;
  }

  createChart() {
    if (!this.chartCanvas || !this.chartCanvas.nativeElement) return;
    const canvasElement = this.chartCanvas.nativeElement;
    canvasElement.width = canvasElement.offsetWidth;
    canvasElement.height = 220;
    const ctx = canvasElement.getContext('2d');
    if (!ctx) return;

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.chartLabels,
        datasets: [
          { 
            label: 'Ingresos', 
            data: this.chartIngresos, 
            borderColor: '#0066ff', 
            backgroundColor: 'rgba(0, 102, 255, 0.05)', 
            fill: true, 
            tension: 0.4, 
            borderWidth: 2, 
            pointRadius: 3 
          },
          { 
            label: 'Costos', 
            data: this.chartCostos, 
            borderColor: '#94a3b8', 
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
        plugins: { legend: { display: false } }, 
        scales: { 
          y: { beginAtZero: true, grid: { color: '#f1f5f9' }, ticks: { font: { size: 10 } } }, 
          x: { grid: { display: false }, ticks: { font: { size: 10 } } } 
        } 
      }
    });
  }

  // --- PDF Y COMPARTIR ---
  private async generarBlobPDF(): Promise<Blob | null> {
    const loading = await this.loadingController.create({
      message: 'Generando reporte...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      const element = document.querySelector('.dashboard-content') as HTMLElement;
      if (!element) throw new Error('No se encontró el contenido del reporte');

      const canvas = await html2canvas(element, {
        scale: 2, 
        useCORS: true,
        logging: false,
        backgroundColor: '#f4f6f9'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.setFontSize(18);
      pdf.setTextColor(50, 82, 152);
      pdf.text('Reporte Financiero Miski', 10, 15);
      
      pdf.setFontSize(10);
      pdf.setTextColor(100);
      pdf.text(`Fecha: ${new Date().toLocaleDateString()}`, 10, 22);

      pdf.addImage(imgData, 'PNG', 0, 30, pdfWidth, pdfHeight);

      loading.dismiss();
      return pdf.output('blob');

    } catch (error) {
      console.error('Error PDF:', error);
      loading.dismiss();
      return null;
    }
  }

  async exportarReporte() {
    const blob = await this.generarBlobPDF();
    if (!blob) {
      this.mostrarError('Error al crear PDF');
      return;
    }

    const fileName = `Reporte_Miski_${Date.now()}.pdf`;

    if (!this.platform.is('capacitor')) {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      window.URL.revokeObjectURL(url);
      this.mostrarToast('Reporte descargado', 'checkmark-circle-outline');
    } else {
      try {
        const base64 = await this.blobToBase64(blob);
        const savedFile = await Filesystem.writeFile({
          path: fileName,
          data: base64,
          directory: Directory.Documents
        });
        this.mostrarToast('Guardado en Documentos', 'save-outline');
      } catch (e) {
        console.error(e);
        this.mostrarError('Error al guardar en dispositivo');
      }
    }
  }

  async compartirReporte() {
    const blob = await this.generarBlobPDF();
    if (!blob) {
      this.mostrarError('Error al generar para compartir');
      return;
    }
    try {
      const fileName = `Reporte_Miski_${Date.now()}.pdf`;
      const base64 = await this.blobToBase64(blob);
      const savedFile = await Filesystem.writeFile({
        path: fileName,
        data: base64,
        directory: Directory.Cache
      });
      await Share.share({
        title: 'Reporte Miski',
        text: 'Reporte financiero generado desde App Miski',
        url: savedFile.uri,
        dialogTitle: 'Compartir PDF'
      });
    } catch (error) {
      console.error('Error al compartir:', error);
    }
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.readAsDataURL(blob);
    });
  }

  // --- NAVEGACIÓN ---
  irAlPerfil() {
    this.router.navigate(['/perfil-miski']);
  }

  irAlInicio() {
    this.router.navigate(['/button']);
  }

  // --- HELPERS ---
  randomize() { this.cargarDatos(this.filtroActual); }
  
  async mostrarError(mensaje: string) {
    const toast = await this.toastController.create({ message: mensaje, duration: 3000, position: 'top', color: 'danger' });
    toast.present();
  }

  async mostrarToast(mensaje: string, icono: string) {
    const toast = await this.toastController.create({ message: mensaje, duration: 2000, position: 'bottom', icon: icono });
    toast.present();
  }

  getTrendIcon(value: number): string { return value >= 0 ? 'trending-up-outline' : 'trending-down-outline'; }

  get rangoFechasTexto(): string {
    if (!this.usandoFechasPersonalizadas) return '';
    const inicio = new Date(this.fechaInicio);
    const fin = new Date(this.fechaFin);
    return `${inicio.getDate()}/${inicio.getMonth()+1} - ${fin.getDate()}/${fin.getMonth()+1}`;
  }

  convertirFecha(fecha: any): Date {
    if (fecha && fecha.seconds) return new Date(fecha.seconds * 1000);
    else if (fecha && fecha.toDate) return fecha.toDate();
    else return new Date(fecha);
  }

  async abrirSelectorFechas() {
    const alert = await this.alertController.create({
      header: 'Filtrar por Fechas',
      inputs: [
        { name: 'fechaInicio', type: 'date', value: this.fechaInicio.split('T')[0], label: 'Inicio' },
        { name: 'fechaFin', type: 'date', value: this.fechaFin.split('T')[0], label: 'Fin' }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Aplicar', handler: (data) => {
            if (data.fechaInicio && data.fechaFin) {
              this.fechaInicio = new Date(data.fechaInicio + 'T00:00:00').toISOString();
              this.fechaFin = new Date(data.fechaFin + 'T23:59:59').toISOString();
              this.usandoFechasPersonalizadas = true;
              this.filtroActual = 'personalizado';
              this.cargarDatos('personalizado');
            }
          }}
      ]
    });
    await alert.present();
  }

  calcularRangoFechas(filtro: string) {
    const ahora = new Date();
    let inicio = new Date(ahora);
    let fin = new Date(ahora);
    fin.setHours(23, 59, 59, 999);
    if (filtro === 'dia') inicio.setHours(0, 0, 0, 0);
    else if (filtro === 'semana') { inicio.setDate(ahora.getDate() - 7); inicio.setHours(0, 0, 0, 0); }
    else if (filtro === 'mes') { inicio.setDate(1); inicio.setHours(0, 0, 0, 0); }
    return { inicio, fin };
  }

  calcularRangoPeriodoAnterior(filtro: string) {
    const { inicio, fin } = this.calcularRangoFechas(filtro);
    const diferencia = fin.getTime() - inicio.getTime();
    const finAnterior = new Date(inicio.getTime() - 1);
    const inicioAnterior = new Date(finAnterior.getTime() - diferencia);
    return { inicio: inicioAnterior, fin: finAnterior };
  }

  private async cargarComparacionAsync(tipoFiltro: string): Promise<void> {
    try {
      const { inicio: inicioAnterior, fin: finAnterior } = this.calcularRangoPeriodoAnterior(tipoFiltro);
      const ventasAnteriores = await firstValueFrom(
        this.firestoreService.getVentasPorFecha(inicioAnterior, finAnterior, this.incluirCanceladas)
      );
      this.calcularComparacion(ventasAnteriores);
    } catch (error) { console.error(error); }
  }

  // --- ¡AQUÍ ESTÁ LA FUNCIÓN QUE FALTABA! ---
  calcularComparacion(ventasAnteriores: any[]) {
    let sumaVentasAnt = 0;
    let sumaUtilidadAnt = 0;
    ventasAnteriores.forEach(venta => {
      sumaVentasAnt += Number(venta.total_venta) || 0;
      sumaUtilidadAnt += Number(venta.ganancia_neta) || 0;
    });
    this.comparacion.ventas = sumaVentasAnt > 0 ? ((this.kpiData.ventas - sumaVentasAnt) / sumaVentasAnt) * 100 : 0;
    this.comparacion.utilidad = sumaUtilidadAnt > 0 ? ((this.kpiData.utilidad - sumaUtilidadAnt) / sumaUtilidadAnt) * 100 : 0;
  }
  // ------------------------------------------

  cambiarFiltro(event: any) {
    this.usandoFechasPersonalizadas = false;
    this.cargarDatos(event.detail.value);
  }

  get tieneDatosGrafico(): boolean {
    return this.chartLabels.length > 0 && this.chartIngresos.some(ing => ing > 0) && this.datosCargados;
  }
}