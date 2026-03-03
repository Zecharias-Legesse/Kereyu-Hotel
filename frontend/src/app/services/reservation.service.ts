import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ReservationRequest, ReservationResponse, ReservationApproval, Page } from '../models/reservation.model';

@Injectable({ providedIn: 'root' })
export class ReservationService {
  private apiUrl = 'http://localhost:8080/api/reservations';

  constructor(private http: HttpClient) {}

  createReservation(request: ReservationRequest): Observable<ReservationResponse> {
    return this.http.post<ReservationResponse>(this.apiUrl, request);
  }

  getReservationById(id: number): Observable<ReservationResponse> {
    return this.http.get<ReservationResponse>(`${this.apiUrl}/${id}`);
  }

  getAllReservations(page = 0, size = 20): Observable<Page<ReservationResponse>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<ReservationResponse>>(this.apiUrl, { params });
  }

  getMyReservations(page = 0, size = 20): Observable<Page<ReservationResponse>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<ReservationResponse>>(`${this.apiUrl}/my-reservations`, { params });
  }

  updateReservation(id: number, request: ReservationRequest): Observable<ReservationResponse> {
    return this.http.put<ReservationResponse>(`${this.apiUrl}/${id}`, request);
  }

  approveReservation(id: number, approval: ReservationApproval): Observable<ReservationResponse> {
    return this.http.patch<ReservationResponse>(`${this.apiUrl}/${id}/approve`, approval);
  }

  cancelReservation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
