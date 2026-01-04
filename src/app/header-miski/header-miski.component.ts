import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { UserProfileService } from '../services/user-profile.service';

@Component({
  selector: 'app-header-miski',
  templateUrl: './header-miski.component.html',
  styleUrls: ['./header-miski.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterLink]
})
export class HeaderMiskiComponent implements OnInit {
  avatarUrl: string = 'assets/icon/login2.svg';
  showBackButton: boolean = true;

  constructor(
    private userProfileService: UserProfileService,
    private router: Router
  ) {}

  ngOnInit() {
    // Suscribirse a cambios de avatar
    this.userProfileService.avatar$.subscribe(avatar => {
      this.avatarUrl = avatar || 'assets/icon/login2.svg';
    });

    // No mostrar botón atrás en la página principal
    this.router.events.subscribe(() => {
      // Puedes agregar lógica para determinar si mostrar o no el botón atrás
    });
  }

  irAlPerfil() {
    this.router.navigate(['/perfil-miski']);
  }

  irAlInicio() {
    this.router.navigate(['/button']);
  }


}
