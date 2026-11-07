package com.gestionrdv.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gestionrdv.dto.RendezVousDTO;
import com.gestionrdv.model.RendezVous.StatutRendezVous;
import com.gestionrdv.service.RendezVousService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class RendezVousControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private RendezVousService rendezVousService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser(username = "dr.martin@clinique.fr", roles = {"MEDECIN"})
    @DisplayName("PATCH /api/rendez-vous/{id}/confirmer - Doit confirmer un rendez-vous (200 OK)")
    void testConfirmerRdv() throws Exception {
        RendezVousDTO rdvConfirme = RendezVousDTO.builder()
            .id(1L)
            .patientId(1L)
            .statut(StatutRendezVous.CONFIRME)
            .statutCouleur("#4CAF50")
            .build();

        when(rendezVousService.confirmerRendezVous(1L)).thenReturn(rdvConfirme);

        mockMvc.perform(patch("/api/rendez-vous/1/confirmer")
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.statut").value("CONFIRME"))
            .andExpect(jsonPath("$.statutCouleur").value("#4CAF50"));
    }

    @Test
    @WithMockUser(username = "dr.martin@clinique.fr", roles = {"MEDECIN"})
    @DisplayName("PATCH /api/rendez-vous/{id}/annuler - Doit annuler un rendez-vous (200 OK)")
    void testAnnulerRdv() throws Exception {
        RendezVousDTO rdvAnnule = RendezVousDTO.builder()
            .id(1L)
            .patientId(1L)
            .statut(StatutRendezVous.ANNULE)
            .statutCouleur("#F44336")
            .motifAnnulation("Empêchement")
            .build();

        when(rendezVousService.annulerRendezVous(eq(1L), eq("Empêchement"))).thenReturn(rdvAnnule);

        mockMvc.perform(patch("/api/rendez-vous/1/annuler")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("motif", "Empêchement"))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.statut").value("ANNULE"))
            .andExpect(jsonPath("$.motifAnnulation").value("Empêchement"));
    }
}
