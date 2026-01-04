import { Injectable } from '@angular/core';

export interface PieChartData {
  label: string;
  percentage: number;
  color: string;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {

  getPieChartData(): PieChartData[] {
    return [
      { label: 'Limpiador Multiusos', percentage: 20, color: '#3498db' },
      { label: 'Desinfectante Germ Max', percentage: 30, color: '#2980b9' },
      { label: 'Rollos Papel Industrial', percentage: 12.5, color: '#45b7d1' },
      { label: 'Rollos Papel Industrial', percentage: 25, color: '#5dade2' },
      { label: 'Aromatizador de Pinos', percentage: 12.5, color: '#7fcd91' }
    ];
  }
}
