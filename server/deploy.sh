#!/usr/bin/env bash
# ============================================================================
#  Zonal Edge - ONE-COMMAND deploy to your Hostinger VPS
#
#  Run this ONCE from your PC, inside the project's `app` folder:
#
#      bash server/deploy.sh
#
#  It copies the gateway to the VPS, installs Node + Caddy (HTTPS), writes the
#  config file AUTOMATICALLY from your local .env (no nano needed), starts the
#  service and tests it.
# ============================================================================
set -euo pipefail

cd "$(dirname "$0")"
APP_DIR="$(cd .. && pwd)"
ENV_FILE="${APP_DIR}/.env"

echo "============================================================"
echo "  Zonal Edge - Alice Blue gateway deploy (all-in-one)"
echo "============================================================"

if [ ! -f "${ENV_FILE}" ]; then
  echo "!! Could not find ${ENV_FILE}"
  echo "   Run this script from inside the project:  bash server/deploy.sh"
  exit 1
fi

read -rp "VPS IP address [147.93.19.24]: " VPS_IP
VPS_IP="${VPS_IP:-147.93.19.24}"
read -rp "Domain for the gateway [api.zonaledge.com]: " DOMAIN
DOMAIN="${DOMAIN:-api.zonaledge.com}"

# ---- read the values we need from the local .env ---------------------------
get() { grep -E "^${1}=" "${ENV_FILE}" | head -1 | cut -d= -f2- ; }

SUPABASE_URL="$(get VITE_SUPABASE_URL)"
SUPABASE_ANON_KEY="$(get VITE_SUPABASE_ANON_KEY)"
ALICE_APP_ID="$(get ALICE_BLUE_APP_ID)"
ALICE_SECRET="$(get ALICE_BLUE_API_SECRET)"
ALICE_USER="$(get ALICE_BLUE_USER_ID)"
ALICE_IP="$(get ALICE_BLUE_PUBLIC_IP)"
ADMIN_EMAILS="$(get VITE_ADMIN_EMAILS)"

echo
echo "==> Values found in your local .env:"
echo "    ALICE_BLUE_APP_ID      = ${ALICE_APP_ID:-<missing>}"
echo "    ALICE_BLUE_USER_ID     = ${ALICE_USER:-<missing>}"
echo "    ALICE_BLUE_PUBLIC_IP   = ${ALICE_IP:-<missing>}"
echo "    SUPABASE_URL           = ${SUPABASE_URL:-<missing>}"
echo "    (secret values are read but not printed)"
echo

if [ -z "${SUPABASE_URL}" ] || [ -z "${SUPABASE_ANON_KEY}" ] || [ -z "${ALICE_APP_ID}" ] || [ -z "${ALICE_SECRET}" ]; then
  echo "!! Some required values are missing in ${ENV_FILE}."
  echo "   Make sure these lines exist: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY,"
  echo "   ALICE_BLUE_APP_ID, ALICE_BLUE_API_SECRET"
  exit 1
fi

echo "==> Step 1/4: copying gateway files to ${VPS_IP} ..."
scp -r . "root@${VPS_IP}:/root/zonaledge-gateway"

echo
echo "==> Step 2/4: installing Node + Caddy + service (1-2 min, asks for password)..."
ssh -t "root@${VPS_IP}" "cd /root/zonaledge-gateway && bash setup.sh ${DOMAIN}"

echo
echo "==> Step 3/4: writing the config file automatically..."
ssh "root@${VPS_IP}" "cat > /opt/zonaledge-gateway/.env" <<EOF
PORT=8787
DATA_DIR=/opt/zonaledge-gateway/data

ALICE_BLUE_APP_ID=${ALICE_APP_ID}
ALICE_BLUE_API_SECRET=${ALICE_SECRET}
ALICE_BLUE_USER_ID=${ALICE_USER}
ALICE_BLUE_PUBLIC_IP=${ALICE_IP}

SUPABASE_URL=${SUPABASE_URL}
SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
ADMIN_EMAILS=${ADMIN_EMAILS}

CORS_ORIGIN=*
EOF
ssh "root@${VPS_IP}" "chown zonaledge:zonaledge /opt/zonaledge-gateway/.env && chmod 600 /opt/zonaledge-gateway/.env && systemctl restart zonaledge-gateway && sleep 2 && systemctl is-active zonaledge-gateway"

echo
echo "==> Step 4/4: testing the gateway..."
echo
echo "--- local test (from the VPS) ---"
ssh "root@${VPS_IP}" "curl -s 'http://127.0.0.1:8787?action=status' || echo 'FAILED'"
echo
echo
echo "--- public test (https://${DOMAIN}) ---"
curl -s "https://${DOMAIN}?action=status" || echo "(DNS may still be propagating - see below)"
echo
echo

cat <<EOF
============================================================
  DEPLOY FINISHED
============================================================

  If the public test above shows JSON with "configured": true,
  you are DONE. Otherwise do these remaining steps:

  1. DNS (Hostinger hPanel -> zonaledge.com -> DNS Zone):
       Type: A    Name: api    Target: ${VPS_IP}    TTL: 14400
     Wait 5-10 min, then:  curl "https://${DOMAIN}?action=status"

  2. Alice Blue (a3.aliceblueonline.com -> My Apps):
       Register ${VPS_IP} as your static IP (replace the old one).

  3. Vercel -> Settings -> Environment Variables:
       VITE_BROKER_API_URL=https://${DOMAIN}
     then Redeploy.

  4. Website -> Broker page -> "Login to Alice Blue" ->
     paste the redirect URL -> "Connect & go live".

============================================================
EOF
