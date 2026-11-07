import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-left">
        <div class="branding">
          <span class="material-icons brand-icon">local_hospital</span>
          <h1 class="brand-title">MédiRDV</h1>
          <p class="brand-subtitle">Rejoignez la plateforme de gestion médicale</p>
        </div>
      </div>
      <div class="auth-right">
        <div class="auth-card">
          <div class="auth-header">
            <h2>Créer un compte médecin</h2>
            <p>Accès réservé aux professionnels de santé</p>
          </div>

          <div class="alert alert-error" *ngIf="errorMessage">{{ errorMessage }}</div>
          <div class="alert alert-success" *ngIf="successMessage">{{ successMessage }}</div>

          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" novalidate>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Prénom *</label>
                <input type="text" class="form-control" formControlName="prenom" placeholder="Sophie">
                <div class="form-error" *ngIf="f['prenom'].invalid && f['prenom'].touched">Obligatoire</div>
              </div>
              <div class="form-group">
                <label class="form-label">Nom *</label>
                <input type="text" class="form-control" formControlName="nom" placeholder="Martin">
                <div class="form-error" *ngIf="f['nom'].invalid && f['nom'].touched">Obligatoire</div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Email professionnel *</label>
              <input type="email" class="form-control" formControlName="email" placeholder="dr.nom@clinique.fr">
              <div class="form-error" *ngIf="f['email'].invalid && f['email'].touched">Email invalide</div>
            </div>

            <div class="form-group">
              <label class="form-label">Mot de passe *</label>
              <input type="password" class="form-control" formControlName="motDePasse" placeholder="Min. 8 caractères">
              <div class="form-error" *ngIf="f['motDePasse'].invalid && f['motDePasse'].touched">
                Au moins 8 caractères
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Spécialité</label>
                <input type="text" class="form-control" formControlName="specialite" placeholder="Médecine générale">
              </div>
              <div class="form-group">
                <label class="form-label">Numéro RPPS</label>
                <input type="text" class="form-control" formControlName="numeroRpps" placeholder="10001234567">
              </div>
            </div>

            <button type="submit" class="btn btn-primary w-full btn-login" [disabled]="loading || registerForm.invalid">
              <span class="spinner-sm" *ngIf="loading"></span>
              <span class="material-icons" *ngIf="!loading">how_to_reg</span>
              {{ loading ? 'Inscription...' : "S'inscrire" }}
            </button>
          </form>

          <p class="auth-link">
            Déjà un compte ?
            <a routerLink="/login">Se connecter</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page { min-height: 100vh; display: flex; }
    .auth-left {
      flex: 1;
      background: linear-gradient(135deg, #1E40AF 0%, #2563EB 100%);
      display: flex; align-items: center; justify-content: center; padding: 48px; color: white;
    }
    .branding { text-align: center; }
    .brand-icon { font-size: 64px; display: block; margin-bottom: 16px; opacity: 0.9; }
    .brand-title { font-size: 40px; font-weight: 800; letter-spacing: -1px; margin-bottom: 8px; }
    .brand-subtitle { font-size: 16px; opacity: 0.8; }
    .auth-right { width: 520px; display: flex; align-items: center; justify-content: center; padding: 32px; background: #F8FAFC; }
    .auth-card { background: white; border-radius: 16px; padding: 40px; width: 100%; box-shadow: 0 10px 25px rgba(0,0,0,0.08); }
    .auth-header { margin-bottom: 24px; h2 { font-size: 22px; font-weight: 700; } p { color: #64748B; font-size: 13px; margin-top: 4px; } }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .btn-login { height: 48px; font-size: 15px; justify-content: center; margin-top: 8px; }
    .spinner-sm { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; display: inline-block; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .auth-link { text-align: center; margin-top: 20px; font-size: 14px; color: #64748B; a { color: #2563EB; font-weight: 500; text-decoration: none; } }
    @media (max-width: 768px) { .auth-left { display: none; } .auth-right { width: 100%; } .form-row { grid-template-columns: 1fr; } }
  `]
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      prenom: ['', Validators.required],
      nom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      motDePasse: ['', [Validators.required, Validators.minLength(8)]],
      specialite: [''],
      numeroRpps: ['']
    });
  }

  get f() { return this.registerForm.controls; }

  onSubmit(): void {
    if (this.registerForm.invalid) return;
    this.loading = true;
    this.errorMessage = '';
    this.authService.register(this.registerForm.value).subscribe({
      next: () => { this.router.navigate(['/dashboard']); },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Erreur lors de l\'inscription';
      }
    });
  }
}

