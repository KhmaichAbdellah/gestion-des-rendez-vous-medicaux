package com.gestionrdv.controller;

import com.gestionrdv.dto.PatientDTO;
import com.gestionrdv.dto.RendezVousDTO;
import com.gestionrdv.dto.StatistiquesDTO;
import com.gestionrdv.service.PatientService;
import com.gestionrdv.service.RendezVousService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * Contrôleur REST pour le tableau de bord du médecin.
 * Agrège les données pour la vue dashboard.
 */
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final PatientService patientService;
    private final RendezVousService rendezVousService;

    /**
     * GET /api/dashboard/statistiques
     * Retourne toutes les statistiques du tableau de bord.
     */
    @GetMapping("/statistiques")
    public ResponseEntity<StatistiquesDTO> getStatistiques() {
        StatistiquesDTO stats = rendezVousService.getStatistiques();
        stats.setTotalPatients(patientService.getNombrePatientsActifs());
        return ResponseEntity.ok(stats);
    }

    /**
     * GET /api/dashboard/aujourd-hui
     * Retourne les RDV du jour et les statistiques.
     */
    @GetMapping("/aujourd-hui")
    public ResponseEntity<List<RendezVousDTO>> getAgendaDuJour() {
        return ResponseEntity.ok(rendezVousService.getRendezVousDuJour());
    }
}

