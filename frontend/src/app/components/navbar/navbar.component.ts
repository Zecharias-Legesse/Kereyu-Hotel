import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule, MatDividerModule],
  template: `
    <mat-toolbar color="primary">
      <span routerLink="/dashboard" style="cursor:pointer">Hotel Reservation</span>
      <span style="flex:1"></span>
      @if (auth.isLoggedIn()) {
        <button mat-button routerLink="/rooms">Rooms</button>
        @if (auth.isStaff()) {
          <button mat-button routerLink="/admin">Admin</button>
          <button mat-button routerLink="/reservations">All Reservations</button>
        } @else {
          <button mat-button routerLink="/reservations">My Reservations</button>
        }
        <button mat-icon-button [matMenuTriggerFor]="menu">
          <mat-icon>account_circle</mat-icon>
        </button>
        <mat-menu #menu="matMenu">
          <div style="padding:0 16px;font-weight:500">{{ (auth.currentUser$ | async)?.username }}</div>
          <div style="padding:0 16px 8px;font-size:12px;color:#666">{{ (auth.currentUser$ | async)?.roles?.join(', ') }}</div>
          <mat-divider></mat-divider>
          <button mat-menu-item (click)="logout()">
            <mat-icon>logout</mat-icon> Logout
          </button>
        </mat-menu>
      } @else {
        <button mat-button routerLink="/login">Login</button>
        <button mat-raised-button routerLink="/register">Register</button>
      }
    </mat-toolbar>
  `
})
export class NavbarComponent {
  constructor(public auth: AuthService, private router: Router) {}

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
