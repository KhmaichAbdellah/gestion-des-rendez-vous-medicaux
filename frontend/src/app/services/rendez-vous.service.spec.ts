import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RendezVousService } from './rendez-vous.service';
import { RendezVous } from '../models/models';
import { environment } from '../../environments/environment';

describe('RendezVousService', () => {
  let service: RendezVousService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [RendezVousService]
    });
    service = TestBed.inject(RendezVousService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('devrait être instancié avec succès', () => {
    expect(service).toBeTruthy();
  });

  it('devrait confirmer un rendez-vous (PATCH /api/rendez-vous/:id/confirmer)', () => {
    const mockRdv: RendezVous = {
      id: 5,
      patientId: 1,
      dateHeureDebut: '2026-11-08T09:00:00',
      dateHeureFin: '2026-11-08T09:30:00',
      motif: 'Contrôle',
      statut: 'CONFIRME',
      statutCouleur: '#4CAF50'
    };

    service.confirmerRendezVous(5).subscribe(res => {
      expect(res.statut).toBe('CONFIRME');
      expect(res.statutCouleur).toBe('#4CAF50');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/rendez-vous/5/confirmer`);
    expect(req.request.method).toBe('PATCH');
    req.flush(mockRdv);
  });

  it('devrait annuler un rendez-vous (PATCH /api/rendez-vous/:id/annuler)', () => {
    const mockRdv: RendezVous = {
      id: 5,
      patientId: 1,
      dateHeureDebut: '2026-11-08T09:00:00',
      dateHeureFin: '2026-11-08T09:30:00',
      motif: 'Contrôle',
      statut: 'ANNULE',
      statutCouleur: '#F44336',
      motifAnnulation: 'Patient malade'
    };

    service.annulerRendezVous(5, 'Patient malade').subscribe(res => {
      expect(res.statut).toBe('ANNULE');
      expect(res.motifAnnulation).toBe('Patient malade');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/rendez-vous/5/annuler`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ motif: 'Patient malade' });
    req.flush(mockRdv);
  });
});

