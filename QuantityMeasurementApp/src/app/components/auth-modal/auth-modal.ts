import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { AppStateService } from '../../services/app-state.service';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth-modal.html',
  styleUrl: './auth-modal.css'
})
export class AuthModalComponent {
  private auth = inject(AuthService);
  appState = inject(AppStateService);

  username = '';
  email = '';
  password = '';
  error = '';
  loading = false;

  get isLogin() { return this.appState.modalMode() === 'login'; }

  switchMode() {
    this.error = '';
    this.appState.modalMode.set(this.isLogin ? 'register' : 'login');
  }

  submit() {
    this.error = '';
    this.loading = true;
    const obs = this.isLogin
      ? this.auth.login(this.email, this.password)
      : this.auth.register(this.username, this.email, this.password);

    obs.subscribe({
      next: () => {
        this.loading = false;
        this.appState.closeModal();
        this.appState.navigateTo('history');
      },
      error: err => {
        this.loading = false;
        this.error = err?.error ?? 'Authentication failed. Please try again.';
      }
    });
  }

  close() { this.appState.closeModal(); }
}
