import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatExpansionModule } from '@angular/material/expansion';
import { RoomService } from '../../services/room.service';
import { AuthService } from '../../services/auth.service';
import { RoomResponse } from '../../models/room.model';

@Component({
  selector: 'app-rooms',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, MatCardModule, MatButtonModule, MatChipsModule, MatFormFieldModule, MatInputModule, MatIconModule, MatSnackBarModule, MatMenuModule, MatSelectModule, MatExpansionModule],
  template: `
    <div style="padding:24px;max-width:1100px;margin:0 auto">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px">
        <h1>Rooms</h1>
        @if (auth.isStaff()) {
          <button mat-raised-button color="primary" routerLink="/rooms/new">
            <mat-icon>add</mat-icon> Add Room
          </button>
        }
      </div>

      <!-- Search bar -->
      <mat-form-field appearance="outline" style="width:100%;margin-bottom:16px">
        <mat-label>Search by room number</mat-label>
        <input matInput [(ngModel)]="searchQuery" (ngModelChange)="applyFilters()" placeholder="e.g. 101, 302...">
        <mat-icon matSuffix>search</mat-icon>
      </mat-form-field>

      <!-- Filters -->
      <mat-expansion-panel style="margin-bottom:24px">
        <mat-expansion-panel-header>
          <mat-panel-title>Filters</mat-panel-title>
          <mat-panel-description>Filter by type, floor, capacity, price</mat-panel-description>
        </mat-expansion-panel-header>
        <div style="display:flex;gap:16px;flex-wrap:wrap;padding:8px 0">
          <mat-form-field appearance="outline" style="width:160px">
            <mat-label>Room Type</mat-label>
            <mat-select [(value)]="filterType" (selectionChange)="applyFilters()">
              <mat-option value="ALL">All Types</mat-option>
              <mat-option value="SINGLE">Single</mat-option>
              <mat-option value="DOUBLE">Double</mat-option>
              <mat-option value="DELUXE">Deluxe</mat-option>
              <mat-option value="SUITE">Suite</mat-option>
              <mat-option value="PRESIDENTIAL">Presidential</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline" style="width:140px">
            <mat-label>Floor</mat-label>
            <mat-select [(value)]="filterFloor" (selectionChange)="applyFilters()">
              <mat-option value="ALL">All Floors</mat-option>
              @for (f of availableFloors; track f) {
                <mat-option [value]="f">Floor {{ f }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline" style="width:140px">
            <mat-label>Min Capacity</mat-label>
            <mat-select [(value)]="filterCapacity" (selectionChange)="applyFilters()">
              <mat-option value="0">Any</mat-option>
              <mat-option value="1">1+</mat-option>
              <mat-option value="2">2+</mat-option>
              <mat-option value="3">3+</mat-option>
              <mat-option value="4">4+</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline" style="width:140px">
            <mat-label>Max Price</mat-label>
            <mat-select [(value)]="filterMaxPrice" (selectionChange)="applyFilters()">
              <mat-option value="0">Any</mat-option>
              <mat-option value="100">Under \$100</mat-option>
              <mat-option value="150">Under \$150</mat-option>
              <mat-option value="250">Under \$250</mat-option>
              <mat-option value="400">Under \$400</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline" style="width:140px">
            <mat-label>Status</mat-label>
            <mat-select [(value)]="filterStatus" (selectionChange)="applyFilters()">
              <mat-option value="ALL">All</mat-option>
              <mat-option value="AVAILABLE">Available</mat-option>
              <mat-option value="OCCUPIED">Occupied</mat-option>
              <mat-option value="MAINTENANCE">Maintenance</mat-option>
              <mat-option value="CLEANING">Cleaning</mat-option>
            </mat-select>
          </mat-form-field>
          <button mat-button (click)="clearFilters()">Clear Filters</button>
        </div>
      </mat-expansion-panel>

      <!-- Availability search -->
      <mat-card style="margin-bottom:24px;padding:16px">
        <form [formGroup]="searchForm" (ngSubmit)="searchAvailable()" style="display:flex;gap:16px;align-items:center;flex-wrap:wrap">
          <mat-form-field appearance="outline">
            <mat-label>Check-in Date</mat-label>
            <input matInput type="date" formControlName="checkIn">
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Check-out Date</mat-label>
            <input matInput type="date" formControlName="checkOut">
          </mat-form-field>
          <button mat-raised-button color="accent" type="submit">Search Available</button>
          <button mat-button type="button" (click)="loadAllRooms()">Show All</button>
        </form>
      </mat-card>

      <p style="color:#666;margin-bottom:16px">Showing {{ filteredRooms.length }} of {{ allRooms.length }} rooms</p>

      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px">
        @for (room of filteredRooms; track room.id) {
          <mat-card>
            <mat-card-header>
              <mat-card-title>Room {{ room.roomNumber }}</mat-card-title>
              <mat-card-subtitle>{{ room.roomType }} | Floor {{ room.floor }}</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content style="padding:16px 0">
              <p><strong>\${{ room.pricePerNight }}</strong> / night</p>
              <p>Capacity: {{ room.capacity }} guests</p>
              @if (room.description) { <p style="color:#666">{{ room.description }}</p> }
              <mat-chip-set>
                <mat-chip
                  [style.background-color]="getStatusColor(room.status)"
                  style="color:white">
                  {{ room.status }}
                </mat-chip>
              </mat-chip-set>
            </mat-card-content>
            <mat-card-actions>
              @if (room.status === 'AVAILABLE' && auth.isLoggedIn() && !auth.isStaff()) {
                <button mat-button color="primary" [routerLink]="['/reservations/new']" [queryParams]="{roomId: room.id}">
                  Book Now
                </button>
              }
              @if (auth.isStaff()) {
                <button mat-button [routerLink]="['/rooms/edit', room.id]">Edit</button>
                <button mat-button [matMenuTriggerFor]="statusMenu">Status</button>
                <mat-menu #statusMenu="matMenu">
                  <button mat-menu-item (click)="changeStatus(room.id, 'AVAILABLE')">Available</button>
                  <button mat-menu-item (click)="changeStatus(room.id, 'MAINTENANCE')">Maintenance</button>
                  <button mat-menu-item (click)="changeStatus(room.id, 'CLEANING')">Cleaning</button>
                </mat-menu>
                <button mat-button color="warn" (click)="deleteRoom(room.id)">Delete</button>
              }
            </mat-card-actions>
          </mat-card>
        }
      </div>

      @if (filteredRooms.length === 0) {
        <p style="text-align:center;color:#666;margin-top:32px">No rooms found matching your criteria.</p>
      }
    </div>
  `
})
export class RoomsComponent implements OnInit {
  allRooms: RoomResponse[] = [];
  filteredRooms: RoomResponse[] = [];
  searchForm: FormGroup;

  searchQuery = '';
  filterType = 'ALL';
  filterFloor: string = 'ALL';
  filterCapacity = '0';
  filterMaxPrice = '0';
  filterStatus = 'ALL';
  availableFloors: number[] = [];

  constructor(
    private roomService: RoomService,
    public auth: AuthService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.searchForm = this.fb.group({ checkIn: [''], checkOut: [''] });
  }

  ngOnInit() {
    this.loadAllRooms();
  }

  loadAllRooms() {
    this.roomService.getAllRooms(0, 200).subscribe({
      next: (page) => {
        this.allRooms = page.content;
        this.availableFloors = [...new Set(this.allRooms.map(r => r.floor))].sort();
        this.applyFilters();
      },
      error: () => this.snackBar.open('Failed to load rooms', 'Close', { duration: 3000 })
    });
  }

  applyFilters() {
    let rooms = this.allRooms;

    if (this.searchQuery.trim()) {
      rooms = rooms.filter(r => r.roomNumber.includes(this.searchQuery.trim()));
    }
    if (this.filterType !== 'ALL') {
      rooms = rooms.filter(r => r.roomType === this.filterType);
    }
    if (this.filterFloor !== 'ALL') {
      rooms = rooms.filter(r => r.floor === +this.filterFloor);
    }
    if (+this.filterCapacity > 0) {
      rooms = rooms.filter(r => r.capacity >= +this.filterCapacity);
    }
    if (+this.filterMaxPrice > 0) {
      rooms = rooms.filter(r => r.pricePerNight <= +this.filterMaxPrice);
    }
    if (this.filterStatus !== 'ALL') {
      rooms = rooms.filter(r => r.status === this.filterStatus);
    }

    this.filteredRooms = rooms;
  }

  clearFilters() {
    this.searchQuery = '';
    this.filterType = 'ALL';
    this.filterFloor = 'ALL';
    this.filterCapacity = '0';
    this.filterMaxPrice = '0';
    this.filterStatus = 'ALL';
    this.applyFilters();
  }

  searchAvailable() {
    const { checkIn, checkOut } = this.searchForm.value;
    if (!checkIn || !checkOut) {
      this.snackBar.open('Please select both dates', 'Close', { duration: 3000 });
      return;
    }
    this.roomService.getAvailableRooms(checkIn, checkOut).subscribe({
      next: (rooms) => {
        this.allRooms = rooms;
        this.applyFilters();
      },
      error: () => this.snackBar.open('Search failed', 'Close', { duration: 3000 })
    });
  }

  changeStatus(roomId: number, status: string) {
    this.roomService.updateRoomStatus(roomId, status).subscribe({
      next: () => {
        this.snackBar.open(`Room status updated to ${status}`, 'Close', { duration: 3000 });
        this.loadAllRooms();
      },
      error: () => this.snackBar.open('Failed to update status', 'Close', { duration: 3000 })
    });
  }

  deleteRoom(roomId: number) {
    if (confirm('Are you sure you want to delete this room?')) {
      this.roomService.deleteRoom(roomId).subscribe({
        next: () => {
          this.snackBar.open('Room deleted', 'Close', { duration: 3000 });
          this.loadAllRooms();
        },
        error: () => this.snackBar.open('Failed to delete room', 'Close', { duration: 3000 })
      });
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'AVAILABLE': return '#4caf50';
      case 'OCCUPIED': return '#f44336';
      case 'MAINTENANCE': return '#ff9800';
      case 'CLEANING': return '#2196f3';
      default: return '#9e9e9e';
    }
  }
}
