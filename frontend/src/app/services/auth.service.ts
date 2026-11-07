import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthUser, LoginRequest, RegisterRequest } from '../models/models';
import { environment } from '../../environments/environment';

/**
 * Service d'authentification.
 * Gère la connexion, l'inscription, et le stockage du token JWT.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API_URL = `${environment.apiUrl}/auth`;
  private readonly TOKEN_KEY = 'rdv_auth_token';
  private readonly USER_KEY = 'rdv_auth_user';

  constructor(private http: HttpClient) {}

  /**
   * Connecte un médecin et stocke le token JWT + infos utilisateur.
   */
  login(request: LoginRequest): Observable<AuthUser> {
    return this.http.post<AuthUser>(`${this.API_URL}/login`, request).pipe(
      tap(response => {
        localStorage.setItem(this.TOKEN_KEY, response.token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(response));
      })
    );
  }

  /**
   * Inscrit un nouveau médecin.
   */
  register(request: RegisterRequest): Observable<AuthUser> {
    return this.http.post<AuthUser>(`${this.API_URL}/register`, request).pipe(
      tap(response => {
        localStorage.setItem(this.TOKEN_KEY, response.token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(response));
      })
    );
  }

  /**
   * Déconnecte l'utilisateur (supprime le token).
   */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  /**
   * Retourne le token JWT stocké.
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Retourne l'utilisateur connecté.
   */
  getCurrentUser(): AuthUser | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Vérifie si l'utilisateur est connecté.
   */
  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }
}

