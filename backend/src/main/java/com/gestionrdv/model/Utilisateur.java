package com.gestionrdv.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * Entité représentant un utilisateur (médecin) du système.
 * L'authentification se fait par email/mot de passe avec hachage BCrypt.
 */
@Entity
@Table(name = "utilisateurs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Utilisateur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Le prénom est obligatoire")
    @Column(name = "prenom", nullable = false)
    private String prenom;

    @NotBlank(message = "Le nom est obligatoire")
    @Column(name = "nom", nullable = false)
    private String nom;

    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "Format d'email invalide")
    @Column(name = "email", unique = true, nullable = false)
    private String email;

    @NotBlank(message = "Le mot de passe est obligatoire")
    @Column(name = "mot_de_passe", nullable = false)
    private String motDePasse;

    @Column(name = "specialite")
    private String specialite;

    @Column(name = "numero_rpps", unique = true)
    private String numeroRpps;

    @Column(name = "telephone")
    private String telephone;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "utilisateur_roles", joinColumns = @JoinColumn(name = "utilisateur_id"))
    @Column(name = "role")
    @Builder.Default
    private Set<String> roles = new HashSet<>();

    @Column(name = "actif", nullable = false)
    @Builder.Default
    private Boolean actif = true;

    @Column(name = "date_creation", nullable = false)
    private LocalDateTime dateCreation;

    @Column(name = "derniere_connexion")
    private LocalDateTime derniereConnexion;

    @PrePersist
    protected void onCreate() {
        dateCreation = LocalDateTime.now();
        if (roles.isEmpty()) {
            roles.add("ROLE_MEDECIN");
        }
    }

    /**
     * Retourne le nom complet du médecin avec son titre.
     */
    public String getNomCompletAvecTitre() {
        return "Dr. " + prenom + " " + nom;
    }
}
