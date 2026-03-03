import { Routes } from '@angular/router';
import { authGuard, staffGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./components/register/register.component').then(m => m.RegisterComponent) },
  { path: 'dashboard', loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent), canActivate: [authGuard] },
  { path: 'rooms', loadComponent: () => import('./components/rooms/rooms.component').then(m => m.RoomsComponent), canActivate: [authGuard] },
  { path: 'rooms/new', loadComponent: () => import('./components/room-form/room-form.component').then(m => m.RoomFormComponent), canActivate: [staffGuard] },
  { path: 'rooms/edit/:id', loadComponent: () => import('./components/room-form/room-form.component').then(m => m.RoomFormComponent), canActivate: [staffGuard] },
  { path: 'reservations', loadComponent: () => import('./components/reservations/reservations.component').then(m => m.ReservationsComponent), canActivate: [authGuard] },
  { path: 'reservations/new', loadComponent: () => import('./components/reservation-form/reservation-form.component').then(m => m.ReservationFormComponent), canActivate: [authGuard] },
  { path: 'payments/:reservationId', loadComponent: () => import('./components/payments/payments.component').then(m => m.PaymentsComponent), canActivate: [authGuard] },
  { path: 'admin', loadComponent: () => import('./components/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent), canActivate: [staffGuard] },
  { path: '**', redirectTo: '/dashboard' }
];
