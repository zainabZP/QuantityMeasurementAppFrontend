import { Injectable, signal } from '@angular/core';

export type AppView = 'dashboard' | 'history';
export type ModalMode = 'login' | 'register';

@Injectable({ providedIn: 'root' })
export class AppStateService {
  showAuthModal = signal(false);
  modalMode = signal<ModalMode>('login');
  activeView = signal<AppView>('dashboard');
  sidebarOpen = signal(true);

  openModal(mode: ModalMode = 'login'): void {
    this.modalMode.set(mode);
    this.showAuthModal.set(true);
  }

  closeModal(): void {
    this.showAuthModal.set(false);
  }

  navigateTo(view: AppView): void {
    this.activeView.set(view);
  }

  toggleSidebar(): void {
    this.sidebarOpen.update(v => !v);
  }
}
