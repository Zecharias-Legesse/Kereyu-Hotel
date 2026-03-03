import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { PaymentService } from '../../services/payment.service';
import { PaymentResponse, PaymentMethod } from '../../models/payment.model';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatTableModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatSnackBarModule, MatDividerModule],
  template: `
    <div style="padding:24px;max-width:800px;margin:0 auto">
      <h2>Payments for Reservation #{{ reservationId }}</h2>

      <mat-card style="margin-bottom:24px;padding:24px">
        <mat-card-header>
          <mat-card-title>Make a Payment</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="makePayment()" style="display:flex;gap:16px;align-items:center;flex-wrap:wrap;margin-top:16px">
            <mat-form-field appearance="outline" style="flex:1;min-width:150px">
              <mat-label>Amount</mat-label>
              <input matInput type="number" formControlName="amount">
            </mat-form-field>
            <mat-form-field appearance="outline" style="flex:1;min-width:150px">
              <mat-label>Payment Method</mat-label>
              <mat-select formControlName="paymentMethod">
                @for (method of paymentMethods; track method) {
                  <mat-option [value]="method">{{ method.replace('_', ' ') }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
            <button mat-raised-button color="primary" type="submit">Pay</button>
          </form>
        </mat-card-content>
      </mat-card>

      <mat-card style="padding:24px">
        <mat-card-header>
          <mat-card-title>Payment History</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <table mat-table [dataSource]="payments" style="width:100%;margin-top:16px">
            <ng-container matColumnDef="transactionId">
              <th mat-header-cell *matHeaderCellDef>Transaction ID</th>
              <td mat-cell *matCellDef="let p">{{ p.transactionId }}</td>
            </ng-container>
            <ng-container matColumnDef="amount">
              <th mat-header-cell *matHeaderCellDef>Amount</th>
              <td mat-cell *matCellDef="let p">\${{ p.amount }}</td>
            </ng-container>
            <ng-container matColumnDef="method">
              <th mat-header-cell *matHeaderCellDef>Method</th>
              <td mat-cell *matCellDef="let p">{{ p.paymentMethod }}</td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let p">
                <span [style.color]="p.status === 'COMPLETED' ? '#4caf50' : p.status === 'REFUNDED' ? '#f44336' : '#ff9800'" style="font-weight:500">
                  {{ p.status }}
                </span>
              </td>
            </ng-container>
            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef>Date</th>
              <td mat-cell *matCellDef="let p">{{ p.createdAt | date:'short' }}</td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let p">
                @if (p.status === 'COMPLETED') {
                  <button mat-button color="warn" (click)="refund(p.id)">Refund</button>
                }
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
          </table>

          @if (payments.length === 0) {
            <p style="text-align:center;padding:24px;color:#666">No payments yet.</p>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class PaymentsComponent implements OnInit {
  reservationId!: number;
  payments: PaymentResponse[] = [];
  form: FormGroup;
  paymentMethods: PaymentMethod[] = ['CREDIT_CARD', 'DEBIT_CARD', 'CASH', 'BANK_TRANSFER', 'MOBILE_PAYMENT'];
  displayedColumns = ['transactionId', 'amount', 'method', 'status', 'date', 'actions'];

  constructor(
    private route: ActivatedRoute,
    private paymentService: PaymentService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      amount: [0, [Validators.required, Validators.min(1)]],
      paymentMethod: ['CREDIT_CARD', Validators.required]
    });
  }

  ngOnInit() {
    this.reservationId = +this.route.snapshot.paramMap.get('reservationId')!;
    this.loadPayments();
  }

  loadPayments() {
    this.paymentService.getPaymentsByReservation(this.reservationId).subscribe({
      next: (payments) => this.payments = payments,
      error: () => this.snackBar.open('Failed to load payments', 'Close', { duration: 3000 })
    });
  }

  makePayment() {
    if (this.form.invalid) return;
    const request = {
      reservationId: this.reservationId,
      amount: this.form.value.amount,
      paymentMethod: this.form.value.paymentMethod
    };
    this.paymentService.createPayment(request).subscribe({
      next: () => {
        this.snackBar.open('Payment successful!', 'Close', { duration: 3000 });
        this.loadPayments();
        this.form.patchValue({ amount: 0 });
      },
      error: (err) => this.snackBar.open(err.error?.message || 'Payment failed', 'Close', { duration: 3000 })
    });
  }

  refund(paymentId: number) {
    this.paymentService.refundPayment(paymentId).subscribe({
      next: () => {
        this.snackBar.open('Refund processed!', 'Close', { duration: 3000 });
        this.loadPayments();
      },
      error: (err) => this.snackBar.open(err.error?.message || 'Refund failed', 'Close', { duration: 3000 })
    });
  }
}
