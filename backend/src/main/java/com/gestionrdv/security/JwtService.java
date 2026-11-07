package com.gestionrdv.security;

import com.gestionrdv.model.Utilisateur;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * Service JWT pour la génération et validation des tokens d'authentification.
 * Utilisé avec Spring Security pour sécuriser les endpoints REST.
 */
@Service
@Slf4j
public class JwtService {

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.expiration}")
    private long jwtExpiration;

    /**
     * Génère un token JWT pour un utilisateur authentifié.
     */
    public String genererToken(Utilisateur utilisateur) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("id", utilisateur.getId());
        claims.put("email", utilisateur.getEmail());
        claims.put("roles", utilisateur.getRoles());
        claims.put("nom", utilisateur.getNomCompletAvecTitre());

        return Jwts.builder()
            .setClaims(claims)
            .setSubject(utilisateur.getEmail())
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + jwtExpiration))
            .signWith(getSigningKey(), SignatureAlgorithm.HS256)
            .compact();
    }

    /**
     * Extrait l'email (subject) d'un token JWT.
     */
    public String extraireEmail(String token) {
        return getClaims(token).getSubject();
    }

    /**
     * Vérifie la validité d'un token JWT.
     */
    public boolean validerToken(String token) {
        try {
            getClaims(token);
            return true;
        } catch (ExpiredJwtException e) {
            log.warn("Token JWT expiré");
        } catch (UnsupportedJwtException e) {
            log.warn("Token JWT non supporté");
        } catch (MalformedJwtException e) {
            log.warn("Token JWT malformé");
        } catch (SecurityException e) {
            log.warn("Signature JWT invalide");
        } catch (IllegalArgumentException e) {
            log.warn("Token JWT vide");
        }
        return false;
    }

    /**
     * Vérifie si le token est expiré.
     */
    public boolean estExpire(String token) {
        try {
            return getClaims(token).getExpiration().before(new Date());
        } catch (ExpiredJwtException e) {
            return true;
        }
    }

    private Claims getClaims(String token) {
        return Jwts.parserBuilder()
            .setSigningKey(getSigningKey())
            .build()
            .parseClaimsJws(token)
            .getBody();
    }

    private Key getSigningKey() {
        byte[] keyBytes = jwtSecret.getBytes();
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
