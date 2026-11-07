-- ========================================================
-- SCHEMA DDL - GESTION DES RENDEZ-VOUS MEDICAUX
-- Compatible MySQL 8.0+ / PostgreSQL / H2
-- ========================================================

-- Table des utilisateurs (médecins & personnel médical)
CREATE TABLE IF NOT EXISTS utilisateurs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    prenom VARCHAR(100) NOT NULL,
    nom VARCHAR(100) NOT NULL,
    email VARCHAR(191) NOT NULL UNIQUE,
    mot_de_passe VARCHAR(255) NOT NULL,
    specialite VARCHAR(150),
    numero_rpps VARCHAR(50) UNIQUE,
    telephone VARCHAR(30),
    actif BOOLEAN NOT NULL DEFAULT TRUE,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    derniere_connexion TIMESTAMP NULL,
    INDEX idx_user_email (email)
);

-- Table des rôles des utilisateurs
CREATE TABLE IF NOT EXISTS utilisateur_roles (
    utilisateur_id BIGINT NOT NULL,
    role VARCHAR(50) NOT NULL,
    PRIMARY KEY (utilisateur_id, role),
    CONSTRAINT fk_user_roles_user FOREIGN KEY (utilisateur_id) 
        REFERENCES utilisateurs(id) ON DELETE CASCADE
);

-- Table des patients
CREATE TABLE IF NOT EXISTS patients (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    prenom VARCHAR(100) NOT NULL,
    nom VARCHAR(100) NOT NULL,
    email VARCHAR(191) NOT NULL UNIQUE,
    telephone VARCHAR(30),
    date_naissance VARCHAR(20),
    sexe VARCHAR(20),
    adresse VARCHAR(500),
    numero_securite_sociale VARCHAR(50) UNIQUE,
    groupe_sanguin VARCHAR(10),
    allergies VARCHAR(1000),
    antecedents_medicaux VARCHAR(2000),
    medecin_traitant VARCHAR(150),
    actif BOOLEAN NOT NULL DEFAULT TRUE,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_patient_nom_prenom (nom, prenom),
    INDEX idx_patient_email (email)
);

-- Table des rendez-vous médicaux
CREATE TABLE IF NOT EXISTS rendez_vous (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    date_heure_debut TIMESTAMP NOT NULL,
    date_heure_fin TIMESTAMP NOT NULL,
    motif VARCHAR(500) NOT NULL,
    statut VARCHAR(30) NOT NULL DEFAULT 'EN_ATTENTE',
    type_consultation VARCHAR(50) DEFAULT 'CONSULTATION_GENERALE',
    notes_medecin VARCHAR(3000),
    ordonnance VARCHAR(5000),
    diagnostic VARCHAR(2000),
    rappel_envoye BOOLEAN DEFAULT FALSE,
    motif_annulation VARCHAR(500),
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_rdv_patient FOREIGN KEY (patient_id) 
        REFERENCES patients(id) ON DELETE RESTRICT,
    INDEX idx_rdv_patient_id (patient_id),
    INDEX idx_rdv_debut (date_heure_debut),
    INDEX idx_rdv_statut (statut)
);

