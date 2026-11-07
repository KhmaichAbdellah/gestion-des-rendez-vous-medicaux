import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RendezVousService } from '../../services/rendez-vous.service';
import { PatientService } from '../../services/patient.service';
import { RendezVous, Patient, STATUT_CONFIG, CalendrierEvent } from '../../models/models';

/**
 * Vue calendrier avec suivi visuel par code couleur.
 * - Vert  : Confirmé
 * - Jaune : En attente
 * - Rouge : Annulé
 * - Gris  : Terminé
 *
 * Implémenté avec une grille calendrier native Angular
 * (compatible sans FullCalendar pour éviter la dépendance npm).
 */
@Component({
  selector: 'app-calendrier',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="calendrier-page">

      <!-- En-tête calendrier -->
      <div class="cal-header">
        <div class="cal-nav">
          <button class="btn btn-secondary btn-sm" (click)="moisPrecedent()">
            <span class="material-icons">chevron_left</span>
          </button>
          <h2 class="cal-title">{{ getCurrentMonthLabel() }}</h2>
          <button class="btn btn-secondary btn-sm" (click)="moisSuivant()">
            <span class="material-icons">chevron_right</span>
          </button>
          <button class="btn btn-secondary btn-sm" (click)="allerAujourdhui()">
            Aujourd'hui
          </button>
        </div>
        <div class="cal-actions">
          <!-- Légende couleurs -->
          <div class="cal-legend">
            <span class="legend-chip" style="background:#DCFCE7; color:#166534">
              <span class="dot" style="background:#4CAF50"></span> Confirmé
            </span>
            <span class="legend-chip" style="background:#FEF9C3; color:#854D0E">
              <span class="dot" style="background:#FFC107"></span> En attente
            </span>
            <span class="legend-chip" style="background:#FEE2E2; color:#991B1B">
              <span class="dot" style="background:#F44336"></span> Annulé
            </span>
            <span class="legend-chip" style="background:#F1F5F9; color:#475569">
              <span class="dot" style="background:#9E9E9E"></span> Terminé
            </span>
          </div>
          <button class="btn btn-primary" (click)="ouvrirModalCreation()">
            <span class="material-icons">add</span>
            Nouveau RDV
          </button>
        </div>
      </div>

      <!-- Chargement -->
      <div *ngIf="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Chargement du calendrier...</p>
      </div>

      <!-- Calendrier -->
      <div class="calendar-wrap card" *ngIf="!loading" style="padding: 0">

        <!-- Jours de la semaine -->
        <div class="cal-week-headers">
          <div *ngFor="let jour of joursHeader" class="cal-week-day">{{ jour }}</div>
        </div>

        <!-- Grille des jours -->
        <div class="cal-grid">
          <div
            *ngFor="let cell of calendarCells"
            class="cal-cell"
            [class.other-month]="!cell.currentMonth"
            [class.today]="cell.isToday"
            [class.has-rdv]="cell.rdvs.length > 0"
            (click)="onCellClick(cell)"
          >
            <div class="cal-day-number">{{ cell.day }}</div>
            <div class="cal-events">
              <div
                *ngFor="let rdv of cell.rdvs.slice(0, 3)"
                class="cal-event"
                [style.background]="rdv.statutCouleur"
                [style.color]="getTextColor(rdv.statutCouleur)"
                (click)="onRdvClick(rdv, $event)"
                [title]="rdv.patientPrenom + ' ' + rdv.patientNom + ' - ' + rdv.motif"
              >
                <span class="event-time">{{ rdv.dateHeureDebut | date:'HH:mm' }}</span>
                <span class="event-name">{{ rdv.patientPrenom }} {{ rdv.patientNom }}</span>
              </div>
              <div *ngIf="cell.rdvs.length > 3" class="cal-event-more">
                +{{ cell.rdvs.length - 3 }} autres
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Panel détail RDV -->
      <div class="rdv-detail-panel" *ngIf="rdvSelectionne">
        <div class="panel-header">
          <h3>Détail du rendez-vous</h3>
          <button class="btn-icon" (click)="rdvSelectionne = null">
            <span class="material-icons">close</span>
          </button>
        </div>
        <div class="panel-body">
          <div class="detail-row">
            <span class="material-icons">person</span>
            <strong>{{ rdvSelectionne.patientPrenom }} {{ rdvSelectionne.patientNom }}</strong>
          </div>
          <div class="detail-row">
            <span class="material-icons">access_time</span>
            <span>{{ rdvSelectionne.dateHeureDebut | date:'dd/MM/yyyy HH:mm' }} → {{ rdvSelectionne.dateHeureFin | date:'HH:mm' }}</span>
          </div>
          <div class="detail-row">
            <span class="material-icons">medical_services</span>
            <span>{{ rdvSelectionne.motif }}</span>
          </div>
          <div class="detail-row">
            <span class="material-icons">flag</span>
            <span class="badge" [class]="getStatutBadge(rdvSelectionne.statut!)">
              {{ getStatutLabel(rdvSelectionne.statut!) }}
            </span>
          </div>
          <div class="detail-row" *ngIf="rdvSelectionne.notesMedecin">
            <span class="material-icons">notes</span>
            <span>{{ rdvSelectionne.notesMedecin }}</span>
          </div>
          <div class="panel-actions">
            <button
              *ngIf="rdvSelectionne.statut === 'EN_ATTENTE'"
              class="btn btn-success btn-sm"
              (click)="confirmerRdv(rdvSelectionne)"
            >
              <span class="material-icons">check</span> Confirmer
            </button>
            <button
              class="btn btn-secondary btn-sm"
              (click)="ouvrirModalEdition(rdvSelectionne)"
            >
              <span class="material-icons">edit</span> Modifier
            </button>
            <button
              *ngIf="rdvSelectionne.statut === 'EN_ATTENTE' || rdvSelectionne.statut === 'CONFIRME'"
              class="btn btn-danger btn-sm"
              (click)="annulerRdv(rdvSelectionne)"
            >
              <span class="material-icons">cancel</span> Annuler
            </button>
          </div>
        </div>
      </div>

      <!-- Modal RDV -->
      <div class="modal-overlay" *ngIf="showModal" (click)="fermerModal($event)">
        <div class="modal">
          <div class="modal-header">
            <h3>{{ rdvEnEdition?.id ? 'Modifier' : 'Nouveau rendez-vous' }}</h3>
            <button class="btn-icon" (click)="showModal = false">
              <span class="material-icons">close</span>
            </button>
          </div>
          <div class="modal-body">
            <form [formGroup]="rdvForm">
              <div class="form-group">
                <label class="form-label">Patient *</label>
                <select class="form-control" formControlName="patientId">
                  <option value="">Sélectionner un patient</option>
                  <option *ngFor="let p of patients" [value]="p.id">{{ p.prenom }} {{ p.nom }}</option>
                </select>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Début *</label>
                  <input type="datetime-local" class="form-control" formControlName="dateHeureDebut">
                </div>
                <div class="form-group">
                  <label class="form-label">Fin *</label>
                  <input type="datetime-local" class="form-control" formControlName="dateHeureFin">
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Motif *</label>
                <input type="text" class="form-control" formControlName="motif" placeholder="Motif de consultation">
              </div>
              <div class="form-group">
                <label class="form-label">Type de consultation</label>
                <select class="form-control" formControlName="typeConsultation">
                  <option value="CONSULTATION_GENERALE">Consultation générale</option>
                  <option value="SUIVI">Suivi</option>
                  <option value="URGENCE">Urgence</option>
                  <option value="BILAN">Bilan</option>
                  <option value="VACCINATION">Vaccination</option>
                </select>
              </div>
              <div class="alert alert-error" *ngIf="modalError">{{ modalError }}</div>
            </form>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="showModal = false">Annuler</button>
            <button class="btn btn-primary" (click)="sauvegarderRdv()" [disabled]="savingRdv">
              {{ savingRdv ? 'Enregistrement...' : 'Enregistrer' }}
            </button>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .calendrier-page { max-width: 1200px; }

    /* Header */
    .cal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
      flex-wrap: wrap;
      gap: 12px;
    }

    .cal-nav {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .cal-title {
      font-size: 20px;
      font-weight: 700;
      color: #1E293B;
      min-width: 200px;
      text-align: center;
      text-transform: capitalize;
    }

    .cal-actions {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    /* Légende */
    .cal-legend {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .legend-chip {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;

      .dot {
        width: 8px; height: 8px;
        border-radius: 50%;
        display: inline-block;
      }
    }

    .loading-state { text-align: center; padding: 60px; color: #64748B; }

    /* Calendrier */
    .calendar-wrap { overflow: hidden; }

    .cal-week-headers {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      background: #F8FAFC;
      border-bottom: 1px solid #E2E8F0;
    }

    .cal-week-day {
      padding: 10px;
      text-align: center;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748B;
    }

    .cal-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
    }

    .cal-cell {
      min-height: 120px;
      border-right: 1px solid #E2E8F0;
      border-bottom: 1px solid #E2E8F0;
      padding: 6px;
      cursor: pointer;
      transition: background 0.15s;

      &:nth-child(7n) { border-right: none; }
      &:hover { background: #F8FAFC; }

      &.other-month {
        background: #FAFAFA;
        .cal-day-number { color: #CBD5E1; }
      }

      &.today {
        .cal-day-number {
          background: #2563EB;
          color: white;
          border-radius: 50%;
          width: 26px; height: 26px;
          display: flex; align-items: center; justify-content: center;
        }
      }
    }

    .cal-day-number {
      font-size: 13px;
      font-weight: 600;
      color: #374151;
      margin-bottom: 4px;
      width: 26px; height: 26px;
      display: flex; align-items: center; justify-content: center;
    }

    .cal-events { display: flex; flex-direction: column; gap: 2px; }

    .cal-event {
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 4px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      transition: opacity 0.15s;
      &:hover { opacity: 0.85; }
    }

    .event-time { font-weight: 700; flex-shrink: 0; }
    .event-name { overflow: hidden; text-overflow: ellipsis; }

    .cal-event-more {
      font-size: 11px;
      color: #2563EB;
      font-weight: 600;
      padding: 2px 4px;
      cursor: pointer;
    }

    /* Detail Panel */
    .rdv-detail-panel {
      margin-top: 20px;
      background: white;
      border-radius: 12px;
      border: 1px solid #E2E8F0;
      box-shadow: 0 4px 16px rgba(0,0,0,0.08);
    }

    .panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      border-bottom: 1px solid #E2E8F0;
      h3 { font-size: 16px; font-weight: 600; }
    }

    .panel-body { padding: 20px; }

    .detail-row {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 12px;
      font-size: 14px;
      color: #374151;

      .material-icons { color: #94A3B8; font-size: 18px; }
    }

    .panel-actions {
      display: flex;
      gap: 8px;
      margin-top: 20px;
      padding-top: 16px;
      border-top: 1px solid #F1F5F9;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    @media (max-width: 768px) {
      .cal-cell { min-height: 60px; }
      .event-name { display: none; }
      .cal-legend { display: none; }
    }
  `]
})
export class CalendrierComponent implements OnInit {
  today = new Date();
  currentYear = this.today.getFullYear();
  currentMonth = this.today.getMonth();

  calendarCells: CalendarCell[] = [];
  rdvs: RendezVous[] = [];
  patients: Patient[] = [];
  loading = false;
  showModal = false;
  savingRdv = false;
  modalError = '';
  rdvEnEdition: RendezVous | null = null;
  rdvSelectionne: RendezVous | null = null;
  rdvForm!: FormGroup;

  joursHeader = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  constructor(
    private rdvService: RendezVousService,
    private patientService: PatientService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.patientService.getTousLesPatients().subscribe(p => this.patients = p);
    this.chargerRdvDuMois();
  }

  chargerRdvDuMois(): void {
    this.loading = true;
    const debut = new Date(this.currentYear, this.currentMonth, 1);
    const fin = new Date(this.currentYear, this.currentMonth + 1, 0, 23, 59, 59);

    this.rdvService.getRendezVousCalendrier(debut.toISOString(), fin.toISOString()).subscribe({
      next: rdvs => {
        this.rdvs = rdvs;
        this.genererCalendrier();
        this.loading = false;
      },
      error: () => {
        this.genererCalendrier();
        this.loading = false;
      }
    });
  }

  genererCalendrier(): void {
    const cells: CalendarCell[] = [];
    const premierJour = new Date(this.currentYear, this.currentMonth, 1);
    const dernierJour = new Date(this.currentYear, this.currentMonth + 1, 0);

    // Jour de la semaine du 1er (0=dim, correction pour commencer lun)
    let startDow = premierJour.getDay();
    startDow = startDow === 0 ? 6 : startDow - 1;

    // Jours du mois précédent
    for (let i = startDow - 1; i >= 0; i--) {
      const d = new Date(this.currentYear, this.currentMonth, -i);
      cells.push(this.createCell(d, false));
    }

    // Jours du mois courant
    for (let d = 1; d <= dernierJour.getDate(); d++) {
      const date = new Date(this.currentYear, this.currentMonth, d);
      cells.push(this.createCell(date, true));
    }

    // Jours du mois suivant
    const remaining = 42 - cells.length;
    for (let d = 1; d <= remaining; d++) {
      const date = new Date(this.currentYear, this.currentMonth + 1, d);
      cells.push(this.createCell(date, false));
    }

    this.calendarCells = cells;
  }

  private createCell(date: Date, currentMonth: boolean): CalendarCell {
    const isToday = this.sameDay(date, this.today);
    const dateStr = date.toISOString().split('T')[0];

    const rdvsOfDay = this.rdvs.filter(rdv => {
      const rdvDate = new Date(rdv.dateHeureDebut).toISOString().split('T')[0];
      return rdvDate === dateStr;
    }).sort((a, b) => a.dateHeureDebut.localeCompare(b.dateHeureDebut));

    return { date, day: date.getDate(), currentMonth, isToday, rdvs: rdvsOfDay };
  }

  private sameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() &&
           a.getMonth() === b.getMonth() &&
           a.getDate() === b.getDate();
  }

  moisPrecedent(): void {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.chargerRdvDuMois();
  }

  moisSuivant(): void {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.chargerRdvDuMois();
  }

  allerAujourdhui(): void {
    this.currentYear = this.today.getFullYear();
    this.currentMonth = this.today.getMonth();
    this.chargerRdvDuMois();
  }

  getCurrentMonthLabel(): string {
    const date = new Date(this.currentYear, this.currentMonth, 1);
    return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  }

  onCellClick(cell: CalendarCell): void {
    if (cell.rdvs.length === 0) {
      this.ouvrirModalCreationPourDate(cell.date);
    }
    this.rdvSelectionne = null;
  }

  onRdvClick(rdv: RendezVous, event: Event): void {
    event.stopPropagation();
    this.rdvSelectionne = rdv;
  }

  ouvrirModalCreation(): void {
    this.ouvrirModalCreationPourDate(new Date());
  }

  ouvrirModalCreationPourDate(date: Date): void {
    this.rdvEnEdition = null;
    this.modalError = '';
    const heure = new Date(date);
    heure.setHours(9, 0, 0, 0);
    const fin = new Date(heure.getTime() + 30 * 60000);
    this.rdvForm = this.fb.group({
      patientId: ['', Validators.required],
      typeConsultation: ['CONSULTATION_GENERALE'],
      dateHeureDebut: [this.formatDateTimeLocal(heure), Validators.required],
      dateHeureFin: [this.formatDateTimeLocal(fin), Validators.required],
      motif: ['', Validators.required]
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
      motif: [rdv.motif, Validators.required]
    });
    this.showModal = true;
  }

  fermerModal(event: Event): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) this.showModal = false;
  }

  sauvegarderRdv(): void {
    if (this.rdvForm.invalid) { this.rdvForm.markAllAsTouched(); return; }
    this.savingRdv = true;

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
      next: () => { this.showModal = false; this.savingRdv = false; this.chargerRdvDuMois(); },
      error: (err) => { this.savingRdv = false; this.modalError = err.error?.message || 'Erreur'; }
    });
  }

  confirmerRdv(rdv: RendezVous): void {
    this.rdvService.confirmerRendezVous(rdv.id!).subscribe(() => {
      this.rdvSelectionne = null;
      this.chargerRdvDuMois();
    });
  }

  annulerRdv(rdv: RendezVous): void {
    const motif = prompt('Motif d\'annulation :');
    if (motif !== null) {
      this.rdvService.annulerRendezVous(rdv.id!, motif).subscribe(() => {
        this.rdvSelectionne = null;
        this.chargerRdvDuMois();
      });
    }
  }

  getStatutBadge(statut: string): string {
    return STATUT_CONFIG[statut as keyof typeof STATUT_CONFIG]?.badge || '';
  }

  getStatutLabel(statut: string): string {
    return STATUT_CONFIG[statut as keyof typeof STATUT_CONFIG]?.label || statut;
  }

  getTextColor(bgColor?: string): string {
    if (!bgColor) return '#000';
    // Couleurs sombres → texte blanc
    const darkColors = ['#2196F3', '#1565C0', '#1A237E'];
    return '#000000'; // Toutes les couleurs de statut ont bon contraste sur fond coloré clair
  }

  private formatDateTimeLocal(date: Date): string {
    return date.toISOString().slice(0, 16);
  }
}

interface CalendarCell {
  date: Date;
  day: number;
  currentMonth: boolean;
  isToday: boolean;
  rdvs: RendezVous[];
}

