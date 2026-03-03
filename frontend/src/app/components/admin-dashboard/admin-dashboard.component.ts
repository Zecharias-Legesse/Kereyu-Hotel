import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { RoomService } from '../../services/room.service';
import { ReservationService } from '../../services/reservation.service';
import { RoomResponse } from '../../models/room.model';
import { ReservationResponse } from '../../models/reservation.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule, MatTableModule, MatChipsModule],
  template: `
    <div style="padding:24px;max-width:1100px;margin:0 auto">
      <h1>Admin Dashboard</h1>

      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px;margin-bottom:32px">
        <mat-card>
          <mat-card-content style="text-align:center;padding:24px">
            <mat-icon style="font-size:40px;width:40px;height:40px;color:#3f51b5">hotel</mat-icon>
            <h2 style="margin:8px 0 0">{{ totalRooms }}</h2>
            <p style="color:#666;margin:0">Total Rooms</p>
          </mat-card-content>
        </mat-card>
        <mat-card>
          <mat-card-content style="text-align:center;padding:24px">
            <mat-icon style="font-size:40px;width:40px;height:40px;color:#4caf50">check_circle</mat-icon>
            <h2 style="margin:8px 0 0">{{ availableRooms }}</h2>
            <p style="color:#666;margin:0">Available</p>
          </mat-card-content>
        </mat-card>
        <mat-card>
          <mat-card-content style="text-align:center;padding:24px">
            <mat-icon style="font-size:40px;width:40px;height:40px;color:#f44336">do_not_disturb</mat-icon>
            <h2 style="margin:8px 0 0">{{ occupiedRooms }}</h2>
            <p style="color:#666;margin:0">Occupied</p>
          </mat-card-content>
        </mat-card>
        <mat-card>
          <mat-card-content style="text-align:center;padding:24px">
            <mat-icon style="font-size:40px;width:40px;height:40px;color:#ff9800">pending_actions</mat-icon>
            <h2 style="margin:8px 0 0">{{ pendingReservations }}</h2>
            <p style="color:#666;margin:0">Pending Reservations</p>
          </mat-card-content>
        </mat-card>
      </div>

      <div style="display:flex;gap:16px;margin-bottom:32px">
        <button mat-raised-button color="primary" routerLink="/rooms/new">
          <mat-icon>add</mat-icon> Add Room
        </button>
        <button mat-raised-button routerLink="/reservations">
          <mat-icon>assignment</mat-icon> Manage Reservations
        </button>
        <button mat-raised-button routerLink="/rooms">
          <mat-icon>hotel</mat-icon> Manage Rooms
        </button>
      </div>

      <h2>Recent Reservations</h2>
      @if (recentReservations.length > 0) {
        <table mat-table [dataSource]="recentReservations" style="width:100%">
          <ng-container matColumnDef="reservationNumber">
            <th mat-header-cell *matHeaderCellDef>Reservation #</th>
            <td mat-cell *matCellDef="let r">{{ r.reservationNumber }}</td>
          </ng-container>
          <ng-container matColumnDef="userName">
            <th mat-header-cell *matHeaderCellDef>Guest</th>
            <td mat-cell *matCellDef="let r">{{ r.userName }}</td>
          </ng-container>
          <ng-container matColumnDef="roomNumber">
            <th mat-header-cell *matHeaderCellDef>Room</th>
            <td mat-cell *matCellDef="let r">{{ r.roomNumber }}</td>
          </ng-container>
          <ng-container matColumnDef="checkIn">
            <th mat-header-cell *matHeaderCellDef>Check-in</th>
            <td mat-cell *matCellDef="let r">{{ r.checkInDate }}</td>
          </ng-container>
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let r">
              <span [style.color]="getStatusColor(r.status)" style="font-weight:500">{{ r.status }}</span>
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="recentColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: recentColumns"></tr>
        </table>
      } @else {
        <p style="color:#666">No reservations yet.</p>
      }
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  totalRooms = 0;
  availableRooms = 0;
  occupiedRooms = 0;
  pendingReservations = 0;
  recentReservations: ReservationResponse[] = [];
  recentColumns = ['reservationNumber', 'userName', 'roomNumber', 'checkIn', 'status'];

  constructor(
    private roomService: RoomService,
    private reservationService: ReservationService
  ) {}

  ngOnInit() {
    this.roomService.getAllRooms(0, 100).subscribe(page => {
      const rooms = page.content;
      this.totalRooms = rooms.length;
      this.availableRooms = rooms.filter(r => r.status === 'AVAILABLE').length;
      this.occupiedRooms = rooms.filter(r => r.status === 'OCCUPIED').length;
    });

    this.reservationService.getAllReservations(0, 10).subscribe(page => {
      const reservations = page.content;
      this.pendingReservations = reservations.filter(r => r.status === 'PENDING').length;
      this.recentReservations = reservations.slice(0, 5);
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'CONFIRMED': return '#4caf50';
      case 'PENDING': return '#ff9800';
      case 'CANCELLED': case 'REJECTED': return '#f44336';
      case 'CHECKED_IN': return '#2196f3';
      case 'CHECKED_OUT': return '#9e9e9e';
      default: return '#000';
    }
  }
}
