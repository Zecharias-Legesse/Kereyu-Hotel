import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSnackBarModule, MatDividerModule],
  template: `
    <div style="display:flex;justify-content:center;align-items:center;min-height:80vh">
      <mat-card style="width:400px;padding:24px">
        <mat-card-header>
          <mat-card-title>Login</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" style="width:100%;margin-top:16px">
              <mat-label>Username</mat-label>
              <input matInput formControlName="username">
            </mat-form-field>
            <mat-form-field appearance="outline" style="width:100%">
              <mat-label>Password</mat-label>
              <input matInput type="password" formControlName="password">
            </mat-form-field>
            <button mat-raised-button color="primary" type="submit" style="width:100%" [disabled]="loading">
              {{ loading ? 'Logging in...' : 'Login' }}
            </button>
          </form>
          <mat-divider style="margin:20px 0"></mat-divider>
          <button mat-stroked-button type="button" style="width:100%;height:40px" (click)="loginWithGoogle()" [disabled]="googleLoading">
            <span style="display:flex;align-items:center;justify-content:center;gap:8px">
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style="width:18px;height:18px">
              {{ googleLoading ? 'Signing in...' : 'Sign in with Google' }}
            </span>
          </button>
        </mat-card-content>
        <mat-card-actions align="end">
          <a mat-button routerLink="/register">Don't have an account? Register</a>
        </mat-card-actions>
      </mat-card>
    </div>
  `
})
export class LoginComponent {
  form: FormGroup;
  loading = false;
  googleLoading = false;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router, private snackBar: MatSnackBar) {
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.auth.login(this.form.value).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.loading = false;
        this.snackBar.open(err.error?.message || 'Login failed', 'Close', { duration: 3000 });
      }
    });
  }

  loginWithGoogle() {
    this.googleLoading = true;
    this.auth.loginWithGoogle().subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.googleLoading = false;
        this.snackBar.open(err.message || 'Google sign-in failed', 'Close', { duration: 3000 });
      }
    });
  }
}
