package com.gestionrdv.service;

import com.gestionrdv.dto.PatientDTO;
import com.gestionrdv.model.Patient;
import com.gestionrdv.repository.PatientRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service métier pour la gestion des patients.
 * Contient toute la logique CRUD et de recherche.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PatientService {

    private final PatientRepository patientRepository;

    /**
     * Retourne tous les patients actifs.
     */
    @Transactional(readOnly = true)
    public List<PatientDTO> getTousLesPatients() {
        log.debug("Récupération de tous les patients actifs");
        return patientRepository.findByActifTrueOrderByNomAsc()
            .stream()
            .map(PatientDTO::fromEntity)
            .collect(Collectors.toList());
    }

    /**
     * Retourne un patient par son ID.
     */
    @Transactional(readOnly = true)
    public PatientDTO getPatientParId(Long id) {
        log.debug("Récupération du patient ID: {}", id);
        Patient patient = patientRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Patient introuvable avec l'ID: " + id));
        return PatientDTO.fromEntity(patient);
    }

    /**
     * Crée un nouveau patient.
     */
    public PatientDTO creerPatient(PatientDTO patientDTO) {
        log.info("Création d'un nouveau patient: {} {}", patientDTO.getPrenom(), patientDTO.getNom());

        // Vérification unicité email
        if (patientRepository.existsByEmail(patientDTO.getEmail())) {
            throw new IllegalArgumentException("Un patient avec cet email existe déjà: " + patientDTO.getEmail());
        }

        // Vérification unicité NSS
        if (patientDTO.getNumeroSecuriteSociale() != null &&
            patientRepository.existsByNumeroSecuriteSociale(patientDTO.getNumeroSecuriteSociale())) {
            throw new IllegalArgumentException("Un patient avec ce numéro de sécurité sociale existe déjà");
        }

        Patient patient = patientDTO.toEntity();
        Patient saved = patientRepository.save(patient);
        log.info("Patient créé avec l'ID: {}", saved.getId());
        return PatientDTO.fromEntity(saved);
    }

    /**
     * Met à jour les informations d'un patient.
     */
    public PatientDTO mettreAJourPatient(Long id, PatientDTO patientDTO) {
        log.info("Mise à jour du patient ID: {}", id);

        Patient patient = patientRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Patient introuvable avec l'ID: " + id));

        // Vérification unicité email (si changement)
        if (!patient.getEmail().equals(patientDTO.getEmail()) &&
            patientRepository.existsByEmail(patientDTO.getEmail())) {
            throw new IllegalArgumentException("Un patient avec cet email existe déjà: " + patientDTO.getEmail());
        }

        // Mise à jour des champs
        patient.setPrenom(patientDTO.getPrenom());
        patient.setNom(patientDTO.getNom());
        patient.setEmail(patientDTO.getEmail());
        patient.setTelephone(patientDTO.getTelephone());
        patient.setDateNaissance(patientDTO.getDateNaissance());
        patient.setSexe(patientDTO.getSexe());
        patient.setAdresse(patientDTO.getAdresse());
        patient.setGroupeSanguin(patientDTO.getGroupeSanguin());
        patient.setAllergies(patientDTO.getAllergies());
        patient.setAntecedentsMedicaux(patientDTO.getAntecedentsMedicaux());
        patient.setMedecinTraitant(patientDTO.getMedecinTraitant());

        Patient updated = patientRepository.save(patient);
        log.info("Patient ID {} mis à jour", id);
        return PatientDTO.fromEntity(updated);
    }

    /**
     * Supprime (désactive) un patient (soft delete).
     */
    public void supprimerPatient(Long id) {
        log.info("Suppression (soft delete) du patient ID: {}", id);
        Patient patient = patientRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Patient introuvable avec l'ID: " + id));
        patient.setActif(false);
        patientRepository.save(patient);
        log.info("Patient ID {} désactivé", id);
    }

    /**
     * Recherche des patients par nom, prénom ou email.
     */
    @Transactional(readOnly = true)
    public List<PatientDTO> rechercherPatients(String terme) {
        log.debug("Recherche de patients avec le terme: {}", terme);
        return patientRepository.rechercherParNomOuPrenom(terme)
            .stream()
            .filter(p -> p.getActif())
            .map(PatientDTO::fromEntity)
            .collect(Collectors.toList());
    }

    /**
     * Retourne les statistiques des patients.
     */
    @Transactional(readOnly = true)
    public long getNombrePatientsActifs() {
        return patientRepository.countByActifTrue();
    }
}
