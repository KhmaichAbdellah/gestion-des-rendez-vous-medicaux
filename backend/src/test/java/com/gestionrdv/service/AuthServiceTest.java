package com.gestionrdv.service;

import com.gestionrdv.dto.AuthResponse;
import com.gestionrdv.dto.LoginRequest;
import com.gestionrdv.dto.RegisterRequest;
import com.gestionrdv.model.Utilisateur;
import com.gestionrdv.repository.UtilisateurRepository;
import com.gestionrdv.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UtilisateurRepository utilisateurRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthService authService;

    private Utilisateur medecinTest;

    @BeforeEach
    void setUp() {
        medecinTest = Utilisateur.builder()
            .id(1L)
            .prenom("Sophie")
            .nom("Martin")
            .email("dr.martin@clinique.fr")
            .motDePasse("$2a$12$hashedPasswordExample...")
            .specialite("Médecine Générale")
            .roles(Set.of("ROLE_MEDECIN"))
            .actif(true)
            .build();
    }

    @Test
    @DisplayName("Doit inscrire un médecin en hachant son mot de passe avec BCrypt")
    void testInscrireMedecinSucces() {
        RegisterRequest req = new RegisterRequest(
            "Sophie", "Martin", "dr.martin@clinique.fr", "Medecin2024!",
            "Médecine Générale", "10001234567", "0123456789"
        );

        when(utilisateurRepository.existsByEmail("dr.martin@clinique.fr")).thenReturn(false);
        when(passwordEncoder.encode("Medecin2024!")).thenReturn("$2a$12$hashedPasswordExample...");
        when(utilisateurRepository.save(any(Utilisateur.class))).thenReturn(medecinTest);
        when(jwtService.genererToken(any(Utilisateur.class))).thenReturn("jwt-mock-token-xyz");

        AuthResponse res = authService.inscrire(req);

        assertThat(res).isNotNull();
        assertThat(res.getToken()).isEqualTo("jwt-mock-token-xyz");
        assertThat(res.getEmail()).isEqualTo("dr.martin@clinique.fr");
        verify(passwordEncoder, times(1)).encode("Medecin2024!");
        verify(utilisateurRepository, times(1)).save(any(Utilisateur.class));
    }

    @Test
    @DisplayName("Doit connecter un médecin avec mot de passe valide")
    void testConnecterSucces() {
        LoginRequest req = new LoginRequest("dr.martin@clinique.fr", "Medecin2024!");

        when(utilisateurRepository.findByEmail("dr.martin@clinique.fr")).thenReturn(Optional.of(medecinTest));
        when(passwordEncoder.matches("Medecin2024!", medecinTest.getMotDePasse())).thenReturn(true);
        when(jwtService.genererToken(medecinTest)).thenReturn("jwt-valid-token");

        AuthResponse res = authService.connecter(req);

        assertThat(res).isNotNull();
        assertThat(res.getToken()).isEqualTo("jwt-valid-token");
        verify(utilisateurRepository, times(1)).save(medecinTest); // Mise à jour dernière connexion
    }

    @Test
    @DisplayName("Doit échouer la connexion si mauvais mot de passe")
    void testConnecterMauvaisMotDePasse() {
        LoginRequest req = new LoginRequest("dr.martin@clinique.fr", "MauvaisMdp!");

        when(utilisateurRepository.findByEmail("dr.martin@clinique.fr")).thenReturn(Optional.of(medecinTest));
        when(passwordEncoder.matches("MauvaisMdp!", medecinTest.getMotDePasse())).thenReturn(false);

        assertThatThrownBy(() -> authService.connecter(req))
            .isInstanceOf(BadCredentialsException.class)
            .hasMessageContaining("Email ou mot de passe incorrect");
    }

    @Test
    @DisplayName("Doit refuser la connexion si compte inactif")
    void testConnecterCompteInactif() {
        medecinTest.setActif(false);
        LoginRequest req = new LoginRequest("dr.martin@clinique.fr", "Medecin2024!");

        when(utilisateurRepository.findByEmail("dr.martin@clinique.fr")).thenReturn(Optional.of(medecinTest));

        assertThatThrownBy(() -> authService.connecter(req))
            .isInstanceOf(BadCredentialsException.class)
            .hasMessageContaining("désactivé");
    }
}

