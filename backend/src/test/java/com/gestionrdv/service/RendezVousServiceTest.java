package com.gestionrdv.service;

import com.gestionrdv.dto.RendezVousDTO;
import com.gestionrdv.model.Patient;
import com.gestionrdv.model.RendezVous;
import com.gestionrdv.model.RendezVous.StatutRendezVous;
import com.gestionrdv.repository.PatientRepository;
import com.gestionrdv.repository.RendezVousRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RendezVousServiceTest {

    @Mock
    private RendezVousRepository rendezVousRepository;

    @Mock
    private PatientRepository patientRepository;

    @InjectMocks
    private RendezVousService rendezVousService;

    private Patient patientTest;
    private RendezVous rdvTest;
    private LocalDateTime dateDebut;
    private LocalDateTime dateFin;

    @BeforeEach
    void setUp() {
        patientTest = Patient.builder()
            .id(1L)
            .prenom("Jean")
            .nom("Dupont")
            .email("jean.dupont@email.fr")
            .build();

        dateDebut = LocalDateTime.now().plusDays(1).withHour(10).withMinute(0);
        dateFin = dateDebut.plusMinutes(30);

        rdvTest = RendezVous.builder()
            .id(10L)
            .patient(patientTest)
            .dateHeureDebut(dateDebut)
            .dateHeureFin(dateFin)
            .motif("Consultation de routine")
            .statut(StatutRendezVous.EN_ATTENTE)
            .build();
    }

    @Test
    @DisplayName("Doit créer un rendez-vous avec succès si aucun conflit")
    void testCreerRendezVousSucces() {
        RendezVousDTO dto = RendezVousDTO.builder()
            .patientId(1L)
            .dateHeureDebut(dateDebut)
            .dateHeureFin(dateFin)
            .motif("Consultation de routine")
            .build();

        when(patientRepository.findById(1L)).thenReturn(Optional.of(patientTest));
        when(rendezVousRepository.findConflits(eq(dateDebut), eq(dateFin), eq(-1L)))
            .thenReturn(Collections.emptyList());
        when(rendezVousRepository.save(any(RendezVous.class))).thenReturn(rdvTest);

        RendezVousDTO resultat = rendezVousService.creerRendezVous(dto);

        assertThat(resultat).isNotNull();
        assertThat(resultat.getId()).isEqualTo(10L);
        assertThat(resultat.getStatut()).isEqualTo(StatutRendezVous.EN_ATTENTE);
        verify(rendezVousRepository, times(1)).save(any(RendezVous.class));
    }

    @Test
    @DisplayName("Doit refuser la création s'il y a un conflit d'horaire")
    void testCreerRendezVousConflit() {
        RendezVousDTO dto = RendezVousDTO.builder()
            .patientId(1L)
            .dateHeureDebut(dateDebut)
            .dateHeureFin(dateFin)
            .motif("Consultation urgente")
            .build();

        when(patientRepository.findById(1L)).thenReturn(Optional.of(patientTest));
        when(rendezVousRepository.findConflits(eq(dateDebut), eq(dateFin), eq(-1L)))
            .thenReturn(List.of(rdvTest)); // Conflit trouvé !

        assertThatThrownBy(() -> rendezVousService.creerRendezVous(dto))
            .isInstanceOf(IllegalStateException.class)
            .hasMessageContaining("Conflit de planning");

        verify(rendezVousRepository, never()).save(any(RendezVous.class));
    }

    @Test
    @DisplayName("Doit confirmer un rendez-vous (statut -> CONFIRME / vert)")
    void testConfirmerRendezVous() {
        when(rendezVousRepository.findById(10L)).thenReturn(Optional.of(rdvTest));
        when(rendezVousRepository.save(any(RendezVous.class))).thenAnswer(invocation -> invocation.getArgument(0));

        RendezVousDTO resultat = rendezVousService.confirmerRendezVous(10L);

        assertThat(resultat.getStatut()).isEqualTo(StatutRendezVous.CONFIRME);
        assertThat(resultat.getStatutCouleur()).isEqualTo("#4CAF50");
    }

    @Test
    @DisplayName("Doit annuler un rendez-vous avec un motif d'annulation")
    void testAnnulerRendezVous() {
        when(rendezVousRepository.findById(10L)).thenReturn(Optional.of(rdvTest));
        when(rendezVousRepository.save(any(RendezVous.class))).thenAnswer(invocation -> invocation.getArgument(0));

        RendezVousDTO resultat = rendezVousService.annulerRendezVous(10L, "Patient indisponible");

        assertThat(resultat.getStatut()).isEqualTo(StatutRendezVous.ANNULE);
        assertThat(resultat.getStatutCouleur()).isEqualTo("#F44336");
        assertThat(resultat.getMotifAnnulation()).isEqualTo("Patient indisponible");
    }

    @Test
    @DisplayName("Doit clôturer un rendez-vous (TERMINE) avec notes et ordonnance")
    void testTerminerRendezVous() {
        when(rendezVousRepository.findById(10L)).thenReturn(Optional.of(rdvTest));
        when(rendezVousRepository.save(any(RendezVous.class))).thenAnswer(invocation -> invocation.getArgument(0));

        RendezVousDTO resultat = rendezVousService.terminerRendezVous(
            10L, "Tension 12/8", "Rhinopharyngite", "Paracétamol 1g 3x/jour pendant 5 jours"
        );

        assertThat(resultat.getStatut()).isEqualTo(StatutRendezVous.TERMINE);
        assertThat(resultat.getDiagnostic()).isEqualTo("Rhinopharyngite");
        assertThat(resultat.getOrdonnance()).contains("Paracétamol");
    }
}

