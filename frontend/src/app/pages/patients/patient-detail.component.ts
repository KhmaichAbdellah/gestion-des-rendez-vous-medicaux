import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PatientService } from '../../services/patient.service';
import { RendezVousService } from '../../services/rendez-vous.service';
import { Patient, RendezVous, STATUT_CONFIG } from '../../models/models';

@Component({
  selector: 'app-patient-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="patient">
      <div class="card">
        <h2>{{ patient.prenom }} {{ patient.nom }}</h2>
        <p>{{ patient.email }}</p>
        <p *ngIf="patient.telephone">{{ patient.telephone }}</p>
        <p *ngIf="patient.groupeSanguin">Groupe: {{ patient.groupeSanguin }}</p>
        <p *ngIf="patient.allergies">Allergies: {{ patient.allergies }}</p>
        <p *ngIf="patient.antecedentsMedicaux">Antécédents: {{ patient.antecedentsMedicaux }}</p>
      </div>
      <div class="card mt-4">
        <h3>Historique des rendez-vous</h3>
        <div *ngFor="let rdv of rdvs" class="rdv-row">
          <span>{{ rdv.dateHeureDebut | date:'dd/MM/yyyy HH:mm' }}</span>
          <span>{{ rdv.motif }}</span>
          <span class="badge" [class]="getStatutBadge(rdv.statut!)">{{ getStatutLabel(rdv.statut!) }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`.rdv-row { display: flex; gap: 16px; padding: 10px 0; border-bottom: 1px solid #E2E8F0; }`]
})
export class PatientDetailComponent implements OnInit {
  patient: Patient | null = null;
  rdvs: RendezVous[] = [];

  constructor(
    private route: ActivatedRoute,
    private patientService: PatientService,
    private rdvService: RendezVousService
  ) {}

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.patientService.getPatientParId(id).subscribe(p => {
      this.patient = p;
      this.rdvService.getRendezVousParPatient(id).subscribe(rdvs => this.rdvs = rdvs);
    });
  }

  getStatutBadge(statut: string): string {
    return STATUT_CONFIG[statut as keyof typeof STATUT_CONFIG]?.badge || '';
  }

  getStatutLabel(statut: string): string {
    return STATUT_CONFIG[statut as keyof typeof STATUT_CONFIG]?.label || statut;
  }
}

