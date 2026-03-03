import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { RoomService } from '../../services/room.service';

@Component({
  selector: 'app-room-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatSnackBarModule],
  template: `
    <div style="display:flex;justify-content:center;padding:24px">
      <mat-card style="width:500px;padding:24px">
        <mat-card-header>
          <mat-card-title>{{ isEdit ? 'Edit Room' : 'Add Room' }}</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" style="width:100%;margin-top:16px">
              <mat-label>Room Number</mat-label>
              <input matInput formControlName="roomNumber">
            </mat-form-field>
            <mat-form-field appearance="outline" style="width:100%">
              <mat-label>Room Type</mat-label>
              <mat-select formControlName="roomType">
                @for (type of roomTypes; track type) {
                  <mat-option [value]="type">{{ type }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline" style="width:100%">
              <mat-label>Price Per Night</mat-label>
              <input matInput type="number" formControlName="pricePerNight">
            </mat-form-field>
            <mat-form-field appearance="outline" style="width:100%">
              <mat-label>Capacity</mat-label>
              <input matInput type="number" formControlName="capacity">
            </mat-form-field>
            <mat-form-field appearance="outline" style="width:100%">
              <mat-label>Floor</mat-label>
              <input matInput type="number" formControlName="floor">
            </mat-form-field>
            <mat-form-field appearance="outline" style="width:100%">
              <mat-label>Description</mat-label>
              <textarea matInput formControlName="description" rows="3"></textarea>
            </mat-form-field>
            <mat-form-field appearance="outline" style="width:100%">
              <mat-label>Amenities</mat-label>
              <input matInput formControlName="amenities" placeholder="WiFi, TV, Mini Bar">
            </mat-form-field>
            <button mat-raised-button color="primary" type="submit" style="width:100%">
              {{ isEdit ? 'Update' : 'Create' }} Room
            </button>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class RoomFormComponent implements OnInit {
  form: FormGroup;
  isEdit = false;
  roomId: number | null = null;
  roomTypes = ['SINGLE', 'DOUBLE', 'DELUXE', 'SUITE', 'PRESIDENTIAL'];

  constructor(
    private fb: FormBuilder,
    private roomService: RoomService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      roomNumber: ['', Validators.required],
      roomType: ['SINGLE', Validators.required],
      pricePerNight: [100, [Validators.required, Validators.min(1)]],
      capacity: [2, [Validators.required, Validators.min(1)]],
      floor: [1, [Validators.required, Validators.min(1)]],
      description: [''],
      amenities: ['']
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.roomId = +id;
      this.roomService.getRoomById(this.roomId).subscribe(room => {
        this.form.patchValue(room);
      });
    }
  }

  onSubmit() {
    if (this.form.invalid) return;
    const request = this.form.value;
    const obs = this.isEdit && this.roomId
      ? this.roomService.updateRoom(this.roomId, request)
      : this.roomService.createRoom(request);
    obs.subscribe({
      next: () => {
        this.snackBar.open(`Room ${this.isEdit ? 'updated' : 'created'}!`, 'Close', { duration: 3000 });
        this.router.navigate(['/rooms']);
      },
      error: (err) => this.snackBar.open(err.error?.message || 'Failed', 'Close', { duration: 3000 })
    });
  }
}
