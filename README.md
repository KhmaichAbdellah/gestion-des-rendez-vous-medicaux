# 🏥 MédiRDV - Application de Gestion des Rendez-Vous Médicaux

Application web complète permettant aux médecins de planifier, organiser et suivre leurs consultations au quotidien.

---

## 📋 Table des Matières

- [Fonctionnalités](#-fonctionnalités)
- [Architecture & Technologies](#-architecture--technologies)
- [Codes Couleurs du Calendrier](#-codes-couleurs-du-calendrier)
- [Sécurité & Authentification](#-sécurité--authentification)
- [Structure du Projet](#-structure-du-projet)
- [Installation & Démarrage](#-installation--démarrage)
- [Endpoints API REST](#-endpoints-api-rest)
- [Historique des Commits Git](#-historique-des-commits-git)

---

## ✨ Fonctionnalités

### 👨‍⚕️ Espace Médecin
- **Tableau de bord :** KPIs en temps réel (patients actifs, RDV du jour, RDV de la semaine, total), répartition par statut, agenda de la journée.
- **Authentification sécurisée :** Connexion e-mail / mot de passe, chiffrement **BCrypt** (12 rounds) et tokens **JWT**.
- **Inscription :** Formulaire dédié avec spécialité et numéro RPPS.

### 📅 Gestion des Rendez-Vous (CRUD complet)
- **Création :** Sélection du patient, plage horaire, motif, type de consultation.
- **Détection des conflits :** Vérification automatique des chevauchements de créneaux.
- **Modification :** Ajustement des horaires, du motif ou des notes médicales.
- **Actions de statut :** Confirmer (vert), Annuler avec motif (rouge), Terminer avec diagnostic et ordonnance (gris).
- **Filtrage multicritères :** Par date, par statut (En attente, Confirmé, Annulé, Terminé) et par patient.

### 📆 Vue Calendrier Interactive
- **Affichage mensuel** avec navigation fluide (mois précédent, suivant, aujourd'hui).
- **Suivi visuel par code couleur :**
  - 🟢 **Vert (`#4CAF50`)** : Rendez-vous **Confirmé**
  - 🟡 **Jaune (`#FFC107`)** : Rendez-vous **En attente**
  - 🔴 **Rouge (`#F44336`)** : Rendez-vous **Annulé**
  - ⚪ **Gris (`#9E9E9E`)** : Rendez-vous **Terminé**
- Clic sur un jour pour ajouter directement un rendez-vous à 9h.
- Clic sur un événement pour afficher le panneau de détails avec actions rapides.

### 👥 Fiches Patients
- **CRUD complet :** Nom, prénom, contact, date de naissance, groupe sanguin, allergies, antécédents médicaux.
- **Recherche temps réel :** Par nom, prénom ou email.
- **Historique complet :** Consultation de tous les rendez-vous passés et à venir par patient.
- **Soft delete :** Préservation de l'intégrité référentielle médicale.

---

## 🛠️ Architecture & Technologies

### Backend (Spring Boot 3.2 / Java 17)
- **Architecture en couches :**
  - `Controller` : Endpoints REST exposés avec validation des entrées (`@Valid`).
  - `Service` : Logique métier transactionnelle (`@Transactional`), détection des conflits.
  - `Repository` : Couche d'accès aux données Spring Data JPA / Hibernate avec requêtes JPQL optimisées.
  - `Model / DTO` : Entités JPA avec mapping DTO pour isoler le modèle de la couche API.
  - `Security` : Spring Security 6, JWT (io.jsonwebtoken), `BCryptPasswordEncoder(12)`.
- **Persistance :**
  - H2 Database en mémoire (développement rapide, console sur `/h2-console`).
  - Compatible MySQL / PostgreSQL en modifiant `application.properties`.

### Frontend (Angular 17 / TypeScript)
- **Standalone Components** (nouvelle architecture Angular).
- **Architecture modulaire :**
  - `pages/` : Dashboard, Calendrier, Rendez-vous, Patients, Login, Register.
  - `services/` : Client HTTP typé avec RxJS.
  - `interceptors/` : Injection automatique du token Bearer JWT (`AuthInterceptor`).
  - `guards/` : Protection des routes (`authGuard`).
  - `layout/` : Barre latérale rétractable avec légende des statuts et profil médecin.
- **Style :** SCSS moderne avec variables CSS, responsive design, icônes Material Design.

---

## 🎨 Codes Couleurs du Calendrier

| Statut | Couleur Hex | Badge CSS | Signification |
| :--- | :---: | :---: | :--- |
| **Confirmé** | `#4CAF50` | 🟢 Vert | Consultation validée par le médecin |
| **En attente** | `#FFC107` | 🟡 Jaune | En attente de confirmation |
| **Annulé** | `#F44336` | 🔴 Rouge | Consultation annulée (motif précisé) |
| **Terminé** | `#9E9E9E` | ⚪ Gris | Consultation effectuée avec compte-rendu |

---

## 🔒 Sécurité & Authentification

- **Hachage des mots de passe :** BCrypt avec facteur de coût 12.
- **Tokens JWT :** Signés en HMAC-SHA256 avec clé secrète configurable, validité 24h.
- **Stateless :** Aucune session côté serveur (`SessionCreationPolicy.STATELESS`).
- **CORS :** Configuré pour autoriser uniquement l'origine front-end (`http://localhost:4200`).
- **Validation stricte :** Validation des DTOs via Bean Validation (Hibernate Validator).

---

## 📁 Structure du Projet

```
gestion-des-rendez-vous-médicaux/
├── backend/
│   ├── pom.xml
│   └── src/
│       └── main/
│           ├── java/com/gestionrdv/
│           │   ├── GestionRdvApplication.java
│           │   ├── config/
│           │   │   └── DataInitializer.java        # Données de démo au démarrage
│           │   ├── controller/
│           │   │   ├── AuthController.java         # /api/auth/**
│           │   │   ├── DashboardController.java    # /api/dashboard/**
│           │   │   ├── PatientController.java      # /api/patients/**
│           │   │   └── RendezVousController.java   # /api/rendez-vous/**
│           │   ├── dto/
│           │   │   ├── AuthResponse.java
│           │   │   ├── LoginRequest.java
│           │   │   ├── PatientDTO.java
│           │   │   ├── RegisterRequest.java
│           │   │   ├── RendezVousDTO.java
│           │   │   └── StatistiquesDTO.java
│           │   ├── exception/
│           │   │   └── GlobalExceptionHandler.java # Gestion uniforme des erreurs
│           │   ├── model/
│           │   │   ├── Patient.java
│           │   │   ├── RendezVous.java
│           │   │   └── Utilisateur.java
│           │   ├── repository/
│           │   │   ├── PatientRepository.java
│           │   │   ├── RendezVousRepository.java
│           │   │   └── UtilisateurRepository.java
│           │   ├── security/
│           │   │   ├── JwtAuthFilter.java
│           │   │   ├── JwtService.java
│           │   │   └── SecurityConfig.java
│           │   └── service/
│           │       ├── AuthService.java
│           │       ├── PatientService.java
│           │       └── RendezVousService.java
│           └── resources/
│               └── application.properties
│
├── frontend/
│   ├── angular.json
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.app.json
│   └── src/
│       ├── index.html
│       ├── main.ts
│       ├── styles.scss
│       ├── environments/
│       │   ├── environment.ts
│       │   └── environment.prod.ts
│       └── app/
│           ├── app.component.ts
│           ├── app.config.ts
│           ├── app.routes.ts
│           ├── guards/
│           │   └── auth.guard.ts
│           ├── interceptors/
│           │   └── auth.interceptor.ts
│           ├── layout/
│           │   └── layout.component.ts
│           ├── models/
│           │   └── models.ts
│           ├── pages/
│           │   ├── calendrier/
│           │   │   └── calendrier.component.ts
│           │   ├── dashboard/
│           │   │   └── dashboard.component.ts
│           │   ├── login/
│           │   │   └── login.component.ts
│           │   ├── patients/
│           │   │   ├── patient-detail.component.ts
│           │   │   └── patients-liste.component.ts
│           │   ├── register/
│           │   │   └── register.component.ts
│           │   └── rendez-vous/
│           │       └── rendez-vous-liste.component.ts
│           └── services/
│               ├── auth.service.ts
│               ├── patient.service.ts
│               └── rendez-vous.service.ts
└── README.md
```

---

## 🚀 Installation & Démarrage

### Prérequis
- Java 17+
- Maven 3.8+
- Node.js 18+ & npm

### 1. Démarrer le Backend
```bash
cd backend
mvn spring-boot:run
```
> Le backend démarre sur `http://localhost:8080`.  
> Console H2 disponible sur `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:gestionrdvdb`, user: `sa`, pas de mot de passe).

### 2. Démarrer le Frontend
```bash
cd frontend
npm install
npm start
```
> L'application est accessible sur `http://localhost:4200`.

### 3. Compte de Démonstration (automatiquement préchargé)
- **Email :** `dr.martin@clinique.fr`
- **Mot de passe :** `Medecin2024!`
- Un bouton *"Remplir avec le compte démo"* est directement disponible sur la page de connexion.

---

## 📡 Endpoints API REST

### Authentification (`/api/auth`)
| Méthode | Endpoint | Description | Public |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/login` | Connexion médecin (retourne JWT) | ✅ |
| `POST` | `/api/auth/register` | Inscription nouveau médecin | ✅ |

### Patients (`/api/patients`)
| Méthode | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/patients` | Liste de tous les patients actifs |
| `GET` | `/api/patients/{id}` | Détail d'un patient |
| `POST` | `/api/patients` | Création d'un patient |
| `PUT` | `/api/patients/{id}` | Modification d'un patient |
| `DELETE`| `/api/patients/{id}` | Désactivation (soft delete) |
| `GET` | `/api/patients/recherche?terme=` | Recherche par nom/prénom/email |
| `GET` | `/api/patients/count` | Nombre total de patients actifs |

### Rendez-Vous (`/api/rendez-vous`)
| Méthode | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/rendez-vous` | Liste avec filtres optionnels (`?statut=&debut=&fin=&patientId=`) |
| `GET` | `/api/rendez-vous/{id}` | Détail d'un rendez-vous |
| `POST` | `/api/rendez-vous` | Création (vérification automatique des conflits) |
| `PUT` | `/api/rendez-vous/{id}` | Modification d'un rendez-vous |
| `DELETE`| `/api/rendez-vous/{id}` | Suppression définitive |
| `PATCH` | `/api/rendez-vous/{id}/confirmer`| Confirmation (statut → `CONFIRME`) |
| `PATCH` | `/api/rendez-vous/{id}/annuler` | Annulation avec motif (statut → `ANNULE`) |
| `PATCH` | `/api/rendez-vous/{id}/terminer`| Clôture avec notes, ordonnance et diagnostic |
| `GET` | `/api/rendez-vous/aujourd-hui` | RDV du jour |
| `GET` | `/api/rendez-vous/patient/{id}` | Historique complet d'un patient |
| `GET` | `/api/rendez-vous/calendrier` | RDV dans une plage de dates pour la vue calendrier |
| `GET` | `/api/rendez-vous/statistiques` | KPIs et compteurs par statut |

### Dashboard (`/api/dashboard`)
| Méthode | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/dashboard/statistiques` | Statistiques globales agrégées |
| `GET` | `/api/dashboard/aujourd-hui` | Agenda du jour du médecin |
