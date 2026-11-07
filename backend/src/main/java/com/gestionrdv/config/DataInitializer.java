package com.gestionrdv.config;

import com.gestionrdv.model.RendezVous;
import com.gestionrdv.model.Utilisateur;
import com.gestionrdv.model.Patient;
import com.gestionrdv.repository.PatientRepository;
import com.gestionrdv.repository.RendezVousRepository;
import com.gestionrdv.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;

/**
 * Initialisation des données de démonstration au démarrage.
 * Crée un médecin par défaut et des patients/rendez-vous de test.
 */
@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataInitializer {

    private final PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner initData(
        UtilisateurRepository utilisateurRepo,
        PatientRepository patientRepo,
        RendezVousRepository rdvRepo
    ) {
        return args -> {
            log.info("=== Initialisation des données de démonstration ===");

            // Création du médecin par défaut
            if (!utilisateurRepo.existsByEmail("dr.martin@clinique.fr")) {
                Utilisateur medecin = Utilisateur.builder()
                    .prenom("Sophie")
                    .nom("Martin")
                    .email("dr.martin@clinique.fr")
                    .motDePasse(passwordEncoder.encode("Medecin2024!"))
                    .specialite("Médecine Générale")
                    .numeroRpps("10001234567")
                    .telephone("01 23 45 67 89")
                    .actif(true)
                    .build();
                utilisateurRepo.save(medecin);
                log.info("✅ Médecin créé: dr.martin@clinique.fr / Medecin2024!");
            }

            // Création de patients de démonstration
            if (patientRepo.count() == 0) {
                Patient p1 = patientRepo.save(Patient.builder()
                    .prenom("Jean").nom("Dupont")
                    .email("jean.dupont@email.fr")
                    .telephone("06 10 20 30 40")
                    .dateNaissance("1975-03-15")
                    .sexe(Patient.Sexe.MASCULIN)
                    .groupeSanguin("A+")
                    .allergies("Pénicilline")
                    .actif(true).build());

                Patient p2 = patientRepo.save(Patient.builder()
                    .prenom("Marie").nom("Dubois")
                    .email("marie.dubois@email.fr")
                    .telephone("06 50 60 70 80")
                    .dateNaissance("1990-07-22")
                    .sexe(Patient.Sexe.FEMININ)
                    .groupeSanguin("O-")
                    .actif(true).build());

                Patient p3 = patientRepo.save(Patient.builder()
                    .prenom("Pierre").nom("Bernard")
                    .email("pierre.bernard@email.fr")
                    .telephone("06 11 22 33 44")
                    .dateNaissance("1965-11-08")
                    .sexe(Patient.Sexe.MASCULIN)
                    .groupeSanguin("B+")
                    .antecedentsMedicaux("Hypertension, Diabète type 2")
                    .actif(true).build());

                Patient p4 = patientRepo.save(Patient.builder()
                    .prenom("Isabelle").nom("Moreau")
                    .email("isabelle.moreau@email.fr")
                    .telephone("06 99 88 77 66")
                    .dateNaissance("1982-05-30")
                    .sexe(Patient.Sexe.FEMININ)
                    .groupeSanguin("AB+")
                    .actif(true).build());

                // Création de rendez-vous de démonstration
                LocalDateTime maintenant = LocalDateTime.now();

                rdvRepo.save(RendezVous.builder()
                    .patient(p1)
                    .dateHeureDebut(maintenant.withHour(9).withMinute(0).withSecond(0))
                    .dateHeureFin(maintenant.withHour(9).withMinute(30).withSecond(0))
                    .motif("Consultation de suivi - tension artérielle")
                    .statut(RendezVous.StatutRendezVous.CONFIRME)
                    .typeConsultation(RendezVous.TypeConsultation.SUIVI)
                    .build());

                rdvRepo.save(RendezVous.builder()
                    .patient(p2)
                    .dateHeureDebut(maintenant.withHour(10).withMinute(0).withSecond(0))
                    .dateHeureFin(maintenant.withHour(10).withMinute(30).withSecond(0))
                    .motif("Première consultation")
                    .statut(RendezVous.StatutRendezVous.EN_ATTENTE)
                    .typeConsultation(RendezVous.TypeConsultation.CONSULTATION_GENERALE)
                    .build());

                rdvRepo.save(RendezVous.builder()
                    .patient(p3)
                    .dateHeureDebut(maintenant.plusDays(1).withHour(14).withMinute(0).withSecond(0))
                    .dateHeureFin(maintenant.plusDays(1).withHour(14).withMinute(30).withSecond(0))
                    .motif("Bilan annuel diabète")
                    .statut(RendezVous.StatutRendezVous.CONFIRME)
                    .typeConsultation(RendezVous.TypeConsultation.BILAN)
                    .build());

                rdvRepo.save(RendezVous.builder()
                    .patient(p4)
                    .dateHeureDebut(maintenant.minusDays(2).withHour(11).withMinute(0).withSecond(0))
                    .dateHeureFin(maintenant.minusDays(2).withHour(11).withMinute(30).withSecond(0))
                    .motif("Vaccination grippe saisonnière")
                    .statut(RendezVous.StatutRendezVous.ANNULE)
                    .typeConsultation(RendezVous.TypeConsultation.VACCINATION)
                    .motifAnnulation("Patient indisponible")
                    .build());

                rdvRepo.save(RendezVous.builder()
                    .patient(p1)
                    .dateHeureDebut(maintenant.plusDays(3).withHour(15).withMinute(0).withSecond(0))
                    .dateHeureFin(maintenant.plusDays(3).withHour(15).withMinute(30).withSecond(0))
                    .motif("Résultats analyse de sang")
                    .statut(RendezVous.StatutRendezVous.EN_ATTENTE)
                    .typeConsultation(RendezVous.TypeConsultation.SUIVI)
                    .build());

                log.info("✅ {} patients et {} rendez-vous créés",
                    patientRepo.count(), rdvRepo.count());
            }

            log.info("=== Données de démonstration initialisées ===");
            log.info("🔑 Connexion: dr.martin@clinique.fr / Medecin2024!");
        };
    }
}

