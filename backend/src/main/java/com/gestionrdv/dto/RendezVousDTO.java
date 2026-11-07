package com.gestionrdv.dto;

import com.gestionrdv.model.RendezVous;
import com.gestionrdv.model.RendezVous.StatutRendezVous;
import com.gestionrdv.model.RendezVous.TypeConsultation;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * DTO pour la création et modification d'un rendez-vous.
 * Inclut les informations du patient (imbriquées) pour l'affichage calendrier.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RendezVousDTO {

    private Long id;

    @NotNull(message = "Le patient est obligatoire")
    private Long patientId;

    // Informations du patient (pour affichage)
    private String patientNom;
    private String patientPrenom;
    private String patientEmail;
    private String patientTelephone;

    @NotNull(message = "La date/heure de début est obligatoire")
    private LocalDateTime dateHeureDebut;

    @NotNull(message = "La date/heure de fin est obligatoire")
    private LocalDateTime dateHeureFin;

    @NotBlank(message = "Le motif est obligatoire")
    private String motif;

    private StatutRendezVous statut;
    private String statutCouleur;    // Code couleur hex pour le calendrier

    private TypeConsultation typeConsultation;
    private String notesMedecin;
    private String ordonnance;
    private String diagnostic;
    private Boolean rappelEnvoye;
    private String motifAnnulation;

    private LocalDateTime dateCreation;
    private LocalDateTime dateModification;

    /**
     * Convertit l'entité RendezVous en DTO avec les infos patient.
     */
    public static RendezVousDTO fromEntity(RendezVous rdv) {
        RendezVousDTO dto = RendezVousDTO.builder()
            .id(rdv.getId())
            .patientId(rdv.getPatient().getId())
            .patientNom(rdv.getPatient().getNom())
            .patientPrenom(rdv.getPatient().getPrenom())
            .patientEmail(rdv.getPatient().getEmail())
            .patientTelephone(rdv.getPatient().getTelephone())
            .dateHeureDebut(rdv.getDateHeureDebut())
            .dateHeureFin(rdv.getDateHeureFin())
            .motif(rdv.getMotif())
            .statut(rdv.getStatut())
            .typeConsultation(rdv.getTypeConsultation())
            .notesMedecin(rdv.getNotesMedecin())
            .ordonnance(rdv.getOrdonnance())
            .diagnostic(rdv.getDiagnostic())
            .rappelEnvoye(rdv.getRappelEnvoye())
            .motifAnnulation(rdv.getMotifAnnulation())
            .dateCreation(rdv.getDateCreation())
            .dateModification(rdv.getDateModification())
            .build();

        // Ajout de la couleur selon le statut
        if (rdv.getStatut() != null) {
            dto.setStatutCouleur(rdv.getStatut().getCouleur());
        }

        return dto;
    }
}
