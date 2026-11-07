package com.gestionrdv.repository;

import com.gestionrdv.model.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/**
 * Repository JPA pour la gestion des patients.
 * Fournit des méthodes de recherche et filtrage avancés.
 */
@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {

    /**
     * Recherche un patient par son email.
     */
    Optional<Patient> findByEmail(String email);

    /**
     * Recherche des patients par nom ou prénom (insensible à la casse).
     */
    @Query("SELECT p FROM Patient p WHERE " +
           "LOWER(p.nom) LIKE LOWER(CONCAT('%', :terme, '%')) OR " +
           "LOWER(p.prenom) LIKE LOWER(CONCAT('%', :terme, '%')) OR " +
           "LOWER(p.email) LIKE LOWER(CONCAT('%', :terme, '%'))")
    List<Patient> rechercherParNomOuPrenom(@Param("terme") String terme);

    /**
     * Retourne tous les patients actifs.
     */
    List<Patient> findByActifTrueOrderByNomAsc();

    /**
     * Vérifie si un email est déjà utilisé.
     */
    boolean existsByEmail(String email);

    /**
     * Vérifie si un numéro de sécurité sociale est déjà utilisé.
     */
    boolean existsByNumeroSecuriteSociale(String nss);

    /**
     * Recherche par numéro de téléphone.
     */
    Optional<Patient> findByTelephone(String telephone);

    /**
     * Compte le nombre de patients actifs.
     */
    long countByActifTrue();

    /**
     * Recherche par groupe sanguin.
     */
    List<Patient> findByGroupeSanguin(String groupeSanguin);
}
