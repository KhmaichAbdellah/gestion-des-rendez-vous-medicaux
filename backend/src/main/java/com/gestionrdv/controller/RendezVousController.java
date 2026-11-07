package com.gestionrdv.controller;

import com.gestionrdv.dto.RendezVousDTO;
import com.gestionrdv.dto.StatistiquesDTO;
import com.gestionrdv.model.RendezVous.StatutRendezVous;
import com.gestionrdv.service.RendezVousService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Contrôleur REST pour la gestion des rendez-vous médicaux.
 * Fournit tous les endpoints CRUD, filtrage, et actions de statut.
 * Base URL: /api/rendez-vous
 */
@RestController
@RequestMapping("/api/rendez-vous")
@RequiredArgsConstructor
@Slf4j
public class RendezVousController {

    private final RendezVousService rendezVousService;

    /**
     * GET /api/rendez-vous
     * Retourne tous les rendez-vous.
     * Supporte le filtrage par ?statut=&debut=&fin=&patientId=
     */
    @GetMapping
    public ResponseEntity<List<RendezVousDTO>> getRendezVous(
        @RequestParam(required = false) StatutRendezVous statut,
        @RequestParam(required = false)
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime debut,
        @RequestParam(required = false)
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fin,
        @RequestParam(required = false) Long patientId
    ) {
        if (statut != null || debut != null || fin != null || patientId != null) {
            return ResponseEntity.ok(rendezVousService.filtrerRendezVous(statut, debut, fin, patientId));
        }
        return ResponseEntity.ok(rendezVousService.getTousLesRendezVous());
    }

    /**
     * GET /api/rendez-vous/{id}
     * Retourne un rendez-vous par son ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<RendezVousDTO> getRendezVousParId(@PathVariable Long id) {
        return ResponseEntity.ok(rendezVousService.getRendezVousParId(id));
    }

    /**
     * POST /api/rendez-vous
     * Crée un nouveau rendez-vous.
     */
    @PostMapping
    public ResponseEntity<RendezVousDTO> creerRendezVous(@Valid @RequestBody RendezVousDTO dto) {
        log.info("Création d'un rendez-vous pour le patient ID: {}", dto.getPatientId());
        RendezVousDTO created = rendezVousService.creerRendezVous(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * PUT /api/rendez-vous/{id}
     * Met à jour un rendez-vous.
     */
    @PutMapping("/{id}")
    public ResponseEntity<RendezVousDTO> mettreAJourRendezVous(
        @PathVariable Long id,
        @Valid @RequestBody RendezVousDTO dto
    ) {
        return ResponseEntity.ok(rendezVousService.mettreAJourRendezVous(id, dto));
    }

    /**
     * DELETE /api/rendez-vous/{id}
     * Supprime définitivement un rendez-vous.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimerRendezVous(@PathVariable Long id) {
        rendezVousService.supprimerRendezVous(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * PATCH /api/rendez-vous/{id}/annuler
     * Annule un rendez-vous avec un motif.
     */
    @PatchMapping("/{id}/annuler")
    public ResponseEntity<RendezVousDTO> annulerRendezVous(
        @PathVariable Long id,
        @RequestBody(required = false) Map<String, String> body
    ) {
        String motif = body != null ? body.get("motif") : null;
        return ResponseEntity.ok(rendezVousService.annulerRendezVous(id, motif));
    }

    /**
     * PATCH /api/rendez-vous/{id}/confirmer
     * Confirme un rendez-vous (statut → CONFIRME, couleur → vert).
     */
    @PatchMapping("/{id}/confirmer")
    public ResponseEntity<RendezVousDTO> confirmerRendezVous(@PathVariable Long id) {
        return ResponseEntity.ok(rendezVousService.confirmerRendezVous(id));
    }

    /**
     * PATCH /api/rendez-vous/{id}/terminer
     * Clôture un rendez-vous avec notes médicales.
     */
    @PatchMapping("/{id}/terminer")
    public ResponseEntity<RendezVousDTO> terminerRendezVous(
        @PathVariable Long id,
        @RequestBody Map<String, String> body
    ) {
        return ResponseEntity.ok(rendezVousService.terminerRendezVous(
            id,
            body.get("notes"),
            body.get("diagnostic"),
            body.get("ordonnance")
        ));
    }

    /**
     * GET /api/rendez-vous/aujourd-hui
     * Retourne les rendez-vous du jour courant.
     */
    @GetMapping("/aujourd-hui")
    public ResponseEntity<List<RendezVousDTO>> getRendezVousDuJour() {
        return ResponseEntity.ok(rendezVousService.getRendezVousDuJour());
    }

    /**
     * GET /api/rendez-vous/patient/{patientId}
     * Retourne tous les rendez-vous d'un patient.
     */
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<RendezVousDTO>> getRendezVousParPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(rendezVousService.getRendezVousParPatient(patientId));
    }

    /**
     * GET /api/rendez-vous/calendrier?debut=&fin=
     * Retourne les RDV pour une vue calendrier (plage de dates).
     * Les données incluent les codes couleur selon le statut.
     */
    @GetMapping("/calendrier")
    public ResponseEntity<List<RendezVousDTO>> getRendezVousCalendrier(
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime debut,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fin
    ) {
        return ResponseEntity.ok(rendezVousService.getRendezVousCalendrier(debut, fin));
    }

    /**
     * GET /api/rendez-vous/statistiques
     * Retourne les statistiques pour le tableau de bord.
     */
    @GetMapping("/statistiques")
    public ResponseEntity<StatistiquesDTO> getStatistiques() {
        return ResponseEntity.ok(rendezVousService.getStatistiques());
    }
}

