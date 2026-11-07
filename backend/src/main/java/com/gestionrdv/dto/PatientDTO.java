package com.gestionrdv.dto;

import com.gestionrdv.model.Patient;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * DTO pour la création et modification d'un patient.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientDTO {

    private Long id;

    @NotBlank(message = "Le prénom est obligatoire")
    private String prenom;

    @NotBlank(message = "Le nom est obligatoire")
    private String nom;

    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "Format d'email invalide")
    private String email;

    private String telephone;
    private String dateNaissance;
    private Patient.Sexe sexe;
    private String adresse;
    private String numeroSecuriteSociale;
    private String groupeSanguin;
    private String allergies;
    private String antecedentsMedicaux;
    private String medecinTraitant;
    private Boolean actif;
    private LocalDateTime dateCreation;
    private LocalDateTime dateModification;

    /**
     * Convertit l'entité Patient en DTO.
     */
    public static PatientDTO fromEntity(Patient patient) {
        return PatientDTO.builder()
            .id(patient.getId())
            .prenom(patient.getPrenom())
            .nom(patient.getNom())
            .email(patient.getEmail())
            .telephone(patient.getTelephone())
            .dateNaissance(patient.getDateNaissance())
            .sexe(patient.getSexe())
            .adresse(patient.getAdresse())
            .numeroSecuriteSociale(patient.getNumeroSecuriteSociale())
            .groupeSanguin(patient.getGroupeSanguin())
            .allergies(patient.getAllergies())
            .antecedentsMedicaux(patient.getAntecedentsMedicaux())
            .medecinTraitant(patient.getMedecinTraitant())
            .actif(patient.getActif())
            .dateCreation(patient.getDateCreation())
            .dateModification(patient.getDateModification())
            .build();
    }

    /**
     * Convertit le DTO en entité Patient.
     */
    public Patient toEntity() {
        return Patient.builder()
            .prenom(this.prenom)
            .nom(this.nom)
            .email(this.email)
            .telephone(this.telephone)
            .dateNaissance(this.dateNaissance)
            .sexe(this.sexe)
            .adresse(this.adresse)
            .numeroSecuriteSociale(this.numeroSecuriteSociale)
            .groupeSanguin(this.groupeSanguin)
            .allergies(this.allergies)
            .antecedentsMedicaux(this.antecedentsMedicaux)
            .medecinTraitant(this.medecinTraitant)
            .actif(this.actif != null ? this.actif : true)
            .build();
    }
}
