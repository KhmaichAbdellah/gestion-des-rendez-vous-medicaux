import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PatientService } from './patient.service';
import { Patient } from '../models/models';
import { environment } from '../../environments/environment';

describe('PatientService', () => {
  let service: PatientService;
  let httpMock: HttpTestingController;

  const mockPatients: Patient[] = [
    { id: 1, prenom: 'Jean', nom: 'Dupont', email: 'jean.dupont@email.fr', actif: true },
    { id: 2, prenom: 'Marie', nom: 'Dubois', email: 'marie.dubois@email.fr', actif: true }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PatientService]
    });
    service = TestBed.inject(PatientService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('devrait être initialisé', () => {
    assertThatServiceIsDefined(service);
  });

  it('devrait récupérer tous les patients via GET /api/patients', () => {
    service.getTousLesPatients().subscribe(patients => {
      expect(patients.length).toBe(2);
      expect(patients[0].nom).toBe('Dupont');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/patients`);
    expect(req.request.method).toBe('GET');
    req.flush(mockPatients);
  });

  it('devrait créer un patient via POST /api/patients', () => {
    const nouveauPatient: Patient = {
      prenom: 'Pierre',
      nom: 'Bernard',
      email: 'pierre.bernard@email.fr'
    };

    service.creerPatient(nouveauPatient).subscribe(p => {
      expect(p.id).toBe(3);
      expect(p.nom).toBe('Bernard');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/patients`);
    expect(req.request.method).toBe('POST');
    req.flush({ ...nouveauPatient, id: 3 });
  });

  function assertThatServiceIsDefined(s: PatientService) {
    expect(s).toBeTruthy();
  }
});
