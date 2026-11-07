@echo off
chcp 65001 >nul
title MédiRDV - Lanceur Applicatif
color 0B

echo ========================================================
echo   🏥 MédiRDV - Gestion des Rendez-Vous Médicaux
echo ========================================================
echo.

REM 1. Démarrage du Backend Spring Boot
echo [1/2] Démarrage du Backend Spring Boot (Port 8080)...
start "MédiRDV - Backend Spring Boot" cmd /k "cd backend && mvn spring-boot:run"

REM 2. Démarrage du Frontend Angular
echo [2/2] Démarrage du Frontend Angular (Port 4200)...
start "MédiRDV - Frontend Angular" cmd /k "cd frontend && npm start"

echo.
echo ========================================================
echo   ✅ Les deux services ont été lancés dans des terminaux dédiés !
echo.
echo   - Backend API REST : http://localhost:8080/api
echo   - Console H2       : http://localhost:8080/h2-console
echo   - Application Web  : http://localhost:4200
echo.
echo   Identifiants démo :
echo   - Email    : dr.martin@clinique.fr
echo   - Password : Medecin2024!
echo ========================================================
echo.
pause

