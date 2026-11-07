package com.gestionrdv.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Entité représentant un patient dans le système.
 * Contient toutes les informations personnelles et médicales du patient.
 */
@Entity
@Table(name = "patients")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Le prénom est obligatoire")
    @Size(max = 100)
    @Column(name = "prenom", nullable = false)
    private String prenom;

    @NotBlank(message = "Le nom est obligatoire")
    @Size(max = 100)
    @Column(name = "nom", nullable = false)
    private String nom;

    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "Format d'email invalide")
    @Column(name = "email", unique = true, nullable = false)
    private String email;

    @Pattern(regexp = "^[0-9+\\-\\s()]{7,20}$", message = "Numéro de téléphone invalide")
    @Column(name = "telephone")
    private String telephone;

    @Column(name = "date_naissance")
    private String dateNaissance;

    @Enumerated(EnumType.STRING)
    @Column(name = "sexe")
    private Sexe sexe;

    @Column(name = "adresse", length = 500)
    private String adresse;

    @Column(name = "numero_securite_sociale", unique = true)
    private String numeroSecuriteSociale;

    @Column(name = "groupe_sanguin")
    private String groupeSanguin;

    @Column(name = "allergies", length = 1000)
    private String allergies;

    @Column(name = "antecedents_medicaux", length = 2000)
    private String antecedentsMedicaux;

    @Column(name = "medecin_traitant")
    private String medecinTraitant;

    @Column(name = "date_creation", nullable = false)
    private LocalDateTime dateCreation;

    @Column(name = "date_modification")
    private LocalDateTime dateModification;

    @Column(name = "actif", nullable = false)
    @Builder.Default
    private Boolean actif = true;

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<RendezVous> rendezVous;

    @PrePersist
    protected void onCreate() {
        dateCreation = LocalDateTime.now();
        dateModification = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        dateModification = LocalDateTime.now();
    }

    public enum Sexe {
        MASCULIN, FEMININ, AUTRE
    }

    /**
     * Retourne le nom complet du patient.
     */
    public String getNomComplet() {
        return prenom + " " + nom;
    }
}
