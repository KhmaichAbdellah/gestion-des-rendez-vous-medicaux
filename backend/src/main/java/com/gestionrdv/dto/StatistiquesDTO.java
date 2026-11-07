package com.gestionrdv.dto;

import com.gestionrdv.model.RendezVous.StatutRendezVous;
import lombok.*;
import java.util.Map;

/**
 * DTO pour les statistiques du tableau de bord.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StatistiquesDTO {

    private long totalPatients;
    private long totalRendezVous;
    private long rdvAujourdhui;
    private long rdvCetteSemaine;
    private long rdvConfirmes;
    private long rdvEnAttente;
    private long rdvAnnules;
    private long rdvTermines;
    private Map<StatutRendezVous, Long> repartitionParStatut;
    private long prochains7Jours;
}
