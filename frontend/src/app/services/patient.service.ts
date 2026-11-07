import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Patient } from '../models/models';
import { environment } from '../../environments/environment';

/**
 * Service de gestion des patients.
 * Communication avec l'API REST Spring Boot.
 */
@Injectable({ providedIn: 'root' })
export class PatientService {
  private readonly API_URL = `${environment.apiUrl}/patients`;

  constructor(private http: HttpClient) {}

  /** Retourne tous les patients actifs */
  getTousLesPatients(): Observable<Patient[]> {
    return this.http.get<Patient[]>(this.API_URL);
  }

  /** Retourne un patient par son ID */
  getPatientParId(id: number): Observable<Patient> {
    return this.http.get<Patient>(`${this.API_URL}/${id}`);
  }

  /** Crée un nouveau patient */
  creerPatient(patient: Patient): Observable<Patient> {
    return this.http.post<Patient>(this.API_URL, patient);
  }

  /** Met à jour un patient */
  mettreAJourPatient(id: number, patient: Patient): Observable<Patient> {
    return this.http.put<Patient>(`${this.API_URL}/${id}`, patient);
  }

  /** Supprime (désactive) un patient */
  supprimerPatient(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  /** Recherche des patients par nom/prénom/email */
  rechercherPatients(terme: string): Observable<Patient[]> {
    const params = new HttpParams().set('terme', terme);
    return this.http.get<Patient[]>(`${this.API_URL}/recherche`, { params });
  }

  /** Retourne le nombre de patients actifs */
  getNombrePatients(): Observable<number> {
    return this.http.get<number>(`${this.API_URL}/count`);
  }
}

