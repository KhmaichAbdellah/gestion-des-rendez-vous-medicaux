package com.gestionrdv.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration Swagger / OpenAPI 3.0 pour l'API REST de gestion des rendez-vous médicaux.
 * Intègre le support de l'authentification Bearer JWT dans l'interface interactive Swagger UI.
 */
@Configuration
public class OpenApiConfig {

    private static final String SECURITY_SCHEME_NAME = "Bearer Authentication";

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
            .addSecurityItem(new SecurityRequirement().addList(SECURITY_SCHEME_NAME))
            .components(new Components().addSecuritySchemes(
                SECURITY_SCHEME_NAME,
                new SecurityScheme()
                    .name(SECURITY_SCHEME_NAME)
                    .type(SecurityScheme.Type.HTTP)
                    .scheme("bearer")
                    .bearerFormat("JWT")
                    .description("Entrez le token JWT obtenu après authentification (/api/auth/login)")
            ))
            .info(new Info()
                .title("API REST - Gestion des Rendez-Vous Médicaux")
                .description("API complète pour la gestion des consultations, fiches patients, agenda médical et authentification médecin.")
                .version("1.0.0")
                .contact(new Contact()
                    .name("Support Technique Cabinet Médical")
                    .email("support@gestion-rdv.com")
                    .url("https://gestion-rdv.com"))
                .license(new License()
                    .name("Propriétaire / Confidentiel")
                    .url("https://gestion-rdv.com/license")));
    }
}
