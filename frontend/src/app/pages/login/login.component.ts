import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

/**
 * Page de connexion avec email/mot de passe.
 * Utilise BCrypt côté serveur pour la vérification.
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <!-- Panneau gauche - Branding -->
      <div class="auth-left">
        <div class="branding">
          <span class="material-icons brand-icon">local_hospital</span>
          <h1 class="brand-title">MédiRDV</h1>
          <p class="brand-subtitle">Système de gestion des rendez-vous médicaux</p>
        </div>
        <div class="features">
          <div class="feature">
            <span class="material-icons">calendar_today</span>
            <span>Planification intelligente</span>
          </div>
          <div class="feature">
            <span class="material-icons">people</span>
            <span>Gestion des patients</span>
          </div>
          <div class="feature">
            <span class="material-icons">bar_chart</span>
            <span>Statistiques et suivi</span>
          </div>
          <div class="feature">
            <span class="material-icons">security</span>
            <span>Accès sécurisé</span>
          </div>
        </div>
      </div>

      <!-- Panneau droit - Formulaire -->
      <div class="auth-right">
        <div class="auth-card">
          <div class="auth-header">
            <h2>Connexion</h2>
            <p>Accédez à votre espace médecin</p>
          </div>

          <!-- Alerte d'erreur -->
          <div class="alert alert-error" *ngIf="errorMessage">
            <span class="material-icons">error_outline</span>
            {{ errorMessage }}
          </div>

          <!-- Formulaire de connexion -->
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" novalidate>
            <div class="form-group">
              <label class="form-label" for="email">Adresse e-mail</label>
              <input
                id="email"
                type="email"
                class="form-control"
                formControlName="email"
                placeholder="dr.nom@clinique.fr"
                autocomplete="email"
              >
              <div class="form-error" *ngIf="f['email'].invalid && f['email'].touched">
                {{ f['email'].errors?.['required'] ? 'Email obligatoire' : 'Email invalide' }}
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="password">Mot de passe</label>
              <div class="input-group">
                <input
                  id="password"
                  [type]="showPassword ? 'text' : 'password'"
                  class="form-control"
                  formControlName="motDePasse"
                  placeholder="••••••••"
                  autocomplete="current-password"
                >
                <button type="button" class="input-addon" (click)="showPassword = !showPassword">
                  <span class="material-icons">{{ showPassword ? 'visibility_off' : 'visibility' }}</span>
                </button>
              </div>
              <div class="form-error" *ngIf="f['motDePasse'].invalid && f['motDePasse'].touched">
                Mot de passe obligatoire
              </div>
            </div>

            <button
              type="submit"
              class="btn btn-primary w-full btn-login"
              [disabled]="loading || loginForm.invalid"
            >
              <span class="spinner-sm" *ngIf="loading"></span>
              <span class="material-icons" *ngIf="!loading">login</span>
              {{ loading ? 'Connexion...' : 'Se connecter' }}
            </button>
          </form>

          <!-- Compte de démo -->
          <div class="demo-info">
            <p class="demo-title">Compte de démonstration :</p>
            <p><strong>Email :</strong> dr.martin&#64;clinique.fr</p>
            <p><strong>Mot de passe :</strong> Medecin2024!</p>
            <button class="btn btn-secondary btn-sm mt-4 w-full" (click)="fillDemo()">
              Remplir avec le compte démo
            </button>
          </div>

          <p class="auth-link">
            Pas encore de compte ?
            <a routerLink="/register">S'inscrire</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh;
      display: flex;
    }

    /* Panneau gauche */
    .auth-left {
      flex: 1;
      background: linear-gradient(135deg, #1E40AF 0%, #1D4ED8 50%, #2563EB 100%);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 48px;
      color: white;
    }

    .branding { text-align: center; margin-bottom: 48px; }

    .brand-icon {
      font-size: 64px;
      display: block;
      margin-bottom: 16px;
      opacity: 0.9;
    }

    .brand-title {
      font-size: 40px;
      font-weight: 800;
      letter-spacing: -1px;
      margin-bottom: 8px;
    }

    .brand-subtitle {
      font-size: 16px;
      opacity: 0.8;
      max-width: 300px;
    }

    .features { display: flex; flex-direction: column; gap: 16px; }

    .feature {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 15px;
      opacity: 0.9;

      .material-icons {
        font-size: 20px;
        background: rgba(255,255,255,0.15);
        padding: 8px;
        border-radius: 8px;
      }
    }

    /* Panneau droit */
    .auth-right {
      width: 480px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 32px;
      background: #F8FAFC;
    }

    .auth-card {
      background: white;
      border-radius: 16px;
      padding: 40px;
      width: 100%;
      box-shadow: 0 10px 25px rgba(0,0,0,0.08);
    }

    .auth-header {
      margin-bottom: 28px;
      h2 { font-size: 24px; font-weight: 700; color: #1E293B; }
      p { color: #64748B; margin-top: 4px; font-size: 14px; }
    }

    .input-group {
      position: relative;
      display: flex;

      .form-control { padding-right: 44px; }
    }

    .input-addon {
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
      color: #94A3B8;
      padding: 4px;
      &:hover { color: #2563EB; }
    }

    .btn-login {
      height: 48px;
      font-size: 15px;
      justify-content: center;
      margin-top: 8px;
    }

    .spinner-sm {
      width: 18px;
      height: 18px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      display: inline-block;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    .demo-info {
      margin-top: 24px;
      padding: 16px;
      background: #EFF6FF;
      border-radius: 8px;
      border: 1px solid #BFDBFE;
      font-size: 13px;
      color: #1E40AF;

      .demo-title { font-weight: 600; margin-bottom: 6px; }
    }

    .auth-link {
      text-align: center;
      margin-top: 20px;
      font-size: 14px;
      color: #64748B;

      a { color: #2563EB; font-weight: 500; text-decoration: none; &:hover { text-decoration: underline; } }
    }

    @media (max-width: 768px) {
      .auth-left { display: none; }
      .auth-right { width: 100%; }
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  errorMessage = '';
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      motDePasse: ['', [Validators.required]]
    });
  }

  get f() { return this.loginForm.controls; }

  fillDemo(): void {
    this.loginForm.patchValue({
      email: 'dr.martin@clinique.fr',
      motDePasse: 'Medecin2024!'
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Email ou mot de passe incorrect';
      }
    });
  }
}

