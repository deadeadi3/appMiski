import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'perfil-miski',
    loadComponent: () => import('./perfil-miski/perfil-miski.page').then(m => m.PerfilMiskiPage)
  },
  {
    path: 'registro',
    loadComponent: () => import('./registro/registro.page').then(m => m.RegistroPage)
  },
  {
    path: 'button',
    loadComponent: () => import('./button/button.page').then(m => m.ButtonPage)
  },
  // --- AQUÍ ESTÁN LOS QUE FALTABAN ---
  {
    path: 'inventario-miski',
    loadComponent: () => import('./inventario-miski/inventario-miski.page').then(m => m.InventarioMiskiPage)
  },



  {
    path: 'movimientos-miski',
    loadComponent: () => import('./movimientos-miski/movimientos.page').then(m => m.MovimientosPage)
  },



  
  {
    path: 'reportee',
    
    loadComponent: () => import('./reportee/reportee.page').then(m => m.ReporteePage)
  },
  // -----------------------------------

  {
    path: '**',
    redirectTo: 'login'
  }
];