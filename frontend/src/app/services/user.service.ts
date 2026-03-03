import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SignupRequest, MessageResponse, UserSummary } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = 'http://localhost:8080/api/users';

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<UserSummary[]> {
    return this.http.get<UserSummary[]>(this.apiUrl);
  }

  createUser(request: SignupRequest): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(this.apiUrl, request);
  }
}
