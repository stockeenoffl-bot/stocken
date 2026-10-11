#!/usr/bin/env bash
# Zonal Edge Alice Blue gateway - one-shot installer for Ubuntu 22.04/24.04
# Usage:  sudo bash setup.sh your-domain.com
set -euo pipefail

DOMAIN="${1:-}"
APP_DIR=/opt/zonaledge-gateway

echo "==> Installing Node.js 20 + Caddy"
apt-get update -y
apt-get install -y curl ca-certificates ufw
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
if ! command -v caddy >/dev/null 2>&1; then
  apt-get install -y debian-keyring debian-archive-keyring apt-transport-https curl
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list >/dev/null
  apt-get update -y && apt-get install -y caddy
fi

echo "==> Installing gateway into ${APP_DIR}"
mkdir -p "${APP_DIR}/data"
cp "$(dirname "$0")/server.mjs" "${APP_DIR}/server.mjs"
cp "$(dirname "$0")/zonaledge-gateway.service" /etc/systemd/system/zonaledge-gateway.service
if [ ! -f "${APP_DIR}/.env" ]; then
  cp "$(dirname "$0")/.env.example" "${APP_DIR}/.env"
  echo "!! Edit ${APP_DIR}/.env and fill in Alice Blue + Supabase values, then run:  systemctl restart zonaledge-gateway"
fi

id -u zonaledge >/dev/null 2>&1 || useradd --system --home "${APP_DIR}" --shell /usr/sbin/nologin zonaledge
chown -R zonaledge:zonaledge "${APP_DIR}"

systemctl daemon-reload
systemctl enable --now zonaledge-gateway

echo "==> Firewall: allow SSH + HTTP/HTTPS"
ufw allow OpenSSH || true
ufw allow 80 || true
ufw allow 443 || true
yes | ufw enable || true

if [ -n "${DOMAIN}" ]; then
  echo "==> Caddy HTTPS for ${DOMAIN}"
  printf '%s {\n\treverse_proxy 127.0.0.1:8787\n}\n' "${DOMAIN}" > /etc/caddy/Caddyfile
  systemctl reload caddy
  echo "Gateway will be reachable at https://${DOMAIN}"
else
  echo "!! No domain given. HTTPS is REQUIRED when calling from the site (mixed content)."
  echo "   Point an A record at this VPS and run:  sudo bash setup.sh your-domain.com"
fi

echo
echo "==> Done. Checklist:"
echo "   1. Register this VPS IP in the Alice Blue A3 portal (static IP whitelist)."
echo "   2. Fill in ${APP_DIR}/.env  then:  systemctl restart zonaledge-gateway"
echo "   3. Test:  curl https://YOUR_DOMAIN?action=status"
echo "   4. Set VITE_BROKER_API_URL=https://YOUR_DOMAIN in Vercel + .env and redeploy."
