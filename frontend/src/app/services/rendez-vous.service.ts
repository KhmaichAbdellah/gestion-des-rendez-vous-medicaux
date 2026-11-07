import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FiltreRendezVous, RendezVous, Statistiques, StatutRdv } from '../models/models';
import { environment } from '../../environments/environment';

/**
 * Service de gestion des rendez-vous médicaux.
 * Communication avec l'API REST Spring Boot.
 */
@Injectable({ providedIn: 'root' })
export class RendezVousService {
  private readonly API_URL = `${environment.apiUrl}/rendez-vous`;

  constructor(private http: HttpClient) {}

  /** Retourne tous les rendez-vous (avec filtres optionnels) */
  getRendezVous(filtre?: FiltreRendezVous): Observable<RendezVous[]> {
    let params = new HttpParams();
    if (filtre?.statut) params = params.set('statut', filtre.statut);
    if (filtre?.debut) params = params.set('debut', filtre.debut);
    if (filtre?.fin) params = params.set('fin', filtre.fin);
    if (filtre?.patientId) params = params.set('patientId', filtre.patientId.toString());
    return this.http.get<RendezVous[]>(this.API_URL, { params });
  }

  /** Retourne un rendez-vous par son ID */
  getRendezVousParId(id: number): Observable<RendezVous> {
    return this.http.get<RendezVous>(`${this.API_URL}/${id}`);
  }

  /** Crée un nouveau rendez-vous */
  creerRendezVous(rdv: RendezVous): Observable<RendezVous> {
    return this.http.post<RendezVous>(this.API_URL, rdv);
  }

  /** Met à jour un rendez-vous */
  mettreAJourRendezVous(id: number, rdv: RendezVous): Observable<RendezVous> {
    return this.http.put<RendezVous>(`${this.API_URL}/${id}`, rdv);
  }

  /** Supprime un rendez-vous */
  supprimerRendezVous(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  /** Annule un rendez-vous avec un motif */
  annulerRendezVous(id: number, motif?: string): Observable<RendezVous> {
    return this.http.patch<RendezVous>(`${this.API_URL}/${id}/annuler`, { motif });
  }

  /** Confirme un rendez-vous (vert) */
  confirmerRendezVous(id: number): Observable<RendezVous> {
    return this.http.patch<RendezVous>(`${this.API_URL}/${id}/confirmer`, {});
  }

  /** Clôture un rendez-vous avec notes médicales */
  terminerRendezVous(id: number, notes?: string, diagnostic?: string, ordonnance?: string): Observable<RendezVous> {
    return this.http.patch<RendezVous>(`${this.API_URL}/${id}/terminer`, { notes, diagnostic, ordonnance });
  }

  /** Retourne les RDV du jour */
  getRendezVousDuJour(): Observable<RendezVous[]> {
    return this.http.get<RendezVous[]>(`${this.API_URL}/aujourd-hui`);
  }

  /** Retourne les RDV d'un patient */
  getRendezVousParPatient(patientId: number): Observable<RendezVous[]> {
    return this.http.get<RendezVous[]>(`${this.API_URL}/patient/${patientId}`);
  }

  /** Retourne les RDV pour le calendrier (plage de dates) */
  getRendezVousCalendrier(debut: string, fin: string): Observable<RendezVous[]> {
    const params = new HttpParams().set('debut', debut).set('fin', fin);
    return this.http.get<RendezVous[]>(`${this.API_URL}/calendrier`, { params });
  }

  /** Retourne les statistiques du tableau de bord */
  getStatistiques(): Observable<Statistiques> {
    return this.http.get<Statistiques>(`${this.API_URL}/statistiques`);
  }
}

