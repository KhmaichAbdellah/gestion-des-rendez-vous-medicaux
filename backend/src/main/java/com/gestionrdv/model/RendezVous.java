package com.gestionrdv.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Entité représentant un rendez-vous médical.
 * Lie un patient à une consultation avec statut, notes et informations de suivi.
 */
@Entity
@Table(name = "rendez_vous", indexes = {
    @Index(name = "idx_rdv_patient", columnList = "patient_id"),
    @Index(name = "idx_rdv_date", columnList = "date_heure_debut"),
    @Index(name = "idx_rdv_statut", columnList = "statut")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RendezVous {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Le patient est obligatoire")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @NotNull(message = "La date/heure de début est obligatoire")
    @Column(name = "date_heure_debut", nullable = false)
    private LocalDateTime dateHeureDebut;

    @NotNull(message = "La date/heure de fin est obligatoire")
    @Column(name = "date_heure_fin", nullable = false)
    private LocalDateTime dateHeureFin;

    @NotBlank(message = "Le motif de consultation est obligatoire")
    @Size(max = 500)
    @Column(name = "motif", nullable = false)
    private String motif;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut", nullable = false)
    @Builder.Default
    private StatutRendezVous statut = StatutRendezVous.EN_ATTENTE;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_consultation")
    @Builder.Default
    private TypeConsultation typeConsultation = TypeConsultation.CONSULTATION_GENERALE;

    @Column(name = "notes_medecin", length = 3000)
    private String notesMedecin;

    @Column(name = "ordonnance", length = 5000)
    private String ordonnance;

    @Column(name = "diagnostic", length = 2000)
    private String diagnostic;

    @Column(name = "rappel_envoye")
    @Builder.Default
    private Boolean rappelEnvoye = false;

    @Column(name = "date_creation", nullable = false)
    private LocalDateTime dateCreation;

    @Column(name = "date_modification")
    private LocalDateTime dateModification;

    @Column(name = "motif_annulation")
    private String motifAnnulation;

    @PrePersist
    protected void onCreate() {
        dateCreation = LocalDateTime.now();
        dateModification = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        dateModification = LocalDateTime.now();
    }

    /**
     * Statut du rendez-vous avec code couleur associé.
     * CONFIRME = vert, EN_ATTENTE = jaune, ANNULE = rouge, TERMINE = gris
     */
    public enum StatutRendezVous {
        EN_ATTENTE("EN_ATTENTE", "#FFC107"),      // Jaune
        CONFIRME("CONFIRME", "#4CAF50"),           // Vert
        ANNULE("ANNULE", "#F44336"),               // Rouge
        TERMINE("TERMINE", "#9E9E9E"),             // Gris
        REPORTE("REPORTE", "#FF9800");             // Orange

        private final String code;
        private final String couleur;

        StatutRendezVous(String code, String couleur) {
            this.code = code;
            this.couleur = couleur;
        }

        public String getCode() { return code; }
        public String getCouleur() { return couleur; }
    }

    /**
     * Type de consultation médicale.
     */
    public enum TypeConsultation {
        CONSULTATION_GENERALE,
        SUIVI,
        URGENCE,
        TELECONSULTATION,
        BILAN,
        VACCINATION
    }

    /**
     * Vérifie si le rendez-vous peut être annulé.
     */
    public boolean peutEtreAnnule() {
        return statut == StatutRendezVous.EN_ATTENTE || statut == StatutRendezVous.CONFIRME;
    }

    /**
     * Vérifie si le rendez-vous est passé.
     */
    public boolean estPasse() {
        return dateHeureDebut.isBefore(LocalDateTime.now());
    }
}
