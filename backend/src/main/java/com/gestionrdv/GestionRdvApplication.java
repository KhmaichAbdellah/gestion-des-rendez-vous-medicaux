package com.gestionrdv;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Point d'entrée principal de l'application Gestion des Rendez-Vous Médicaux.
 * Cette application fournit une API REST pour la gestion des consultations médicales.
 */
@SpringBootApplication
public class GestionRdvApplication {

    public static void main(String[] args) {
        SpringApplication.run(GestionRdvApplication.class, args);
    }
}
