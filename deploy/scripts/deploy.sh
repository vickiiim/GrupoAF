#!/usr/bin/env bash
# =============================================================================
# Despliegue de la aplicacion "Clinica Medica - TFI 2026 Grupo AF"
#   1. Compila el backend (NestJS) y lo deja corriendo con PM2
#   2. Compila el frontend (Angular) en frontend/dist/frontend/browser
#   3. Instala la configuracion de Nginx y recarga el servicio
#
# Uso:  sudo bash deploy/scripts/deploy.sh
# =============================================================================
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
NGINX_SITE="/etc/nginx/sites-available/clinica"
NGINX_ROOT="${REPO_DIR}/frontend/dist/frontend/browser"

echo "==> Repositorio: ${REPO_DIR}"

# -----------------------------------------------------------------------------
# 1. Backend NestJS + PM2
# -----------------------------------------------------------------------------
echo "==> [1/4] Compilando el backend (NestJS)..."
cd "${REPO_DIR}/backend"
npm ci
npm run build

echo "==> [1/4] Levantando el backend con PM2..."
if pm2 describe grupoaf-backend > /dev/null 2>&1; then
  pm2 restart ecosystem.config.js --env production
else
  pm2 start ecosystem.config.js --env production
fi
pm2 save
pm2 status

# -----------------------------------------------------------------------------
# 2. Frontend Angular
# -----------------------------------------------------------------------------
echo "==> [2/4] Compilando el frontend (Angular)..."
cd "${REPO_DIR}/frontend"
npm ci
npm run build

if [ ! -f "${NGINX_ROOT}/index.html" ]; then
  echo "ERROR: no se encontro ${NGINX_ROOT}/index.html" >&2
  exit 1
fi

# -----------------------------------------------------------------------------
# 3. Nginx
# -----------------------------------------------------------------------------
echo "==> [3/4] Instalando la configuracion de Nginx..."
cp "${REPO_DIR}/deploy/nginx/clinica.conf" "${NGINX_SITE}"
sed -i "s#^[[:space:]]*root .*dist/frontend/browser;#    root ${NGINX_ROOT};#" "${NGINX_SITE}"
ln -sf "${NGINX_SITE}" /etc/nginx/sites-enabled/clinica
rm -f /etc/nginx/sites-enabled/default
nginx -t

# -----------------------------------------------------------------------------
# 4. Reinicio de servicios
# -----------------------------------------------------------------------------
echo "==> [4/4] Recargando Nginx..."
systemctl reload nginx || systemctl restart nginx
systemctl enable nginx
pm2 startup systemd -u "$USER" --hp "$HOME" 2>/dev/null || true

echo ""
echo "================================================================"
echo " Despliegue completado"
echo "   App      : http://localhost/"
echo "   API      : http://localhost/api"
echo "   Swagger  : http://localhost/api/docs"
echo "   PM2      : pm2 status / pm2 logs grupoaf-backend"
echo "================================================================"
