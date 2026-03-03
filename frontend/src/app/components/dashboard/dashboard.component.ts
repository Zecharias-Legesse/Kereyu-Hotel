import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';
import { JwtResponse } from '../../models/auth.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div style="padding:24px;max-width:900px;margin:0 auto">
      <h1>Welcome, {{ user?.username }}!</h1>
      <p style="color:#666;margin-bottom:32px">Role: {{ user?.roles?.join(', ') }}</p>

      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:16px">
        <mat-card>
          <mat-card-header>
            <mat-icon mat-card-avatar style="font-size:40px;width:40px;height:40px;color:#3f51b5">hotel</mat-icon>
            <mat-card-title>Browse Rooms</mat-card-title>
            <mat-card-subtitle>View available rooms</mat-card-subtitle>
          </mat-card-header>
          <mat-card-actions>
            <button mat-button color="primary" routerLink="/rooms">View Rooms</button>
          </mat-card-actions>
        </mat-card>

        @if (!isStaff) {
          <mat-card>
            <mat-card-header>
              <mat-icon mat-card-avatar style="font-size:40px;width:40px;height:40px;color:#4caf50">book_online</mat-icon>
              <mat-card-title>My Reservations</mat-card-title>
              <mat-card-subtitle>View your bookings</mat-card-subtitle>
            </mat-card-header>
            <mat-card-actions>
              <button mat-button color="primary" routerLink="/reservations">View Reservations</button>
            </mat-card-actions>
          </mat-card>
        }

        @if (isStaff) {
          <mat-card>
            <mat-card-header>
              <mat-icon mat-card-avatar style="font-size:40px;width:40px;height:40px;color:#ff9800">admin_panel_settings</mat-icon>
              <mat-card-title>Admin Dashboard</mat-card-title>
              <mat-card-subtitle>Manage hotel operations</mat-card-subtitle>
            </mat-card-header>
            <mat-card-actions>
              <button mat-button color="primary" routerLink="/admin">Go to Admin</button>
            </mat-card-actions>
          </mat-card>

          <mat-card>
            <mat-card-header>
              <mat-icon mat-card-avatar style="font-size:40px;width:40px;height:40px;color:#ff9800">assignment</mat-icon>
              <mat-card-title>Manage Reservations</mat-card-title>
              <mat-card-subtitle>Approve or reject bookings</mat-card-subtitle>
            </mat-card-header>
            <mat-card-actions>
              <button mat-button color="primary" routerLink="/reservations">Manage</button>
            </mat-card-actions>
          </mat-card>

          <mat-card>
            <mat-card-header>
              <mat-icon mat-card-avatar style="font-size:40px;width:40px;height:40px;color:#9c27b0">add_business</mat-icon>
              <mat-card-title>Add Room</mat-card-title>
              <mat-card-subtitle>Create a new room</mat-card-subtitle>
            </mat-card-header>
            <mat-card-actions>
              <button mat-button color="primary" routerLink="/rooms/new">Add Room</button>
            </mat-card-actions>
          </mat-card>
        }
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  user: JwtResponse | null = null;
  isStaff = false;

  constructor(private auth: AuthService) {}

  ngOnInit() {
    this.auth.currentUser$.subscribe(u => {
      this.user = u;
      this.isStaff = this.auth.isStaff();
    });
  }
}
