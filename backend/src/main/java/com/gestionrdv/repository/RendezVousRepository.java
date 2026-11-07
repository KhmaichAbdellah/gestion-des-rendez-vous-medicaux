package com.gestionrdv.repository;

import com.gestionrdv.model.RendezVous;
import com.gestionrdv.model.RendezVous.StatutRendezVous;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository JPA pour la gestion des rendez-vous.
 * Fournit des méthodes de filtrage par date, statut et patient.
 */
@Repository
public interface RendezVousRepository extends JpaRepository<RendezVous, Long> {

    /**
     * Retourne tous les RDV d'un patient.
     */
    List<RendezVous> findByPatientIdOrderByDateHeureDebutDesc(Long patientId);

    /**
     * Retourne les RDV par statut.
     */
    List<RendezVous> findByStatutOrderByDateHeureDebutAsc(StatutRendezVous statut);

    /**
     * Retourne les RDV dans une plage de dates.
     */
    @Query("SELECT r FROM RendezVous r WHERE r.dateHeureDebut BETWEEN :debut AND :fin " +
           "ORDER BY r.dateHeureDebut ASC")
    List<RendezVous> findByPlageDates(
        @Param("debut") LocalDateTime debut,
        @Param("fin") LocalDateTime fin
    );

    /**
     * Retourne les RDV d'un patient dans une plage de dates.
     */
    @Query("SELECT r FROM RendezVous r WHERE r.patient.id = :patientId " +
           "AND r.dateHeureDebut BETWEEN :debut AND :fin " +
           "ORDER BY r.dateHeureDebut ASC")
    List<RendezVous> findByPatientAndPlageDates(
        @Param("patientId") Long patientId,
        @Param("debut") LocalDateTime debut,
        @Param("fin") LocalDateTime fin
    );

    /**
     * Filtrage combiné par statut et plage de dates.
     */
    @Query("SELECT r FROM RendezVous r WHERE " +
           "(:statut IS NULL OR r.statut = :statut) AND " +
           "(:debut IS NULL OR r.dateHeureDebut >= :debut) AND " +
           "(:fin IS NULL OR r.dateHeureDebut <= :fin) AND " +
           "(:patientId IS NULL OR r.patient.id = :patientId) " +
           "ORDER BY r.dateHeureDebut ASC")
    List<RendezVous> filtrer(
        @Param("statut") StatutRendezVous statut,
        @Param("debut") LocalDateTime debut,
        @Param("fin") LocalDateTime fin,
        @Param("patientId") Long patientId
    );

    /**
     * Retourne les RDV du jour.
     */
    @Query("SELECT r FROM RendezVous r WHERE " +
           "r.dateHeureDebut >= :debutJour AND r.dateHeureDebut < :finJour " +
           "ORDER BY r.dateHeureDebut ASC")
    List<RendezVous> findRdvDuJour(
        @Param("debutJour") LocalDateTime debutJour,
        @Param("finJour") LocalDateTime finJour
    );

    /**
     * Vérifie les conflits de planning (chevauchement de créneaux).
     */
    @Query("SELECT r FROM RendezVous r WHERE " +
           "r.statut != 'ANNULE' AND " +
           "r.id != :excludeId AND " +
           "((r.dateHeureDebut < :fin AND r.dateHeureFin > :debut))")
    List<RendezVous> findConflits(
        @Param("debut") LocalDateTime debut,
        @Param("fin") LocalDateTime fin,
        @Param("excludeId") Long excludeId
    );

    /**
     * Statistiques : compte par statut.
     */
    @Query("SELECT r.statut, COUNT(r) FROM RendezVous r GROUP BY r.statut")
    List<Object[]> countParStatut();

    /**
     * Statistiques : RDV des 30 derniers jours.
     */
    @Query("SELECT r FROM RendezVous r WHERE r.dateHeureDebut >= :dateDebut ORDER BY r.dateHeureDebut DESC")
    List<RendezVous> findRdvRecents(@Param("dateDebut") LocalDateTime dateDebut);

    /**
     * Retourne les prochains RDV (futurs, non annulés).
     */
    @Query("SELECT r FROM RendezVous r WHERE r.dateHeureDebut > :maintenant " +
           "AND r.statut != 'ANNULE' ORDER BY r.dateHeureDebut ASC")
    List<RendezVous> findProchains(@Param("maintenant") LocalDateTime maintenant);
}
