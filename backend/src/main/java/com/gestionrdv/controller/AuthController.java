package com.gestionrdv.controller;

import com.gestionrdv.dto.AuthResponse;
import com.gestionrdv.dto.LoginRequest;
import com.gestionrdv.dto.RegisterRequest;
import com.gestionrdv.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Contrôleur REST pour l'authentification.
 * Gère l'inscription et la connexion des médecins.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;

    /**
     * POST /api/auth/login
     * Connecte un médecin avec email/mot de passe.
     * Retourne un token JWT Bearer.
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        log.info("Requête de connexion pour: {}", request.getEmail());
        AuthResponse response = authService.connecter(request);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/auth/register
     * Inscrit un nouveau médecin dans le système.
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        log.info("Requête d'inscription pour: {}", request.getEmail());
        AuthResponse response = authService.inscrire(request);
        return ResponseEntity.ok(response);
    }
}

