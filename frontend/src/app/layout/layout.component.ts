import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { AuthUser } from '../models/models';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <div class="app-layout">
      <!-- Sidebar -->
      <aside class="sidebar" [class.collapsed]="sidebarCollapsed">
        <!-- Logo -->
        <div class="sidebar-header">
          <div class="logo">
            <span class="material-icons logo-icon">local_hospital</span>
            <span class="logo-text" *ngIf="!sidebarCollapsed">MédiRDV</span>
          </div>
          <button class="btn-icon sidebar-toggle" (click)="toggleSidebar()">
            <span class="material-icons">{{ sidebarCollapsed ? 'menu' : 'menu_open' }}</span>
          </button>
        </div>

        <!-- Navigation -->
        <nav class="sidebar-nav">
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
            <span class="material-icons">dashboard</span>
            <span class="nav-label" *ngIf="!sidebarCollapsed">Tableau de bord</span>
          </a>
          <a routerLink="/calendrier" routerLinkActive="active" class="nav-item">
            <span class="material-icons">calendar_today</span>
            <span class="nav-label" *ngIf="!sidebarCollapsed">Calendrier</span>
          </a>
          <a routerLink="/rendez-vous" routerLinkActive="active" class="nav-item">
            <span class="material-icons">event</span>
            <span class="nav-label" *ngIf="!sidebarCollapsed">Rendez-vous</span>
          </a>
          <a routerLink="/patients" routerLinkActive="active" class="nav-item">
            <span class="material-icons">people</span>
            <span class="nav-label" *ngIf="!sidebarCollapsed">Patients</span>
          </a>
        </nav>

        <!-- Statut des couleurs -->
        <div class="sidebar-legend" *ngIf="!sidebarCollapsed">
          <p class="legend-title">Codes couleurs</p>
          <div class="legend-item">
            <span class="legend-dot" style="background:#4CAF50"></span>
            <span>Confirmé</span>
          </div>
          <div class="legend-item">
            <span class="legend-dot" style="background:#FFC107"></span>
            <span>En attente</span>
          </div>
          <div class="legend-item">
            <span class="legend-dot" style="background:#F44336"></span>
            <span>Annulé</span>
          </div>
          <div class="legend-item">
            <span class="legend-dot" style="background:#9E9E9E"></span>
            <span>Terminé</span>
          </div>
        </div>

        <!-- Profil utilisateur -->
        <div class="sidebar-footer">
          <div class="user-info" *ngIf="!sidebarCollapsed">
            <div class="user-avatar">{{ getUserInitials() }}</div>
            <div class="user-details">
              <p class="user-name">Dr. {{ currentUser?.nom }}</p>
              <p class="user-specialite">{{ currentUser?.specialite || 'Médecin' }}</p>
            </div>
          </div>
          <button class="btn-icon logout-btn" (click)="logout()" title="Déconnexion">
            <span class="material-icons">logout</span>
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="main-content">
        <!-- Top bar -->
        <header class="topbar">
          <div class="topbar-left">
            <h2 class="page-title">{{ getPageTitle() }}</h2>
          </div>
          <div class="topbar-right">
            <span class="date-display">{{ today | date:'EEEE d MMMM yyyy':'':'fr' }}</span>
            <div class="user-badge">
              <span class="material-icons">account_circle</span>
              <span>Dr. {{ currentUser?.prenom }} {{ currentUser?.nom }}</span>
            </div>
          </div>
        </header>

        <!-- Page content -->
        <div class="content-area">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .app-layout {
      display: flex;
      height: 100vh;
      overflow: hidden;
    }

    /* ---- Sidebar ---- */
    .sidebar {
      width: 260px;
      background: #1E293B;
      color: white;
      display: flex;
      flex-direction: column;
      transition: width 0.3s ease;
      flex-shrink: 0;

      &.collapsed { width: 72px; }
    }

    .sidebar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 16px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 18px;
      font-weight: 700;
      color: #60A5FA;
    }

    .logo-icon { font-size: 28px; color: #60A5FA; }

    .sidebar-toggle {
      color: rgba(255,255,255,0.6);
      background: none;
      border: none;
      cursor: pointer;
      padding: 6px;
      border-radius: 6px;
      &:hover { background: rgba(255,255,255,0.1); color: white; }
    }

    /* ---- Navigation ---- */
    .sidebar-nav {
      flex: 1;
      padding: 16px 8px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      border-radius: 8px;
      color: rgba(255,255,255,0.7);
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s;

      .material-icons { font-size: 20px; flex-shrink: 0; }

      &:hover {
        background: rgba(255,255,255,0.1);
        color: white;
      }

      &.active {
        background: #2563EB;
        color: white;
      }
    }

    .nav-label { white-space: nowrap; overflow: hidden; }

    /* ---- Legend ---- */
    .sidebar-legend {
      padding: 16px;
      border-top: 1px solid rgba(255,255,255,0.1);
      border-bottom: 1px solid rgba(255,255,255,0.1);

      .legend-title {
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 1px;
        color: rgba(255,255,255,0.4);
        margin-bottom: 10px;
      }

      .legend-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 12px;
        color: rgba(255,255,255,0.7);
        margin-bottom: 6px;
      }

      .legend-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        flex-shrink: 0;
      }
    }

    /* ---- Footer ---- */
    .sidebar-footer {
      padding: 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid rgba(255,255,255,0.1);
    }

    .user-info { display: flex; align-items: center; gap: 10px; }

    .user-avatar {
      width: 36px;
      height: 36px;
      background: #2563EB;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: 700;
      flex-shrink: 0;
    }

    .user-name { font-size: 13px; font-weight: 600; color: white; }
    .user-specialite { font-size: 11px; color: rgba(255,255,255,0.5); }

    .logout-btn {
      color: rgba(255,255,255,0.5);
      background: none;
      border: none;
      cursor: pointer;
      padding: 6px;
      border-radius: 6px;
      &:hover { color: #EF4444; background: rgba(239,68,68,0.1); }
    }

    /* ---- Main Content ---- */
    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .topbar {
      height: 64px;
      background: white;
      border-bottom: 1px solid #E2E8F0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      flex-shrink: 0;
    }

    .page-title {
      font-size: 18px;
      font-weight: 600;
      color: #1E293B;
    }

    .topbar-right {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .date-display {
      font-size: 13px;
      color: #64748B;
      text-transform: capitalize;
    }

    .user-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
      color: #374151;

      .material-icons { color: #2563EB; font-size: 22px; }
    }

    .content-area {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
      background: #F8FAFC;
    }

    @media (max-width: 768px) {
      .sidebar { width: 72px; }
      .logo-text, .nav-label, .sidebar-legend, .user-details { display: none; }
    }
  `]
})
export class LayoutComponent implements OnInit {
  currentUser: AuthUser | null = null;
  sidebarCollapsed = false;
  today = new Date();

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getUserInitials(): string {
    if (!this.currentUser) return 'Dr';
    return `${this.currentUser.prenom?.charAt(0) || ''}${this.currentUser.nom?.charAt(0) || ''}`.toUpperCase();
  }

  getPageTitle(): string {
    const path = this.router.url;
    if (path.includes('dashboard')) return 'Tableau de bord';
    if (path.includes('calendrier')) return 'Calendrier';
    if (path.includes('rendez-vous')) return 'Gestion des rendez-vous';
    if (path.includes('patients')) return 'Gestion des patients';
    return 'MédiRDV';
  }
}

