import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RendezVousService } from '../../services/rendez-vous.service';
import { PatientService } from '../../services/patient.service';
import { AuthService } from '../../services/auth.service';
import { RendezVous, Statistiques, STATUT_CONFIG } from '../../models/models';

/**
 * Tableau de bord principal du médecin.
 * Affiche les statistiques, les RDV du jour et les prochains RDV.
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard">

      <!-- En-tête de bienvenue -->
      <div class="welcome-banner">
        <div>
          <h1>Bonjour, Dr. {{ currentUser?.nom }} 👋</h1>
          <p>{{ today | date:"EEEE d MMMM yyyy":"":"fr" | titlecase }}</p>
        </div>
        <a routerLink="/calendrier" class="btn btn-primary">
          <span class="material-icons">calendar_today</span>
          Voir le calendrier
        </a>
      </div>

      <!-- Chargement -->
      <div *ngIf="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Chargement des données...</p>
      </div>

      <!-- Contenu -->
      <ng-container *ngIf="!loading">

        <!-- Cartes de statistiques -->
        <div class="stats-grid">
          <div class="stat-card stat-patients">
            <div class="stat-header">
              <div class="stat-icon-wrap" style="background:#EFF6FF">
                <span class="material-icons" style="color:#2563EB">people</span>
              </div>
              <span class="stat-trend">Total</span>
            </div>
            <div class="stat-value">{{ stats?.totalPatients || 0 }}</div>
            <div class="stat-label">Patients actifs</div>
          </div>

          <div class="stat-card stat-today">
            <div class="stat-header">
              <div class="stat-icon-wrap" style="background:#F0FDF4">
                <span class="material-icons" style="color:#22C55E">today</span>
              </div>
              <span class="stat-trend">Aujourd'hui</span>
            </div>
            <div class="stat-value">{{ stats?.rdvAujourdhui || 0 }}</div>
            <div class="stat-label">Rendez-vous du jour</div>
          </div>

          <div class="stat-card stat-week">
            <div class="stat-header">
              <div class="stat-icon-wrap" style="background:#FFF7ED">
                <span class="material-icons" style="color:#F59E0B">date_range</span>
              </div>
              <span class="stat-trend">Cette semaine</span>
            </div>
            <div class="stat-value">{{ stats?.rdvCetteSemaine || 0 }}</div>
            <div class="stat-label">Rendez-vous prévus</div>
          </div>

          <div class="stat-card stat-total">
            <div class="stat-header">
              <div class="stat-icon-wrap" style="background:#F5F3FF">
                <span class="material-icons" style="color:#8B5CF6">event_note</span>
              </div>
              <span class="stat-trend">Total</span>
            </div>
            <div class="stat-value">{{ stats?.totalRendezVous || 0 }}</div>
            <div class="stat-label">Rendez-vous au total</div>
          </div>
        </div>

        <!-- Répartition par statut -->
        <div class="status-overview">
          <div class="status-item" style="border-left: 4px solid #4CAF50">
            <span class="status-count" style="color:#4CAF50">{{ stats?.rdvConfirmes || 0 }}</span>
            <span class="status-name">Confirmés</span>
          </div>
          <div class="status-item" style="border-left: 4px solid #FFC107">
            <span class="status-count" style="color:#FFC107">{{ stats?.rdvEnAttente || 0 }}</span>
            <span class="status-name">En attente</span>
          </div>
          <div class="status-item" style="border-left: 4px solid #F44336">
            <span class="status-count" style="color:#F44336">{{ stats?.rdvAnnules || 0 }}</span>
            <span class="status-name">Annulés</span>
          </div>
          <div class="status-item" style="border-left: 4px solid #9E9E9E">
            <span class="status-count" style="color:#9E9E9E">{{ stats?.rdvTermines || 0 }}</span>
            <span class="status-name">Terminés</span>
          </div>
        </div>

        <!-- RDV du jour -->
        <div class="section">
          <div class="section-header">
            <h2 class="section-title">
              <span class="material-icons">schedule</span>
              Agenda du jour
            </h2>
            <a routerLink="/rendez-vous" class="btn btn-secondary btn-sm">Voir tout</a>
          </div>

          <div *ngIf="rdvDuJour.length === 0" class="empty-state">
            <span class="material-icons">event_available</span>
            <p>Aucun rendez-vous prévu aujourd'hui</p>
            <a routerLink="/rendez-vous" class="btn btn-primary btn-sm">Créer un rendez-vous</a>
          </div>

          <div class="rdv-list" *ngIf="rdvDuJour.length > 0">
            <div *ngFor="let rdv of rdvDuJour" class="rdv-card">
              <div class="rdv-time-bar" [style.background]="rdv.statutCouleur"></div>
              <div class="rdv-content">
                <div class="rdv-header">
                  <div class="rdv-patient">
                    <div class="patient-avatar">
                      {{ getInitials(rdv.patientPrenom, rdv.patientNom) }}
                    </div>
                    <div>
                      <p class="patient-name">{{ rdv.patientPrenom }} {{ rdv.patientNom }}</p>
                      <p class="rdv-motif">{{ rdv.motif }}</p>
                    </div>
                  </div>
                  <div class="rdv-meta">
                    <div class="rdv-time">
                      <span class="material-icons">access_time</span>
                      {{ rdv.dateHeureDebut | date:'HH:mm' }} - {{ rdv.dateHeureFin | date:'HH:mm' }}
                    </div>
                    <span class="badge" [class]="getStatutBadge(rdv.statut!)">
                      {{ getStatutLabel(rdv.statut!) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </ng-container>
    </div>
  `,
  styles: [`
    .dashboard { max-width: 1200px; }

    .welcome-banner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 28px;

      h1 { font-size: 22px; font-weight: 700; color: #1E293B; }
      p { color: #64748B; margin-top: 2px; font-size: 14px; }
    }

    .loading-state {
      text-align: center;
      padding: 60px;
      color: #64748B;
    }

    /* Stats grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 20px;
    }

    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      border: 1px solid #E2E8F0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }

    .stat-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }

    .stat-icon-wrap {
      padding: 10px;
      border-radius: 10px;
      .material-icons { font-size: 22px; }
    }

    .stat-trend {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #94A3B8;
    }

    .stat-value {
      font-size: 36px;
      font-weight: 800;
      color: #1E293B;
      line-height: 1;
      margin-bottom: 4px;
    }

    .stat-label {
      font-size: 13px;
      color: #64748B;
    }

    /* Status overview */
    .status-overview {
      display: flex;
      gap: 16px;
      margin-bottom: 28px;
    }

    .status-item {
      flex: 1;
      background: white;
      border-radius: 10px;
      padding: 16px 20px;
      border: 1px solid #E2E8F0;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .status-count { font-size: 24px; font-weight: 700; }
    .status-name { font-size: 13px; color: #64748B; }

    /* Section */
    .section {
      background: white;
      border-radius: 12px;
      border: 1px solid #E2E8F0;
      padding: 24px;
    }

    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 16px;
      font-weight: 600;
      color: #1E293B;

      .material-icons { color: #2563EB; }
    }

    /* RDV List */
    .rdv-list { display: flex; flex-direction: column; gap: 12px; }

    .rdv-card {
      display: flex;
      border: 1px solid #E2E8F0;
      border-radius: 10px;
      overflow: hidden;
      transition: box-shadow 0.2s;
      &:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
    }

    .rdv-time-bar { width: 4px; flex-shrink: 0; }

    .rdv-content { flex: 1; padding: 14px 16px; }

    .rdv-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .rdv-patient { display: flex; align-items: center; gap: 12px; }

    .patient-avatar {
      width: 40px;
      height: 40px;
      background: #EFF6FF;
      color: #2563EB;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: 700;
      flex-shrink: 0;
    }

    .patient-name { font-size: 14px; font-weight: 600; color: #1E293B; }
    .rdv-motif { font-size: 12px; color: #64748B; margin-top: 2px; }

    .rdv-meta { display: flex; align-items: center; gap: 12px; }

    .rdv-time {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 13px;
      color: #64748B;
      .material-icons { font-size: 16px; }
    }

    /* Empty state */
    .empty-state {
      text-align: center;
      padding: 48px;
      color: #94A3B8;

      .material-icons { font-size: 48px; display: block; margin-bottom: 12px; }
      p { margin-bottom: 16px; font-size: 15px; }
    }

    @media (max-width: 1024px) {
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
      .status-overview { flex-wrap: wrap; }
    }

    @media (max-width: 640px) {
      .stats-grid { grid-template-columns: 1fr; }
      .welcome-banner { flex-direction: column; align-items: flex-start; gap: 12px; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  stats: Statistiques | null = null;
  rdvDuJour: RendezVous[] = [];
  loading = true;
  today = new Date();
  currentUser = this.authService.getCurrentUser();

  constructor(
    private rdvService: RendezVousService,
    private patientService: PatientService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.chargerDonnees();
  }

  chargerDonnees(): void {
    this.loading = true;

    this.rdvService.getStatistiques().subscribe({
      next: (stats) => {
        this.stats = stats;
      },
      error: () => {}
    });

    this.patientService.getNombrePatients().subscribe({
      next: (count) => {
        if (this.stats) this.stats.totalPatients = count;
      }
    });

    this.rdvService.getRendezVousDuJour().subscribe({
      next: (rdvs) => {
        this.rdvDuJour = rdvs;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  getInitials(prenom?: string, nom?: string): string {
    return `${prenom?.charAt(0) || ''}${nom?.charAt(0) || ''}`.toUpperCase();
  }

  getStatutBadge(statut: string): string {
    return STATUT_CONFIG[statut as keyof typeof STATUT_CONFIG]?.badge || '';
  }

  getStatutLabel(statut: string): string {
    return STATUT_CONFIG[statut as keyof typeof STATUT_CONFIG]?.label || statut;
  }
}

