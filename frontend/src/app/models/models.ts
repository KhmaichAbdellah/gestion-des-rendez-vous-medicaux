// ========================================
// MODÈLES DE DONNÉES (Interfaces TypeScript)
// ========================================

export type StatutRdv = 'EN_ATTENTE' | 'CONFIRME' | 'ANNULE' | 'TERMINE' | 'REPORTE';
export type Sexe = 'MASCULIN' | 'FEMININ' | 'AUTRE';
export type TypeConsultation =
  | 'CONSULTATION_GENERALE'
  | 'SUIVI'
  | 'URGENCE'
  | 'TELECONSULTATION'
  | 'BILAN'
  | 'VACCINATION';

export interface Patient {
  id?: number;
  prenom: string;
  nom: string;
  email: string;
  telephone?: string;
  dateNaissance?: string;
  sexe?: Sexe;
  adresse?: string;
  numeroSecuriteSociale?: string;
  groupeSanguin?: string;
  allergies?: string;
  antecedentsMedicaux?: string;
  medecinTraitant?: string;
  actif?: boolean;
  dateCreation?: string;
  dateModification?: string;
  nomComplet?: string;
}

export interface RendezVous {
  id?: number;
  patientId: number;
  patientNom?: string;
  patientPrenom?: string;
  patientEmail?: string;
  patientTelephone?: string;
  dateHeureDebut: string;
  dateHeureFin: string;
  motif: string;
  statut?: StatutRdv;
  statutCouleur?: string;
  typeConsultation?: TypeConsultation;
  notesMedecin?: string;
  ordonnance?: string;
  diagnostic?: string;
  rappelEnvoye?: boolean;
  motifAnnulation?: string;
  dateCreation?: string;
  dateModification?: string;
}

export interface AuthUser {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  specialite?: string;
  roles: string[];
  token: string;
  type: string;
}

export interface LoginRequest {
  email: string;
  motDePasse: string;
}

export interface RegisterRequest {
  prenom: string;
  nom: string;
  email: string;
  motDePasse: string;
  specialite?: string;
  numeroRpps?: string;
  telephone?: string;
}

export interface Statistiques {
  totalPatients: number;
  totalRendezVous: number;
  rdvAujourdhui: number;
  rdvCetteSemaine: number;
  rdvConfirmes: number;
  rdvEnAttente: number;
  rdvAnnules: number;
  rdvTermines: number;
  prochains7Jours: number;
}

export interface FiltreRendezVous {
  statut?: StatutRdv;
  debut?: string;
  fin?: string;
  patientId?: number;
}

export interface CalendrierEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  color: string;
  textColor: string;
  extendedProps: {
    rdv: RendezVous;
    statut: StatutRdv;
  };
}

/** Mapping statut → couleurs */
export const STATUT_CONFIG: Record<StatutRdv, { couleur: string; label: string; badge: string }> = {
  CONFIRME:   { couleur: '#4CAF50', label: 'Confirmé',   badge: 'badge-confirme'   },
  EN_ATTENTE: { couleur: '#FFC107', label: 'En attente', badge: 'badge-en_attente' },
  ANNULE:     { couleur: '#F44336', label: 'Annulé',     badge: 'badge-annule'     },
  TERMINE:    { couleur: '#9E9E9E', label: 'Terminé',    badge: 'badge-termine'    },
  REPORTE:    { couleur: '#FF9800', label: 'Reporté',    badge: 'badge-reporte'    },
};

/** Libellés des types de consultation */
export const TYPE_CONSULTATION_LABELS: Record<TypeConsultation, string> = {
  CONSULTATION_GENERALE: 'Consultation générale',
  SUIVI:                 'Suivi',
  URGENCE:               'Urgence',
  TELECONSULTATION:      'Téléconsultation',
  BILAN:                 'Bilan',
  VACCINATION:           'Vaccination',
};

