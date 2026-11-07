# ==========================================
# DOCKERFILE - ANGULAR FRONTEND
# ==========================================

# Étape 1 : Build de l'application Angular
FROM node:18-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build:prod

# Étape 2 : Serveur HTTP Nginx pour servir les assets statiques
FROM nginx:alpine
COPY --from=builder /app/dist/gestion-rdv-frontend/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
