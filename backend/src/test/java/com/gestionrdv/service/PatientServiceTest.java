package com.gestionrdv.service;

import com.gestionrdv.dto.PatientDTO;
import com.gestionrdv.model.Patient;
import com.gestionrdv.repository.PatientRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PatientServiceTest {

    @Mock
    private PatientRepository patientRepository;

    @InjectMocks
    private PatientService patientService;

    private Patient patientTest;
    private PatientDTO patientDTOTest;

    @BeforeEach
    void setUp() {
        patientTest = Patient.builder()
            .id(1L)
            .prenom("Jean")
            .nom("Dupont")
            .email("jean.dupont@email.fr")
            .telephone("0612345678")
            .groupeSanguin("A+")
            .actif(true)
            .build();

        patientDTOTest = PatientDTO.builder()
            .id(1L)
            .prenom("Jean")
            .nom("Dupont")
            .email("jean.dupont@email.fr")
            .telephone("0612345678")
            .groupeSanguin("A+")
            .actif(true)
            .build();
    }

    @Test
    @DisplayName("Doit retourner tous les patients actifs triés par nom")
    void testGetTousLesPatients() {
        when(patientRepository.findByActifTrueOrderByNomAsc()).thenReturn(List.of(patientTest));

        List<PatientDTO> resultats = patientService.getTousLesPatients();

        assertThat(resultats).hasSize(1);
        assertThat(resultats.get(0).getEmail()).isEqualTo("jean.dupont@email.fr");
        verify(patientRepository, times(1)).findByActifTrueOrderByNomAsc();
    }

    @Test
    @DisplayName("Doit trouver un patient par son ID avec succès")
    void testGetPatientParIdSucces() {
        when(patientRepository.findById(1L)).thenReturn(Optional.of(patientTest));

        PatientDTO resultat = patientService.getPatientParId(1L);

        assertThat(resultat).isNotNull();
        assertThat(resultat.getNom()).isEqualTo("Dupont");
        assertThat(resultat.getPrenom()).isEqualTo("Jean");
    }

    @Test
    @DisplayName("Doit lever une exception si le patient par ID n'existe pas")
    void testGetPatientParIdIntrouvable() {
        when(patientRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> patientService.getPatientParId(99L))
            .isInstanceOf(EntityNotFoundException.class)
            .hasMessageContaining("Patient introuvable avec l'ID: 99");
    }

    @Test
    @DisplayName("Doit créer un patient valide avec succès")
    void testCreerPatientSucces() {
        when(patientRepository.existsByEmail("jean.dupont@email.fr")).thenReturn(false);
        when(patientRepository.save(any(Patient.class))).thenReturn(patientTest);

        PatientDTO cree = patientService.creerPatient(patientDTOTest);

        assertThat(cree).isNotNull();
        assertThat(cree.getId()).isEqualTo(1L);
        verify(patientRepository, times(1)).save(any(Patient.class));
    }

    @Test
    @DisplayName("Doit refuser la création si l'email existe déjà")
    void testCreerPatientEmailExistant() {
        when(patientRepository.existsByEmail(anyString())).thenReturn(true);

        assertThatThrownBy(() -> patientService.creerPatient(patientDTOTest))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("Un patient avec cet email existe déjà");

        verify(patientRepository, never()).save(any(Patient.class));
    }

    @Test
    @DisplayName("Doit désactiver le patient (soft delete) lors de la suppression")
    void testSupprimerPatientSoftDelete() {
        when(patientRepository.findById(1L)).thenReturn(Optional.of(patientTest));

        patientService.supprimerPatient(1L);

        assertThat(patientTest.getActif()).isFalse();
        verify(patientRepository, times(1)).save(patientTest);
    }

    @Test
    @DisplayName("Doit rechercher des patients par terme")
    void testRechercherPatients() {
        when(patientRepository.rechercherParNomOuPrenom("dupont")).thenReturn(List.of(patientTest));

        List<PatientDTO> trouves = patientService.rechercherPatients("dupont");

        assertThat(trouves).hasSize(1);
        assertThat(trouves.get(0).getNom()).isEqualTo("Dupont");
    }
}
