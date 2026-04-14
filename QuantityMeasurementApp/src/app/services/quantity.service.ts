import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API = 'http://localhost:5287/api/v1/quantities';

export interface QuantityDTO {
  value: number;
  unit: string;
  measurementType: string;
}

export interface QuantityInputDTO {
  thisQuantityDTO: QuantityDTO;
  thatQuantityDTO: QuantityDTO;
}

export interface QuantityArithmeticInputDTO extends QuantityInputDTO {
  resultUnit: string;
}

export interface MeasurementRecord {
  id: string;
  operationType: string;
  operand1: string;
  operand2?: string;
  result?: string;
  scalarResult?: number;
  hasError: boolean;
  timestamp: string;
  userId?: string;
}

@Injectable({ providedIn: 'root' })
export class QuantityService {
  constructor(private http: HttpClient) {}

  compare(input: QuantityInputDTO): Observable<QuantityDTO> {
    return this.http.post<QuantityDTO>(`${API}/compare`, input);
  }

  convert(input: QuantityInputDTO): Observable<QuantityDTO> {
    return this.http.post<QuantityDTO>(`${API}/convert`, input);
  }

  add(input: QuantityArithmeticInputDTO): Observable<QuantityDTO> {
    return this.http.post<QuantityDTO>(`${API}/add`, input);
  }

  subtract(input: QuantityArithmeticInputDTO): Observable<QuantityDTO> {
    return this.http.post<QuantityDTO>(`${API}/subtract`, input);
  }

  divide(input: QuantityInputDTO): Observable<QuantityDTO> {
    return this.http.post<QuantityDTO>(`${API}/divide`, input);
  }

  getAll(): Observable<MeasurementRecord[]> {
    return this.http.get<MeasurementRecord[]>(`${API}/all`);
  }
}
