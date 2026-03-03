import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RoomRequest, RoomResponse } from '../models/room.model';
import { Page } from '../models/reservation.model';

@Injectable({ providedIn: 'root' })
export class RoomService {
  private apiUrl = 'http://localhost:8080/api/rooms';

  constructor(private http: HttpClient) {}

  getAllRooms(page = 0, size = 20): Observable<Page<RoomResponse>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<RoomResponse>>(this.apiUrl, { params });
  }

  getRoomById(id: number): Observable<RoomResponse> {
    return this.http.get<RoomResponse>(`${this.apiUrl}/${id}`);
  }

  getAvailableRooms(checkIn: string, checkOut: string): Observable<RoomResponse[]> {
    const params = new HttpParams().set('checkIn', checkIn).set('checkOut', checkOut);
    return this.http.get<RoomResponse[]>(`${this.apiUrl}/available`, { params });
  }

  createRoom(room: RoomRequest): Observable<RoomResponse> {
    return this.http.post<RoomResponse>(this.apiUrl, room);
  }

  updateRoom(id: number, room: RoomRequest): Observable<RoomResponse> {
    return this.http.put<RoomResponse>(`${this.apiUrl}/${id}`, room);
  }

  updateRoomStatus(id: number, status: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/status`, { status });
  }

  deleteRoom(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
