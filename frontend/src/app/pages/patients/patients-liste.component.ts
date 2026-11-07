import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PatientService } from '../../services/patient.service';
import { RendezVousService } from '../../services/rendez-vous.service';
import { Patient, RendezVous, STATUT_CONFIG } from '../../models/models';
import { RouterLink } from '@angular/router';

/**
 * Composant de liste des patients avec gestion des fiches.
 * Inclut recherche, CRUD et affichage de l'historique des RDV.
 */
@Component({
  selector: 'app-patients-liste',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="patients-page">

      <!-- En-tête -->
      <div class="page-header">
        <div>
          <h1>Patients</h1>
          <p>{{ patients.length }} patient(s) enregistré(s)</p>
        </div>
        <button class="btn btn-primary" (click)="ouvrirModalCreation()">
          <span class="material-icons">person_add</span>
          Nouveau patient
        </button>
      </div>

      <!-- Recherche -->
      <div class="search-bar card">
        <div class="search-input-wrap">
          <span class="material-icons search-icon">search</span>
          <input
            type="text"
            class="form-control search-input"
            [(ngModel)]="recherche"
            (input)="onRecherche()"
            placeholder="Rechercher par nom, prénom ou email..."
          >
          <button class="btn btn-secondary btn-sm" *ngIf="recherche" (click)="effacerRecherche()">
            <span class="material-icons">close</span>
          </button>
        </div>
      </div>

      <!-- Chargement -->
      <div *ngIf="loading" class="loading-state">
        <div class="spinner"></div>
      </div>

      <!-- Grille de patients -->
      <div class="patients-grid" *ngIf="!loading">
        <div class="patient-card" *ngFor="let patient of patients">
          <div class="patient-card-header">
            <div class="patient-big-avatar" [style.background]="getAvatarColor(patient)">
              {{ getInitials(patient.prenom, patient.nom) }}
            </div>
            <div class="patient-card-actions">
              <button class="btn btn-secondary btn-sm" (click)="ouvrirModalEdition(patient)">
                <span class="material-icons">edit</span>
              </button>
              <button class="btn btn-danger btn-sm" (click)="supprimerPatient(patient)">
                <span class="material-icons">delete</span>
              </button>
            </div>
          </div>

          <div class="patient-card-body">
            <h3 class="patient-full-name">{{ patient.prenom }} {{ patient.nom }}</h3>

            <div class="patient-info-row" *ngIf="patient.email">
              <span class="material-icons">email</span>
              <span>{{ patient.email }}</span>
            </div>
            <div class="patient-info-row" *ngIf="patient.telephone">
              <span class="material-icons">phone</span>
              <span>{{ patient.telephone }}</span>
            </div>
            <div class="patient-info-row" *ngIf="patient.dateNaissance">
              <span class="material-icons">cake</span>
              <span>{{ patient.dateNaissance | date:'dd/MM/yyyy' }}</span>
            </div>
            <div class="patient-info-row" *ngIf="patient.groupeSanguin">
              <span class="material-icons">bloodtype</span>
              <span>Groupe {{ patient.groupeSanguin }}</span>
            </div>
            <div class="patient-info-row" *ngIf="patient.allergies">
              <span class="material-icons">warning</span>
              <span class="text-warning">{{ patient.allergies }}</span>
            </div>
          </div>

          <div class="patient-card-footer">
            <button class="btn btn-secondary btn-sm w-full" (click)="voirHistorique(patient)">
              <span class="material-icons">history</span>
              Historique RDV
            </button>
          </div>
        </div>

        <!-- Carte vide -->
        <div class="empty-patients" *ngIf="patients.length === 0">
          <span class="material-icons">person_search</span>
          <p>Aucun patient trouvé</p>
          <button class="btn btn-primary btn-sm" (click)="ouvrirModalCreation()">
            Créer un patient
          </button>
        </div>
      </div>

      <!-- Modal Patient -->
      <div class="modal-overlay" *ngIf="showModal" (click)="fermerModal($event)">
        <div class="modal modal-lg">
          <div class="modal-header">
            <h3>{{ patientEnEdition?.id ? 'Modifier le patient' : 'Nouveau patient' }}</h3>
            <button class="btn-icon" (click)="showModal = false">
              <span class="material-icons">close</span>
            </button>
          </div>
          <div class="modal-body">
            <form [formGroup]="patientForm">
              <div class="form-section-title">Informations personnelles</div>
              <div class="form-row-3">
                <div class="form-group">
                  <label class="form-label">Prénom *</label>
                  <input type="text" class="form-control" formControlName="prenom" placeholder="Jean">
                  <div class="form-error" *ngIf="pf['prenom'].invalid && pf['prenom'].touched">Obligatoire</div>
                </div>
                <div class="form-group">
                  <label class="form-label">Nom *</label>
                  <input type="text" class="form-control" formControlName="nom" placeholder="Dupont">
                  <div class="form-error" *ngIf="pf['nom'].invalid && pf['nom'].touched">Obligatoire</div>
                </div>
                <div class="form-group">
                  <label class="form-label">Sexe</label>
                  <select class="form-control" formControlName="sexe">
                    <option value="">-</option>
                    <option value="MASCULIN">Masculin</option>
                    <option value="FEMININ">Féminin</option>
                    <option value="AUTRE">Autre</option>
                  </select>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Email *</label>
                  <input type="email" class="form-control" formControlName="email" placeholder="jean.dupont@email.fr">
                  <div class="form-error" *ngIf="pf['email'].invalid && pf['email'].touched">Email invalide</div>
                </div>
                <div class="form-group">
                  <label class="form-label">Téléphone</label>
                  <input type="tel" class="form-control" formControlName="telephone" placeholder="06 xx xx xx xx">
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Date de naissance</label>
                  <input type="date" class="form-control" formControlName="dateNaissance">
                </div>
                <div class="form-group">
                  <label class="form-label">Groupe sanguin</label>
                  <select class="form-control" formControlName="groupeSanguin">
                    <option value="">-</option>
                    <option *ngFor="let g of groupesSanguins" [value]="g">{{ g }}</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Adresse</label>
                <input type="text" class="form-control" formControlName="adresse" placeholder="12 rue de la Paix, 75001 Paris">
              </div>

              <div class="form-section-title">Informations médicales</div>

              <div class="form-group">
                <label class="form-label">Allergies</label>
                <input type="text" class="form-control" formControlName="allergies" placeholder="Pénicilline, arachides...">
              </div>

              <div class="form-group">
                <label class="form-label">Antécédents médicaux</label>
                <textarea class="form-control" formControlName="antecedentsMedicaux" rows="3"
                  placeholder="Hypertension, diabète..."></textarea>
              </div>

              <div class="alert alert-error" *ngIf="modalError">{{ modalError }}</div>
            </form>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="showModal = false">Annuler</button>
            <button class="btn btn-primary" (click)="sauvegarderPatient()" [disabled]="savingPatient">
              <span class="material-icons">save</span>
              {{ savingPatient ? 'Enregistrement...' : 'Enregistrer' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Modal Historique RDV -->
      <div class="modal-overlay" *ngIf="showHistoriqueModal" (click)="fermerModalHistorique($event)">
        <div class="modal">
          <div class="modal-header">
            <h3>Historique - {{ patientHistorique?.prenom }} {{ patientHistorique?.nom }}</h3>
            <button class="btn-icon" (click)="showHistoriqueModal = false">
              <span class="material-icons">close</span>
            </button>
          </div>
          <div class="modal-body">
            <div *ngIf="historiqueRdv.length === 0" class="text-center text-muted" style="padding: 32px">
              <span class="material-icons" style="font-size:40px; display:block; margin-bottom:8px">event_busy</span>
              Aucun rendez-vous pour ce patient
            </div>
            <div class="historique-list">
              <div *ngFor="let rdv of historiqueRdv" class="historique-item">
                <div class="historique-status" [style.background]="rdv.statutCouleur"></div>
                <div class="historique-content">
                  <div class="historique-date">{{ rdv.dateHeureDebut | date:'dd/MM/yyyy HH:mm' }}</div>
                  <div class="historique-motif">{{ rdv.motif }}</div>
                  <span class="badge" [class]="getStatutBadge(rdv.statut!)">{{ getStatutLabel(rdv.statut!) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .patients-page { max-width: 1200px; }

    .search-bar { margin-bottom: 20px; padding: 16px; }

    .search-input-wrap {
      position: relative;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .search-icon {
      position: absolute;
      left: 12px;
      color: #94A3B8;
      font-size: 20px;
    }

    .search-input { padding-left: 40px; }

    .loading-state { text-align: center; padding: 60px; }

    /* Patients Grid */
    .patients-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
    }

    .patient-card {
      background: white;
      border-radius: 12px;
      border: 1px solid #E2E8F0;
      overflow: hidden;
      transition: box-shadow 0.2s;
      &:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
    }

    .patient-card-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      padding: 20px 20px 0;
    }

    .patient-big-avatar {
      width: 56px; height: 56px;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 20px; font-weight: 700; color: white;
    }

    .patient-card-actions { display: flex; gap: 6px; }

    .patient-card-body { padding: 12px 20px 16px; }

    .patient-full-name {
      font-size: 16px;
      font-weight: 700;
      color: #1E293B;
      margin-bottom: 10px;
    }

    .patient-info-row {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: #64748B;
      margin-bottom: 4px;

      .material-icons { font-size: 16px; color: #94A3B8; }
    }

    .text-warning { color: #D97706 !important; }

    .patient-card-footer { padding: 12px 20px; border-top: 1px solid #F1F5F9; }

    .empty-patients {
      grid-column: 1/-1;
      text-align: center;
      padding: 80px;
      color: #94A3B8;

      .material-icons { font-size: 56px; display: block; margin-bottom: 12px; }
      p { margin-bottom: 16px; font-size: 16px; }
    }

    /* Modal lg */
    .modal-lg { max-width: 700px; }

    .form-section-title {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #94A3B8;
      margin: 20px 0 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid #F1F5F9;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .form-row-3 {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 16px;
    }

    /* Historique */
    .historique-list { display: flex; flex-direction: column; gap: 10px; }

    .historique-item {
      display: flex;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      overflow: hidden;
    }

    .historique-status { width: 4px; }

    .historique-content { padding: 12px; flex: 1; }

    .historique-date { font-size: 12px; color: #64748B; margin-bottom: 2px; }
    .historique-motif { font-size: 14px; font-weight: 500; color: #1E293B; margin-bottom: 6px; }

    @media (max-width: 640px) {
      .form-row, .form-row-3 { grid-template-columns: 1fr; }
    }
  `]
})
export class PatientsListeComponent implements OnInit {
  patients: Patient[] = [];
  loading = false;
  recherche = '';
  showModal = false;
  showHistoriqueModal = false;
  savingPatient = false;
  modalError = '';
  patientEnEdition: Patient | null = null;
  patientHistorique: Patient | null = null;
  historiqueRdv: RendezVous[] = [];
  patientForm!: FormGroup;

  groupesSanguins = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  avatarColors = ['#2563EB', '#7C3AED', '#059669', '#D97706', '#DC2626', '#0891B2', '#BE185D'];

  constructor(
    private patientService: PatientService,
    private rdvService: RendezVousService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void { this.chargerPatients(); }

  chargerPatients(): void {
    this.loading = true;
    this.patientService.getTousLesPatients().subscribe({
      next: p => { this.patients = p; this.loading = false; },
      error: () => this.loading = false
    });
  }

  onRecherche(): void {
    if (this.recherche.length >= 2) {
      this.patientService.rechercherPatients(this.recherche).subscribe(p => this.patients = p);
    } else if (this.recherche.length === 0) {
      this.chargerPatients();
    }
  }

  effacerRecherche(): void {
    this.recherche = '';
    this.chargerPatients();
  }

  ouvrirModalCreation(): void {
    this.patientEnEdition = null;
    this.modalError = '';
    this.patientForm = this.fb.group({
      prenom: ['', Validators.required],
      nom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telephone: [''],
      dateNaissance: [''],
      sexe: [''],
      adresse: [''],
      groupeSanguin: [''],
      allergies: [''],
      antecedentsMedicaux: [''],
    });
    this.showModal = true;
  }

  ouvrirModalEdition(patient: Patient): void {
    this.patientEnEdition = patient;
    this.modalError = '';
    this.patientForm = this.fb.group({
      prenom: [patient.prenom, Validators.required],
      nom: [patient.nom, Validators.required],
      email: [patient.email, [Validators.required, Validators.email]],
      telephone: [patient.telephone || ''],
      dateNaissance: [patient.dateNaissance || ''],
      sexe: [patient.sexe || ''],
      adresse: [patient.adresse || ''],
      groupeSanguin: [patient.groupeSanguin || ''],
      allergies: [patient.allergies || ''],
      antecedentsMedicaux: [patient.antecedentsMedicaux || ''],
    });
    this.showModal = true;
  }

  fermerModal(event: Event): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) this.showModal = false;
  }

  fermerModalHistorique(event: Event): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) this.showHistoriqueModal = false;
  }

  get pf() { return this.patientForm.controls; }

  sauvegarderPatient(): void {
    if (this.patientForm.invalid) { this.patientForm.markAllAsTouched(); return; }
    this.savingPatient = true;
    this.modalError = '';

    const data: Patient = { ...this.patientForm.value, actif: true };

    const obs = this.patientEnEdition?.id
      ? this.patientService.mettreAJourPatient(this.patientEnEdition.id, data)
      : this.patientService.creerPatient(data);

    obs.subscribe({
      next: () => { this.showModal = false; this.savingPatient = false; this.chargerPatients(); },
      error: (err) => { this.savingPatient = false; this.modalError = err.error?.message || 'Erreur'; }
    });
  }

  supprimerPatient(patient: Patient): void {
    if (confirm(`Supprimer le patient ${patient.prenom} ${patient.nom} ?`)) {
      this.patientService.supprimerPatient(patient.id!).subscribe(() => this.chargerPatients());
    }
  }

  voirHistorique(patient: Patient): void {
    this.patientHistorique = patient;
    this.rdvService.getRendezVousParPatient(patient.id!).subscribe(rdvs => {
      this.historiqueRdv = rdvs;
      this.showHistoriqueModal = true;
    });
  }

  getInitials(prenom?: string, nom?: string): string {
    return `${prenom?.charAt(0) || ''}${nom?.charAt(0) || ''}`.toUpperCase();
  }

  getAvatarColor(patient: Patient): string {
    const idx = (patient.id || 0) % this.avatarColors.length;
    return this.avatarColors[idx];
  }

  getStatutBadge(statut: string): string {
    return STATUT_CONFIG[statut as keyof typeof STATUT_CONFIG]?.badge || '';
  }

  getStatutLabel(statut: string): string {
    return STATUT_CONFIG[statut as keyof typeof STATUT_CONFIG]?.label || statut;
  }
}

