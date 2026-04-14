import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuantityService, QuantityDTO } from '../../services/quantity.service';

type MeasurementType = 'length' | 'weight' | 'volume' | 'temperature';
type Operation = 'compare' | 'convert' | 'add' | 'subtract' | 'divide';

const UNITS: Record<MeasurementType, string[]> = {
  length: ['INCHES', 'FEET', 'YARDS', 'CENTIMETERS'],
  weight: ['GRAM', 'KILOGRAM', 'POUND'],
  volume: ['MILLILITRE', 'LITRE', 'GALLON'],
  temperature: ['CELSIUS', 'FAHRENHEIT', 'KELVIN']
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent {
  private qService = inject(QuantityService);

  measurementTypes: MeasurementType[] = ['length', 'weight', 'volume', 'temperature'];
  operations: { id: Operation; label: string; icon: string; twoInputs: boolean }[] = [
    { id: 'compare',   label: 'Compare',   icon: '⚖️',  twoInputs: true },
    { id: 'convert',   label: 'Convert',   icon: '🔄',  twoInputs: false },
    { id: 'add',       label: 'Add',       icon: '➕',  twoInputs: true },
    { id: 'subtract',  label: 'Subtract',  icon: '➖',  twoInputs: true },
    { id: 'divide',    label: 'Divide',    icon: '➗',  twoInputs: true }
  ];

  selectedType = signal<MeasurementType>('length');
  selectedOp = signal<Operation>('convert');
  value1 = signal(0);
  value2 = signal(0);
  unit1 = signal('INCHES');
  unit2 = signal('FEET');
  result = signal<string | null>(null);
  error = signal<string | null>(null);
  loading = signal(false);

  get units() { return UNITS[this.selectedType()]; }
  get currentOp() { return this.operations.find(o => o.id === this.selectedOp())!; }
  get needsTwoInputs() { return this.currentOp.twoInputs; }

  onTypeChange(type: string) {
    this.selectedType.set(type as MeasurementType);
    const u = this.units;
    this.unit1.set(u[0]);
    this.unit2.set(u[1] ?? u[0]);
    this.result.set(null);
    this.error.set(null);
  }

  onOpChange(op: string) {
    this.selectedOp.set(op as Operation);
    this.result.set(null);
    this.error.set(null);
  }

  calculate() {
    this.result.set(null);
    this.error.set(null);
    this.loading.set(true);

    const q1: QuantityDTO = { value: this.value1(), unit: this.unit1(), measurementType: this.selectedType() };
    const q2: QuantityDTO = { value: this.value2(), unit: this.unit2(), measurementType: this.selectedType() };

    let obs;
    switch (this.selectedOp()) {
      case 'compare':   obs = this.qService.compare({ thisQuantityDTO: q1, thatQuantityDTO: q2 }); break;
      case 'convert':   obs = this.qService.convert({ thisQuantityDTO: q1, thatQuantityDTO: q2 }); break;
      case 'add':       obs = this.qService.add({ thisQuantityDTO: q1, thatQuantityDTO: q2, resultUnit: this.unit2() }); break;
      case 'subtract':  obs = this.qService.subtract({ thisQuantityDTO: q1, thatQuantityDTO: q2, resultUnit: this.unit2() }); break;
      case 'divide':    obs = this.qService.divide({ thisQuantityDTO: q1, thatQuantityDTO: q2 }); break;
    }

    obs.subscribe({
      next: (res) => {
        this.loading.set(false);
        if (this.selectedOp() === 'compare') {
          this.result.set(res.value === 1 ? '✅ Values are EQUAL' : '❌ Values are NOT EQUAL');
        } else if (this.selectedOp() === 'divide') {
          this.result.set(`Result: ${res.value?.toFixed(6)} (scalar)`);
        } else {
          this.result.set(`Result: ${res.value?.toFixed(6)} ${res.unit}`);
        }
      },
      error: (err) => {
        this.loading.set(false);
        // err.error can be a string, an object with errors/message, or a browser ErrorEvent
        let msg = 'Calculation failed. Please check your inputs.';
        if (err?.error) {
          if (typeof err.error === 'string') {
            msg = err.error;
          } else if (err.error?.errors) {
            msg = Object.values(err.error.errors).flat().join('; ');
          } else if (err.error?.message) {
            msg = err.error.message;
          } else if (err.error?.title) {
            msg = err.error.title;
          }
        } else if (err?.message) {
          msg = err.message;
        }
        this.error.set(msg);
      }
    });
  }
}
