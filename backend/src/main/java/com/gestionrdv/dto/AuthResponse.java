package com.gestionrdv.dto;

import lombok.*;

/**
 * DTO pour la réponse d'authentification (JWT token + infos utilisateur).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {

    private String token;
    private String type;
    private Long id;
    private String email;
    private String nom;
    private String prenom;
    private String specialite;
    private java.util.Set<String> roles;

    public static AuthResponse of(String token, com.gestionrdv.model.Utilisateur utilisateur) {
        return AuthResponse.builder()
            .token(token)
            .type("Bearer")
            .id(utilisateur.getId())
            .email(utilisateur.getEmail())
            .nom(utilisateur.getNom())
            .prenom(utilisateur.getPrenom())
            .specialite(utilisateur.getSpecialite())
            .roles(utilisateur.getRoles())
            .build();
    }
}
