-- ========================================================
-- DONNEES INITIALES (DML) - SEED DATA
-- Mot de passe haché BCrypt (coût 12) pour "Medecin2024!" :
-- $2a$12$K89s0v58GvKx/mX/Vw6fjeqg8w8lB9yHqZ0Z9VqD0P1u9L4Q8Y5g6
-- ========================================================

-- Insertion du Médecin Dr Sophie Martin
MERGE INTO utilisateurs (id, prenom, nom, email, mot_de_passe, specialite, numero_rpps, telephone, actif, date_creation)
KEY (email)
VALUES (
    1,
    'Sophie',
    'Martin',
    'dr.martin@clinique.fr',
    '$2a$12$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a',
    'Médecine Générale',
    '10001234567',
    '01 23 45 67 89',
    TRUE,
    CURRENT_TIMESTAMP
);

-- Insertion des rôles
MERGE INTO utilisateur_roles (utilisateur_id, role)
KEY (utilisateur_id, role)
VALUES (1, 'ROLE_MEDECIN');

-- Insertion de patients types
MERGE INTO patients (id, prenom, nom, email, telephone, date_naissance, sexe, adresse, groupe_sanguin, allergies, actif, date_creation)
KEY (email)
VALUES (
    1,
    'Jean',
    'Dupont',
    'jean.dupont@email.fr',
    '06 10 20 30 40',
    '1975-03-15',
    'MASCULIN',
    '12 Rue Victor Hugo, 75001 Paris',
    'A+',
    'Pénicilline',
    TRUE,
    CURRENT_TIMESTAMP
);

MERGE INTO patients (id, prenom, nom, email, telephone, date_naissance, sexe, adresse, groupe_sanguin, actif, date_creation)
KEY (email)
VALUES (
    2,
    'Marie',
    'Dubois',
    'marie.dubois@email.fr',
    '06 50 60 70 80',
    '1990-07-22',
    'FEMININ',
    '45 Avenue des Champs-Élysées, 75008 Paris',
    'O-',
    TRUE,
    CURRENT_TIMESTAMP
);

MERGE INTO patients (id, prenom, nom, email, telephone, date_naissance, sexe, adresse, groupe_sanguin, antecedents_medicaux, actif, date_creation)
KEY (email)
VALUES (
    3,
    'Pierre',
    'Bernard',
    'pierre.bernard@email.fr',
    '06 11 22 33 44',
    '1965-11-08',
    'MASCULIN',
    '8 Boulevard Haussmann, 75009 Paris',
    'B+',
    'Hypertension artérielle, Diabète type 2',
    TRUE,
    CURRENT_TIMESTAMP
);

MERGE INTO patients (id, prenom, nom, email, telephone, date_naissance, sexe, adresse, groupe_sanguin, actif, date_creation)
KEY (email)
VALUES (
    4,
    'Isabelle',
    'Moreau',
    'isabelle.moreau@email.fr',
    '06 99 88 77 66',
    '1982-05-30',
    'FEMININ',
    '3 Rue de la République, 69001 Lyon',
    'AB+',
    TRUE,
    CURRENT_TIMESTAMP
);
