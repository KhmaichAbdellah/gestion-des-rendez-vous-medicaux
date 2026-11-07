package com.gestionrdv.service;

import com.gestionrdv.dto.AuthResponse;
import com.gestionrdv.dto.LoginRequest;
import com.gestionrdv.dto.RegisterRequest;
import com.gestionrdv.model.Utilisateur;
import com.gestionrdv.repository.UtilisateurRepository;
import com.gestionrdv.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Service d'authentification.
 * Gère l'inscription des médecins et la connexion avec BCrypt + JWT.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AuthService {

    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    /**
     * Inscrit un nouveau médecin dans le système.
     * Le mot de passe est haché avec BCrypt avant la persistance.
     */
    public AuthResponse inscrire(RegisterRequest request) {
        log.info("Inscription d'un nouveau médecin: {}", request.getEmail());

        // Vérification unicité email
        if (utilisateurRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Un compte avec cet email existe déjà: " + request.getEmail());
        }

        // Création de l'utilisateur avec mot de passe haché BCrypt
        Utilisateur utilisateur = Utilisateur.builder()
            .prenom(request.getPrenom())
            .nom(request.getNom())
            .email(request.getEmail())
            .motDePasse(passwordEncoder.encode(request.getMotDePasse())) // BCrypt hashing
            .specialite(request.getSpecialite())
            .numeroRpps(request.getNumeroRpps())
            .telephone(request.getTelephone())
            .actif(true)
            .build();

        Utilisateur saved = utilisateurRepository.save(utilisateur);
        log.info("Médecin inscrit avec l'ID: {}", saved.getId());

        String token = jwtService.genererToken(saved);
        return AuthResponse.of(token, saved);
    }

    /**
     * Connecte un médecin avec email/mot de passe.
     * Vérifie le mot de passe avec BCrypt et retourne un JWT.
     */
    public AuthResponse connecter(LoginRequest request) {
        log.info("Tentative de connexion: {}", request.getEmail());

        // Recherche de l'utilisateur
        Utilisateur utilisateur = utilisateurRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new BadCredentialsException("Email ou mot de passe incorrect"));

        // Vérification du compte actif
        if (!utilisateur.getActif()) {
            throw new BadCredentialsException("Ce compte a été désactivé");
        }

        // Vérification du mot de passe avec BCrypt
        if (!passwordEncoder.matches(request.getMotDePasse(), utilisateur.getMotDePasse())) {
            log.warn("Échec d'authentification pour: {}", request.getEmail());
            throw new BadCredentialsException("Email ou mot de passe incorrect");
        }

        // Mise à jour de la dernière connexion
        utilisateur.setDerniereConnexion(LocalDateTime.now());
        utilisateurRepository.save(utilisateur);

        String token = jwtService.genererToken(utilisateur);
        log.info("Connexion réussie pour: {}", request.getEmail());
        return AuthResponse.of(token, utilisateur);
    }
}
