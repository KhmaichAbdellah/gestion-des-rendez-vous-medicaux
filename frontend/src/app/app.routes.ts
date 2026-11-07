import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: '',
    loadComponent: () => import('./layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
        title: 'Tableau de bord'
      },
      {
        path: 'calendrier',
        loadComponent: () => import('./pages/calendrier/calendrier.component').then(m => m.CalendrierComponent),
        title: 'Calendrier'
      },
      {
        path: 'rendez-vous',
        loadComponent: () => import('./pages/rendez-vous/rendez-vous-liste.component').then(m => m.RendezVousListeComponent),
        title: 'Rendez-vous'
      },
      {
        path: 'patients',
        loadComponent: () => import('./pages/patients/patients-liste.component').then(m => m.PatientsListeComponent),
        title: 'Patients'
      },
      {
        path: 'patients/:id',
        loadComponent: () => import('./pages/patients/patient-detail.component').then(m => m.PatientDetailComponent),
        title: 'Fiche Patient'
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];

