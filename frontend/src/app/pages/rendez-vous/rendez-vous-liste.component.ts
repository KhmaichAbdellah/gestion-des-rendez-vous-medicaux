import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RendezVousService } from '../../services/rendez-vous.service';
import { PatientService } from '../../services/patient.service';
import { RendezVous, Patient, StatutRdv, TypeConsultation, STATUT_CONFIG, TYPE_CONSULTATION_LABELS } from '../../models/models';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

/**
 * Composant de liste et gestion des rendez-vous.
 * Inclut filtrage par statut/date/patient, création et actions CRUD.
 */
@Component({
  selector: 'app-rendez-vous-liste',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="rdv-page">

      <!-- En-tête -->
      <div class="page-header">
        <div>
          <h1>Rendez-vous</h1>
          <p>{{ rendezVous.length }} rendez-vous trouvés</p>
        </div>
        <button class="btn btn-primary" (click)="ouvrirModalCreation()">
          <span class="material-icons">add</span>
          Nouveau rendez-vous
        </button>
      </div>

      <!-- Filtres -->
      <div class="filters card">
        <div class="filters-row">
          <div class="filter-group">
            <label>Statut</label>
            <select class="form-control" [(ngModel)]="filtreStatut" (change)="appliquerFiltres()">
              <option value="">Tous les statuts</option>
              <option value="EN_ATTENTE">En attente</option>
              <option value="CONFIRME">Confirmé</option>
              <option value="ANNULE">Annulé</option>
              <option value="TERMINE">Terminé</option>
            </select>
          </div>
          <div class="filter-group">
            <label>Patient</label>
            <select class="form-control" [(ngModel)]="filtrePatientId" (change)="appliquerFiltres()">
              <option value="">Tous les patients</option>
              <option *ngFor="let p of patients" [value]="p.id">{{ p.prenom }} {{ p.nom }}</option>
            </select>
          </div>
          <div class="filter-group">
            <label>Date de début</label>
            <input type="date" class="form-control" [(ngModel)]="filtreDebut" (change)="appliquerFiltres()">
          </div>
          <div class="filter-group">
            <label>Date de fin</label>
            <input type="date" class="form-control" [(ngModel)]="filtreFin" (change)="appliquerFiltres()">
          </div>
          <button class="btn btn-secondary" (click)="reinitialiserFiltres()">
            <span class="material-icons">refresh</span>
            Réinitialiser
          </button>
        </div>
      </div>

      <!-- Tableau des rendez-vous -->
      <div class="card" style="padding: 0">
        <div *ngIf="loading" class="loading-state">
          <div class="spinner"></div>
        </div>

        <div class="table-container" *ngIf="!loading">
          <table>
            <thead>
              <tr>
                <th>Date & Heure</th>
                <th>Patient</th>
                <th>Motif</th>
                <th>Type</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let rdv of rendezVous">
                <td>
                  <div class="date-cell">
                    <span class="date-primary">{{ rdv.dateHeureDebut | date:'dd/MM/yyyy' }}</span>
                    <span class="date-time">
                      {{ rdv.dateHeureDebut | date:'HH:mm' }} - {{ rdv.dateHeureFin | date:'HH:mm' }}
                    </span>
                  </div>
                </td>
                <td>
                  <div class="patient-cell">
                    <div class="patient-avatar-sm">{{ getInitials(rdv.patientPrenom, rdv.patientNom) }}</div>
                    <div>
                      <p class="patient-name-sm">{{ rdv.patientPrenom }} {{ rdv.patientNom }}</p>
                      <p class="patient-email-sm">{{ rdv.patientEmail }}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="motif-text">{{ rdv.motif }}</span>
                </td>
                <td>
                  <span class="type-badge">{{ getTypeLabel(rdv.typeConsultation) }}</span>
                </td>
                <td>
                  <span class="badge" [class]="getStatutBadge(rdv.statut!)">
                    <span class="status-dot" [style.background]="rdv.statutCouleur"></span>
                    {{ getStatutLabel(rdv.statut!) }}
                  </span>
                </td>
                <td>
                  <div class="actions">
                    <button
                      *ngIf="rdv.statut === 'EN_ATTENTE'"
                      class="btn btn-sm btn-success"
                      (click)="confirmerRdv(rdv)"
                      title="Confirmer"
                    >
                      <span class="material-icons">check</span>
                    </button>
                    <button
                      class="btn btn-sm btn-secondary"
                      (click)="ouvrirModalEdition(rdv)"
                      title="Modifier"
                    >
                      <span class="material-icons">edit</span>
                    </button>
                    <button
                      *ngIf="rdv.statut === 'EN_ATTENTE' || rdv.statut === 'CONFIRME'"
                      class="btn btn-sm btn-danger"
                      (click)="annulerRdv(rdv)"
                      title="Annuler"
                    >
                      <span class="material-icons">cancel</span>
                    </button>
                    <button
                      class="btn btn-sm btn-secondary"
                      (click)="supprimerRdv(rdv)"
                      title="Supprimer"
                    >
                      <span class="material-icons">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="rendezVous.length === 0">
                <td colspan="6" class="text-center empty-row">
                  <span class="material-icons">event_busy</span>
                  <p>Aucun rendez-vous trouvé</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Modal Création/Édition -->
      <div class="modal-overlay" *ngIf="showModal" (click)="fermerModal($event)">
        <div class="modal">
          <div class="modal-header">
            <h3>{{ rdvEnEdition?.id ? 'Modifier le rendez-vous' : 'Nouveau rendez-vous' }}</h3>
            <button class="btn-icon" (click)="showModal = false">
              <span class="material-icons">close</span>
            </button>
          </div>
          <div class="modal-body">
            <form [formGroup]="rdvForm" *ngIf="rdvForm">

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Patient *</label>
                  <select class="form-control" formControlName="patientId">
                    <option value="">Sélectionner un patient</option>
                    <option *ngFor="let p of patients" [value]="p.id">{{ p.prenom }} {{ p.nom }}</option>
                  </select>
                  <div class="form-error" *ngIf="rf['patientId'].invalid && rf['patientId'].touched">
                    Patient obligatoire
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label">Type de consultation</label>
                  <select class="form-control" formControlName="typeConsultation">
                    <option value="CONSULTATION_GENERALE">Consultation générale</option>
                    <option value="SUIVI">Suivi</option>
                    <option value="URGENCE">Urgence</option>
                    <option value="TELECONSULTATION">Téléconsultation</option>
                    <option value="BILAN">Bilan</option>
                    <option value="VACCINATION">Vaccination</option>
                  </select>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Début *</label>
                  <input type="datetime-local" class="form-control" formControlName="dateHeureDebut">
                  <div class="form-error" *ngIf="rf['dateHeureDebut'].invalid && rf['dateHeureDebut'].touched">
                    Date de début obligatoire
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label">Fin *</label>
                  <input type="datetime-local" class="form-control" formControlName="dateHeureFin">
                  <div class="form-error" *ngIf="rf['dateHeureFin'].invalid && rf['dateHeureFin'].touched">
                    Date de fin obligatoire
                  </div>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Motif de consultation *</label>
                <input type="text" class="form-control" formControlName="motif" placeholder="Ex: Consultation de routine">
                <div class="form-error" *ngIf="rf['motif'].invalid && rf['motif'].touched">
                  Motif obligatoire
                </div>
              </div>

              <div class="form-group" *ngIf="rdvEnEdition?.id">
                <label class="form-label">Statut</label>
                <select class="form-control" formControlName="statut">
                  <option value="EN_ATTENTE">En attente</option>
                  <option value="CONFIRME">Confirmé</option>
                  <option value="ANNULE">Annulé</option>
                  <option value="TERMINE">Terminé</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Notes médicales</label>
                <textarea class="form-control" formControlName="notesMedecin" rows="3"
                  placeholder="Notes, observations..."></textarea>
              </div>

              <!-- Alerte erreur -->
              <div class="alert alert-error" *ngIf="modalError">{{ modalError }}</div>
            </form>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="showModal = false">Annuler</button>
            <button class="btn btn-primary" (click)="sauvegarderRdv()" [disabled]="savingRdv">
              <span class="material-icons">save</span>
              {{ savingRdv ? 'Enregistrement...' : 'Enregistrer' }}
            </button>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .rdv-page { max-width: 1200px; }

    .filters { margin-bottom: 20px; }

    .filters-row {
      display: flex;
      align-items: flex-end;
      gap: 12px;
      flex-wrap: wrap;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 1;
      min-width: 150px;

      label { font-size: 12px; font-weight: 500; color: #64748B; }
    }

    .date-cell {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .date-primary { font-weight: 600; font-size: 13px; }
    .date-time { font-size: 12px; color: #64748B; }

    .patient-cell { display: flex; align-items: center; gap: 10px; }

    .patient-avatar-sm {
      width: 32px; height: 32px;
      background: #EFF6FF; color: #2563EB;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 12px; font-weight: 700;
      flex-shrink: 0;
    }

    .patient-name-sm { font-size: 13px; font-weight: 600; }
    .patient-email-sm { font-size: 11px; color: #94A3B8; }

    .motif-text {
      font-size: 13px;
      max-width: 200px;
      display: block;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .type-badge {
      font-size: 11px;
      background: #F1F5F9;
      color: #475569;
      padding: 3px 8px;
      border-radius: 4px;
    }

    .status-dot {
      width: 7px; height: 7px;
      border-radius: 50%;
      display: inline-block;
    }

    .actions {
      display: flex;
      gap: 6px;
      align-items: center;
    }

    .empty-row {
      padding: 48px !important;
      .material-icons { font-size: 40px; color: #CBD5E1; display: block; margin-bottom: 8px; }
      p { color: #94A3B8; }
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .loading-state {
      display: flex;
      justify-content: center;
      padding: 48px;
    }
  `]
})
export class RendezVousListeComponent implements OnInit {
  rendezVous: RendezVous[] = [];
  patients: Patient[] = [];
  loading = false;
  showModal = false;
  savingRdv = false;
  modalError = '';
  rdvEnEdition: RendezVous | null = null;
  rdvForm!: FormGroup;

  // Filtres
  filtreStatut = '';
  filtrePatientId = '';
  filtreDebut = '';
  filtreFin = '';

  constructor(
    private rdvService: RendezVousService,
    private patientService: PatientService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.chargerPatients();
    this.appliquerFiltres();
  }

  chargerPatients(): void {
    this.patientService.getTousLesPatients().subscribe(p => this.patients = p);
  }

  appliquerFiltres(): void {
    this.loading = true;
    const filtre: any = {};
    if (this.filtreStatut) filtre.statut = this.filtreStatut;
    if (this.filtrePatientId) filtre.patientId = +this.filtrePatientId;
    if (this.filtreDebut) filtre.debut = new Date(this.filtreDebut).toISOString();
    if (this.filtreFin) filtre.fin = new Date(this.filtreFin + 'T23:59:59').toISOString();

    this.rdvService.getRendezVous(filtre).subscribe({
      next: rdvs => { this.rendezVous = rdvs; this.loading = false; },
      error: () => this.loading = false
    });
  }

  reinitialiserFiltres(): void {
    this.filtreStatut = '';
    this.filtrePatientId = '';
    this.filtreDebut = '';
    this.filtreFin = '';
    this.appliquerFiltres();
  }

  ouvrirModalCreation(): void {
    this.rdvEnEdition = null;
    this.modalError = '';
    const maintenant = new Date();
    const dans30min = new Date(maintenant.getTime() + 30 * 60000);
    this.rdvForm = this.fb.group({
      patientId: ['', Validators.required],
      typeConsultation: ['CONSULTATION_GENERALE'],
      dateHeureDebut: [this.formatDateTimeLocal(maintenant), Validators.required],
      dateHeureFin: [this.formatDateTimeLocal(dans30min), Validators.required],
      motif: ['', Validators.required],
      notesMedecin: ['']
    });
    this.showModal = true;
  }

  ouvrirModalEdition(rdv: RendezVous): void {
    this.rdvEnEdition = rdv;
    this.modalError = '';
    this.rdvForm = this.fb.group({
      patientId: [rdv.patientId, Validators.required],
      typeConsultation: [rdv.typeConsultation || 'CONSULTATION_GENERALE'],
      dateHeureDebut: [this.formatDateTimeLocal(new Date(rdv.dateHeureDebut)), Validators.required],
      dateHeureFin: [this.formatDateTimeLocal(new Date(rdv.dateHeureFin)), Validators.required],
      motif: [rdv.motif, Validators.required],
      statut: [rdv.statut],
      notesMedecin: [rdv.notesMedecin || '']
    });
    this.showModal = true;
  }

  fermerModal(event: Event): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.showModal = false;
    }
  }

  get rf() { return this.rdvForm.controls; }

  sauvegarderRdv(): void {
    if (this.rdvForm.invalid) {
      this.rdvForm.markAllAsTouched();
      return;
    }

    this.savingRdv = true;
    this.modalError = '';

    const data: RendezVous = {
      ...this.rdvForm.value,
      patientId: +this.rdvForm.value.patientId,
      dateHeureDebut: new Date(this.rdvForm.value.dateHeureDebut).toISOString(),
      dateHeureFin: new Date(this.rdvForm.value.dateHeureFin).toISOString()
    };

    const obs = this.rdvEnEdition?.id
      ? this.rdvService.mettreAJourRendezVous(this.rdvEnEdition.id, data)
      : this.rdvService.creerRendezVous(data);

    obs.subscribe({
      next: () => {
        this.showModal = false;
        this.savingRdv = false;
        this.appliquerFiltres();
      },
      error: (err) => {
        this.savingRdv = false;
        this.modalError = err.error?.message || 'Une erreur est survenue';
      }
    });
  }

  confirmerRdv(rdv: RendezVous): void {
    if (confirm(`Confirmer le rendez-vous de ${rdv.patientPrenom} ${rdv.patientNom} ?`)) {
      this.rdvService.confirmerRendezVous(rdv.id!).subscribe(() => this.appliquerFiltres());
    }
  }

  annulerRdv(rdv: RendezVous): void {
    const motif = prompt('Motif d\'annulation (optionnel) :');
    if (motif !== null) {
      this.rdvService.annulerRendezVous(rdv.id!, motif).subscribe(() => this.appliquerFiltres());
    }
  }

  supprimerRdv(rdv: RendezVous): void {
    if (confirm('Supprimer définitivement ce rendez-vous ?')) {
      this.rdvService.supprimerRendezVous(rdv.id!).subscribe(() => this.appliquerFiltres());
    }
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

  getTypeLabel(type?: TypeConsultation): string {
    if (!type) return '';
    return TYPE_CONSULTATION_LABELS[type] || type;
  }

  private formatDateTimeLocal(date: Date): string {
    return date.toISOString().slice(0, 16);
  }
}

