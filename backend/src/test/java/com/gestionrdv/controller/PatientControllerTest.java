package com.gestionrdv.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gestionrdv.dto.PatientDTO;
import com.gestionrdv.security.JwtService;
import com.gestionrdv.service.PatientService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class PatientControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PatientService patientService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser(username = "dr.martin@clinique.fr", roles = {"MEDECIN"})
    @DisplayName("GET /api/patients - Doit retourner la liste des patients (200 OK)")
    void testGetTousLesPatients() throws Exception {
        PatientDTO patient = PatientDTO.builder()
            .id(1L)
            .prenom("Jean")
            .nom("Dupont")
            .email("jean.dupont@email.fr")
            .build();

        when(patientService.getTousLesPatients()).thenReturn(List.of(patient));

        mockMvc.perform(get("/api/patients")
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].nom").value("Dupont"))
            .andExpect(jsonPath("$[0].prenom").value("Jean"));
    }

    @Test
    @WithMockUser(username = "dr.martin@clinique.fr", roles = {"MEDECIN"})
    @DisplayName("POST /api/patients - Doit créer un nouveau patient (201 CREATED)")
    void testCreerPatient() throws Exception {
        PatientDTO request = PatientDTO.builder()
            .prenom("Marie")
            .nom("Dubois")
            .email("marie.dubois@email.fr")
            .build();

        PatientDTO created = PatientDTO.builder()
            .id(2L)
            .prenom("Marie")
            .nom("Dubois")
            .email("marie.dubois@email.fr")
            .build();

        when(patientService.creerPatient(any(PatientDTO.class))).thenReturn(created);

        mockMvc.perform(post("/api/patients")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").value(2))
            .andExpect(jsonPath("$.nom").value("Dubois"));
    }

    @Test
    @DisplayName("GET /api/patients sans authentification doit renvoyer 403 Forbidden")
    void testAccesSansAuthInterdit() throws Exception {
        mockMvc.perform(get("/api/patients"))
            .andExpect(status().isForbidden());
    }
}
