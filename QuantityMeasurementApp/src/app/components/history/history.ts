import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuantityService, MeasurementRecord } from '../../services/quantity.service';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './history.html',
  styleUrl: './history.css'
})
export class HistoryComponent implements OnInit {
  private qService = inject(QuantityService);

  records = signal<MeasurementRecord[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadHistory();
  }

  loadHistory(): void {
    this.loading.set(true);
    this.error.set(null);
    this.qService.getAll().subscribe({
      next: (data) => {
        this.records.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error ?? 'Failed to load history');
        this.loading.set(false);
      }
    });
  }

  formatResult(r: MeasurementRecord): string {
    if (r.operationType === 'Compare') {
      return r.scalarResult === 1 ? '✅ Equal' : '❌ Not Equal';
    }
    if (r.operationType === 'Divide') {
      return r.scalarResult?.toFixed(6) ?? '—';
    }
    return r.result ?? '—';
  }

  formatDate(ts: string): string {
    return new Date(ts).toLocaleString();
  }

  opClass(op: string): string {
    return op.toLowerCase();
  }
}
