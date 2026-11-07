package com.gestionrdv.repository;

import com.gestionrdv.model.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

/**
 * Repository JPA pour la gestion des utilisateurs (médecins).
 */
@Repository
public interface UtilisateurRepository extends JpaRepository<Utilisateur, Long> {

    /**
     * Recherche un utilisateur par email (pour l'authentification).
     */
    Optional<Utilisateur> findByEmail(String email);

    /**
     * Vérifie si un email est déjà enregistré.
     */
    boolean existsByEmail(String email);

    /**
     * Vérifie si un numéro RPPS est déjà enregistré.
     */
    boolean existsByNumeroRpps(String numeroRpps);
}
