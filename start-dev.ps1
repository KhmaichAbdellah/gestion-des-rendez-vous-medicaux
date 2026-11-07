# ========================================================
# MédiRDV - Lanceur PowerShell
# ========================================================

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  🏥 MédiRDV - Gestion des Rendez-Vous Médicaux" -ForegroundColor White
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

# Vérification du port 8080
$port8080 = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue
if ($port8080) {
    Write-Warning "Le port 8080 est déjà utilisé par un processus (PID: $($port8080.OwningProcess[0]))."
    $kill = Read-Host "Souhaitez-vous arrêter ce processus pour libérer le port ? (o/n)"
    if ($kill -eq "o" -or $kill -eq "O") {
        Stop-Process -Id $port8080.OwningProcess -Force -ErrorAction SilentlyContinue
        Write-Host "Port 8080 libéré !" -ForegroundColor Green
    }
}

Write-Host "[1/2] Démarrage du Backend Spring Boot (Port 8080)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; mvn spring-boot:run"

Write-Host "[2/2] Démarrage du Frontend Angular (Port 4200)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm start"

Write-Host ""
Write-Host "========================================================" -ForegroundColor Green
Write-Host "  ✅ Services démarrés avec succès !" -ForegroundColor Green
Write-Host "  - Frontend Angular : http://localhost:4200" -ForegroundColor White
Write-Host "  - Backend API REST : http://localhost:8080/api" -ForegroundColor White
Write-Host "  - Console H2       : http://localhost:8080/h2-console" -ForegroundColor White
Write-Host ""
Write-Host "  Identifiants : dr.martin@clinique.fr / Medecin2024!" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Green

