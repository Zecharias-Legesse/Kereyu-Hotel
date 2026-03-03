import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { RoomService } from '../../services/room.service';
import { ReservationService } from '../../services/reservation.service';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { RoomResponse } from '../../models/room.model';
import { UserSummary } from '../../models/auth.model';

@Component({
  selector: 'app-reservation-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatDatepickerModule, MatNativeDateModule, MatSnackBarModule, MatDividerModule, MatIconModule],
  template: `
    <div style="display:flex;justify-content:center;padding:24px">
      <mat-card style="width:500px;padding:24px">
        <mat-card-header>
          <mat-card-title>{{ isAdmin ? 'Assign Reservation' : 'New Reservation' }}</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            @if (isAdmin) {
              <mat-form-field appearance="outline" style="width:100%;margin-top:16px">
                <mat-label>Assign to Guest</mat-label>
                <mat-select formControlName="userId">
                  @for (user of users; track user.id) {
                    <mat-option [value]="user.id">{{ user.fullName }} ({{ user.username }})</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <mat-divider style="margin-bottom:16px"></mat-divider>
              <p style="color:#666;font-size:13px;margin-bottom:8px">Guest not registered yet? Create their account:</p>
              <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px">
                <mat-form-field appearance="outline" style="flex:1;min-width:120px">
                  <mat-label>Full Name</mat-label>
                  <input matInput formControlName="newUserFullName">
                </mat-form-field>
                <mat-form-field appearance="outline" style="flex:1;min-width:120px">
                  <mat-label>Username</mat-label>
                  <input matInput formControlName="newUserUsername">
                </mat-form-field>
                <mat-form-field appearance="outline" style="flex:1;min-width:120px">
                  <mat-label>Email</mat-label>
                  <input matInput formControlName="newUserEmail">
                </mat-form-field>
              </div>
              <button mat-stroked-button type="button" (click)="createAndSelectUser()" [disabled]="creatingUser" style="margin-bottom:16px;width:100%">
                <mat-icon>person_add</mat-icon> {{ creatingUser ? 'Creating...' : 'Create Account & Select' }}
              </button>
              <mat-divider style="margin-bottom:16px"></mat-divider>
            }

            <mat-form-field appearance="outline" style="width:100%" [style.margin-top]="isAdmin ? '0' : '16px'">
              <mat-label>Room</mat-label>
              <mat-select formControlName="roomId">
                @for (room of rooms; track room.id) {
                  <mat-option [value]="room.id">{{ room.roomNumber }} - {{ room.roomType }} ({{ room.pricePerNight }}/night)</mat-option>
                }
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline" style="width:100%">
              <mat-label>Check-in Date</mat-label>
              <input matInput [matDatepicker]="checkInPicker" formControlName="checkInDate">
              <mat-datepicker-toggle matIconSuffix [for]="checkInPicker"></mat-datepicker-toggle>
              <mat-datepicker #checkInPicker></mat-datepicker>
            </mat-form-field>
            <mat-form-field appearance="outline" style="width:100%">
              <mat-label>Check-out Date</mat-label>
              <input matInput [matDatepicker]="checkOutPicker" formControlName="checkOutDate">
              <mat-datepicker-toggle matIconSuffix [for]="checkOutPicker"></mat-datepicker-toggle>
              <mat-datepicker #checkOutPicker></mat-datepicker>
            </mat-form-field>
            <mat-form-field appearance="outline" style="width:100%">
              <mat-label>Number of Guests</mat-label>
              <input matInput type="number" formControlName="numberOfGuests">
            </mat-form-field>
            <mat-form-field appearance="outline" style="width:100%">
              <mat-label>Special Requests</mat-label>
              <textarea matInput formControlName="specialRequests" rows="3"></textarea>
            </mat-form-field>
            <button mat-raised-button color="primary" type="submit" style="width:100%">
              {{ isAdmin ? 'Assign Reservation' : 'Create Reservation' }}
            </button>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class ReservationFormComponent implements OnInit {
  form: FormGroup;
  rooms: RoomResponse[] = [];
  users: UserSummary[] = [];
  isAdmin = false;
  creatingUser = false;

  constructor(
    private fb: FormBuilder,
    private roomService: RoomService,
    private reservationService: ReservationService,
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      userId: [null],
      roomId: [null, Validators.required],
      checkInDate: [null, Validators.required],
      checkOutDate: [null, Validators.required],
      numberOfGuests: [1, [Validators.required, Validators.min(1)]],
      specialRequests: [''],
      newUserFullName: [''],
      newUserUsername: [''],
      newUserEmail: ['']
    });
  }

  ngOnInit() {
    this.isAdmin = this.authService.isStaff();

    this.roomService.getAllRooms(0, 200).subscribe(page => {
      this.rooms = page.content.filter(r => r.status === 'AVAILABLE');
    });

    if (this.isAdmin) {
      this.userService.getAllUsers().subscribe(users => this.users = users);
    }

    const roomId = this.route.snapshot.queryParamMap.get('roomId');
    if (roomId) {
      this.form.patchValue({ roomId: +roomId });
    }
  }

  createAndSelectUser() {
    const fullName = this.form.value.newUserFullName?.trim();
    const username = this.form.value.newUserUsername?.trim();
    const email = this.form.value.newUserEmail?.trim();

    if (!fullName || !username || !email) {
      this.snackBar.open('Please fill in all fields for the new account', 'Close', { duration: 3000 });
      return;
    }

    this.creatingUser = true;
    const password = 'Welcome123!';
    this.userService.createUser({ fullName, username, email, password }).subscribe({
      next: () => {
        this.snackBar.open(`Account created for ${fullName} (temp password: Welcome123!)`, 'Close', { duration: 5000 });
        this.userService.getAllUsers().subscribe(users => {
          this.users = users;
          const newUser = users.find(u => u.username === username);
          if (newUser) {
            this.form.patchValue({ userId: newUser.id });
          }
          this.creatingUser = false;
          this.form.patchValue({ newUserFullName: '', newUserUsername: '', newUserEmail: '' });
        });
      },
      error: (err) => {
        this.creatingUser = false;
        this.snackBar.open(err.error?.message || 'Failed to create account', 'Close', { duration: 3000 });
      }
    });
  }

  onSubmit() {
    if (this.form.invalid) return;

    if (this.isAdmin && !this.form.value.userId) {
      this.snackBar.open('Please select a guest to assign the reservation to', 'Close', { duration: 3000 });
      return;
    }

    const val = this.form.value;
    const request: any = {
      roomId: val.roomId,
      checkInDate: this.formatDate(val.checkInDate),
      checkOutDate: this.formatDate(val.checkOutDate),
      numberOfGuests: val.numberOfGuests,
      specialRequests: val.specialRequests
    };

    if (this.isAdmin && val.userId) {
      request.userId = val.userId;
    }

    this.reservationService.createReservation(request).subscribe({
      next: () => {
        this.snackBar.open('Reservation created!', 'Close', { duration: 3000 });
        this.router.navigate(['/reservations']);
      },
      error: (err) => this.snackBar.open(err.error?.message || 'Failed to create reservation', 'Close', { duration: 3000 })
    });
  }

  private formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}
