import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppStateService } from '../../services/app-state.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent {
  appState = inject(AppStateService);
  auth = inject(AuthService);

  onHistoryClick() {
    if (!this.auth.isLoggedIn()) {
      this.appState.openModal('login');
    } else {
      this.appState.navigateTo('history');
    }
  }

  onDashboardClick() {
    this.appState.navigateTo('dashboard');
  }

  logout() {
    this.auth.logout();
    this.appState.navigateTo('dashboard');
  }

  toggleSidebar() {
    this.appState.toggleSidebar();
  }
}
