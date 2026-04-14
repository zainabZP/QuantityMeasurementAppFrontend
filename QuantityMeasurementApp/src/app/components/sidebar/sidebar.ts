import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppStateService } from '../../services/app-state.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class SidebarComponent {
  appState = inject(AppStateService);
  auth = inject(AuthService);

  navigateTo(view: 'dashboard' | 'history') {
    if (view === 'history' && !this.auth.isLoggedIn()) {
      this.appState.openModal('login');
      return;
    }
    this.appState.navigateTo(view);
  }
}
