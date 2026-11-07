package com.gestionrdv.controller;

import com.gestionrdv.dto.PatientDTO;
import com.gestionrdv.service.PatientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Contrôleur REST pour la gestion des patients.
 * Fournit les endpoints CRUD et de recherche.
 * Base URL: /api/patients
 */
@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
@Slf4j
public class PatientController {

    private final PatientService patientService;

    /**
     * GET /api/patients
     * Retourne tous les patients actifs.
     */
    @GetMapping
    public ResponseEntity<List<PatientDTO>> getTousLesPatients() {
        return ResponseEntity.ok(patientService.getTousLesPatients());
    }

    /**
     * GET /api/patients/{id}
     * Retourne un patient par son ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<PatientDTO> getPatientParId(@PathVariable Long id) {
        return ResponseEntity.ok(patientService.getPatientParId(id));
    }

    /**
     * POST /api/patients
     * Crée un nouveau patient.
     */
    @PostMapping
    public ResponseEntity<PatientDTO> creerPatient(@Valid @RequestBody PatientDTO patientDTO) {
        log.info("Création d'un nouveau patient");
        PatientDTO created = patientService.creerPatient(patientDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * PUT /api/patients/{id}
     * Met à jour les informations d'un patient.
     */
    @PutMapping("/{id}")
    public ResponseEntity<PatientDTO> mettreAJourPatient(
        @PathVariable Long id,
        @Valid @RequestBody PatientDTO patientDTO
    ) {
        return ResponseEntity.ok(patientService.mettreAJourPatient(id, patientDTO));
    }

    /**
     * DELETE /api/patients/{id}
     * Désactive un patient (soft delete).
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimerPatient(@PathVariable Long id) {
        patientService.supprimerPatient(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * GET /api/patients/recherche?terme=...
     * Recherche des patients par nom, prénom ou email.
     */
    @GetMapping("/recherche")
    public ResponseEntity<List<PatientDTO>> rechercherPatients(@RequestParam String terme) {
        return ResponseEntity.ok(patientService.rechercherPatients(terme));
    }

    /**
     * GET /api/patients/count
     * Retourne le nombre de patients actifs.
     */
    @GetMapping("/count")
    public ResponseEntity<Long> getNombrePatients() {
        return ResponseEntity.ok(patientService.getNombrePatientsActifs());
    }
}

