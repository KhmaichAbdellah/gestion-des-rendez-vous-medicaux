package com.gestionrdv.service;

import com.gestionrdv.dto.RendezVousDTO;
import com.gestionrdv.dto.StatistiquesDTO;
import com.gestionrdv.model.Patient;
import com.gestionrdv.model.RendezVous;
import com.gestionrdv.model.RendezVous.StatutRendezVous;
import com.gestionrdv.repository.PatientRepository;
import com.gestionrdv.repository.RendezVousRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service métier pour la gestion des rendez-vous médicaux.
 * Gère le CRUD, les filtres, la détection de conflits et les statistiques.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class RendezVousService {

    private final RendezVousRepository rendezVousRepository;
    private final PatientRepository patientRepository;

    /**
     * Retourne tous les rendez-vous.
     */
    @Transactional(readOnly = true)
    public List<RendezVousDTO> getTousLesRendezVous() {
        return rendezVousRepository.findAll()
            .stream()
            .map(RendezVousDTO::fromEntity)
            .collect(Collectors.toList());
    }

    /**
     * Retourne un rendez-vous par son ID.
     */
    @Transactional(readOnly = true)
    public RendezVousDTO getRendezVousParId(Long id) {
        RendezVous rdv = rendezVousRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Rendez-vous introuvable avec l'ID: " + id));
        return RendezVousDTO.fromEntity(rdv);
    }

    /**
     * Crée un nouveau rendez-vous.
     * Vérifie les conflits de planning avant création.
     */
    public RendezVousDTO creerRendezVous(RendezVousDTO dto) {
        log.info("Création d'un rendez-vous pour le patient ID: {}", dto.getPatientId());

        // Validation des dates
        validerDates(dto.getDateHeureDebut(), dto.getDateHeureFin());

        // Récupération du patient
        Patient patient = patientRepository.findById(dto.getPatientId())
            .orElseThrow(() -> new EntityNotFoundException("Patient introuvable avec l'ID: " + dto.getPatientId()));

        // Vérification des conflits de planning
        List<RendezVous> conflits = rendezVousRepository.findConflits(
            dto.getDateHeureDebut(), dto.getDateHeureFin(), -1L
        );
        if (!conflits.isEmpty()) {
            throw new IllegalStateException("Conflit de planning: un autre rendez-vous existe dans ce créneau");
        }

        // Création du rendez-vous
        RendezVous rdv = RendezVous.builder()
            .patient(patient)
            .dateHeureDebut(dto.getDateHeureDebut())
            .dateHeureFin(dto.getDateHeureFin())
            .motif(dto.getMotif())
            .statut(dto.getStatut() != null ? dto.getStatut() : StatutRendezVous.EN_ATTENTE)
            .typeConsultation(dto.getTypeConsultation() != null ?
                dto.getTypeConsultation() : RendezVous.TypeConsultation.CONSULTATION_GENERALE)
            .notesMedecin(dto.getNotesMedecin())
            .build();

        RendezVous saved = rendezVousRepository.save(rdv);
        log.info("Rendez-vous créé avec l'ID: {}", saved.getId());
        return RendezVousDTO.fromEntity(saved);
    }

    /**
     * Met à jour un rendez-vous existant.
     */
    public RendezVousDTO mettreAJourRendezVous(Long id, RendezVousDTO dto) {
        log.info("Mise à jour du rendez-vous ID: {}", id);

        RendezVous rdv = rendezVousRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Rendez-vous introuvable avec l'ID: " + id));

        // Validation des dates
        validerDates(dto.getDateHeureDebut(), dto.getDateHeureFin());

        // Vérification des conflits (en excluant le RDV actuel)
        List<RendezVous> conflits = rendezVousRepository.findConflits(
            dto.getDateHeureDebut(), dto.getDateHeureFin(), id
        );
        if (!conflits.isEmpty()) {
            throw new IllegalStateException("Conflit de planning: un autre rendez-vous existe dans ce créneau");
        }

        // Si changement de patient
        if (!rdv.getPatient().getId().equals(dto.getPatientId())) {
            Patient nouveauPatient = patientRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new EntityNotFoundException("Patient introuvable"));
            rdv.setPatient(nouveauPatient);
        }

        rdv.setDateHeureDebut(dto.getDateHeureDebut());
        rdv.setDateHeureFin(dto.getDateHeureFin());
        rdv.setMotif(dto.getMotif());
        rdv.setTypeConsultation(dto.getTypeConsultation());
        rdv.setNotesMedecin(dto.getNotesMedecin());
        rdv.setOrdonnance(dto.getOrdonnance());
        rdv.setDiagnostic(dto.getDiagnostic());

        // Mise à jour du statut seulement si fourni
        if (dto.getStatut() != null) {
            rdv.setStatut(dto.getStatut());
        }

        RendezVous updated = rendezVousRepository.save(rdv);
        return RendezVousDTO.fromEntity(updated);
    }

    /**
     * Annule un rendez-vous avec un motif.
     */
    public RendezVousDTO annulerRendezVous(Long id, String motifAnnulation) {
        log.info("Annulation du rendez-vous ID: {}", id);

        RendezVous rdv = rendezVousRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Rendez-vous introuvable avec l'ID: " + id));

        if (!rdv.peutEtreAnnule()) {
            throw new IllegalStateException("Ce rendez-vous ne peut pas être annulé (statut: " + rdv.getStatut() + ")");
        }

        rdv.setStatut(StatutRendezVous.ANNULE);
        rdv.setMotifAnnulation(motifAnnulation);

        RendezVous updated = rendezVousRepository.save(rdv);
        log.info("Rendez-vous ID {} annulé", id);
        return RendezVousDTO.fromEntity(updated);
    }

    /**
     * Confirme un rendez-vous.
     */
    public RendezVousDTO confirmerRendezVous(Long id) {
        log.info("Confirmation du rendez-vous ID: {}", id);

        RendezVous rdv = rendezVousRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Rendez-vous introuvable avec l'ID: " + id));

        rdv.setStatut(StatutRendezVous.CONFIRME);
        RendezVous updated = rendezVousRepository.save(rdv);
        return RendezVousDTO.fromEntity(updated);
    }

    /**
     * Marque un rendez-vous comme terminé.
     */
    public RendezVousDTO terminerRendezVous(Long id, String notes, String diagnostic, String ordonnance) {
        log.info("Clôture du rendez-vous ID: {}", id);

        RendezVous rdv = rendezVousRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Rendez-vous introuvable avec l'ID: " + id));

        rdv.setStatut(StatutRendezVous.TERMINE);
        if (notes != null) rdv.setNotesMedecin(notes);
        if (diagnostic != null) rdv.setDiagnostic(diagnostic);
        if (ordonnance != null) rdv.setOrdonnance(ordonnance);

        RendezVous updated = rendezVousRepository.save(rdv);
        return RendezVousDTO.fromEntity(updated);
    }

    /**
     * Supprime définitivement un rendez-vous.
     */
    public void supprimerRendezVous(Long id) {
        log.info("Suppression du rendez-vous ID: {}", id);
        if (!rendezVousRepository.existsById(id)) {
            throw new EntityNotFoundException("Rendez-vous introuvable avec l'ID: " + id);
        }
        rendezVousRepository.deleteById(id);
    }

    /**
     * Filtrage des rendez-vous par statut, date et patient.
     */
    @Transactional(readOnly = true)
    public List<RendezVousDTO> filtrerRendezVous(
        StatutRendezVous statut,
        LocalDateTime debut,
        LocalDateTime fin,
        Long patientId
    ) {
        return rendezVousRepository.filtrer(statut, debut, fin, patientId)
            .stream()
            .map(RendezVousDTO::fromEntity)
            .collect(Collectors.toList());
    }

    /**
     * Retourne les rendez-vous du jour courant.
     */
    @Transactional(readOnly = true)
    public List<RendezVousDTO> getRendezVousDuJour() {
        LocalDateTime debutJour = LocalDate.now().atStartOfDay();
        LocalDateTime finJour = LocalDate.now().atTime(LocalTime.MAX);
        return rendezVousRepository.findRdvDuJour(debutJour, finJour)
            .stream()
            .map(RendezVousDTO::fromEntity)
            .collect(Collectors.toList());
    }

    /**
     * Retourne les rendez-vous d'un patient.
     */
    @Transactional(readOnly = true)
    public List<RendezVousDTO> getRendezVousParPatient(Long patientId) {
        return rendezVousRepository.findByPatientIdOrderByDateHeureDebutDesc(patientId)
            .stream()
            .map(RendezVousDTO::fromEntity)
            .collect(Collectors.toList());
    }

    /**
     * Retourne les rendez-vous dans une plage de dates (pour le calendrier).
     */
    @Transactional(readOnly = true)
    public List<RendezVousDTO> getRendezVousCalendrier(LocalDateTime debut, LocalDateTime fin) {
        return rendezVousRepository.findByPlageDates(debut, fin)
            .stream()
            .map(RendezVousDTO::fromEntity)
            .collect(Collectors.toList());
    }

    /**
     * Retourne les statistiques pour le tableau de bord.
     */
    @Transactional(readOnly = true)
    public StatistiquesDTO getStatistiques() {
        LocalDateTime maintenant = LocalDateTime.now();
        LocalDateTime debutJour = LocalDate.now().atStartOfDay();
        LocalDateTime finJour = LocalDate.now().atTime(LocalTime.MAX);
        LocalDateTime dans7Jours = maintenant.plusDays(7);

        List<RendezVous> tousRdv = rendezVousRepository.findAll();

        Map<StatutRendezVous, Long> parStatut = tousRdv.stream()
            .collect(Collectors.groupingBy(RendezVous::getStatut, Collectors.counting()));

        long rdvAujourdhui = rendezVousRepository.findRdvDuJour(debutJour, finJour).size();
        long rdvSemaine = rendezVousRepository.findByPlageDates(debutJour,
            LocalDate.now().plusDays(7).atTime(LocalTime.MAX)).size();

        return StatistiquesDTO.builder()
            .totalRendezVous(tousRdv.size())
            .rdvAujourdhui(rdvAujourdhui)
            .rdvCetteSemaine(rdvSemaine)
            .rdvConfirmes(parStatut.getOrDefault(StatutRendezVous.CONFIRME, 0L))
            .rdvEnAttente(parStatut.getOrDefault(StatutRendezVous.EN_ATTENTE, 0L))
            .rdvAnnules(parStatut.getOrDefault(StatutRendezVous.ANNULE, 0L))
            .rdvTermines(parStatut.getOrDefault(StatutRendezVous.TERMINE, 0L))
            .repartitionParStatut(parStatut)
            .prochains7Jours(rendezVousRepository.findByPlageDates(maintenant, dans7Jours).size())
            .build();
    }

    /**
     * Valide que la date de début est avant la date de fin.
     */
    private void validerDates(LocalDateTime debut, LocalDateTime fin) {
        if (debut == null || fin == null) {
            throw new IllegalArgumentException("Les dates de début et de fin sont obligatoires");
        }
        if (!debut.isBefore(fin)) {
            throw new IllegalArgumentException("La date de début doit être avant la date de fin");
        }
        if (debut.isBefore(LocalDateTime.now().minusMinutes(5))) {
            log.warn("Création d'un rendez-vous dans le passé");
        }
    }
}
