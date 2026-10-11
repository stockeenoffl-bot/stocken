# Alice Blue gateway for the VPS (Hostinger)

Everything that talks to Alice Blue runs here. The website only calls this
gateway, so the API secret and the daily session never touch a browser.

## 1. DNS (Hostinger hPanel)

`zonaledge.com` -> **DNS / Nameservers** -> **DNS Zone** -> add:

| Type | Name | Target          | TTL   |
|------|------|-----------------|-------|
| A    | api  | 147.93.19.24    | 14400 |

Wait a few minutes, then check: `ping api.zonaledge.com` (should show 147.93.19.24).

## 2. Install on the VPS (Ubuntu 22.04 / 24.04)

```bash
# From your PC - copy this folder to the VPS
scp -r server/ root@147.93.19.24:/root/zonaledge-gateway

# SSH in and install
ssh root@147.93.19.24
cd /root/zonaledge-gateway
sudo bash setup.sh api.zonaledge.com

# Fill in the config (Alice Blue + Supabase keys)
sudo nano /opt/zonaledge-gateway/.env
sudo systemctl restart zonaledge-gateway

# Verify
curl https://api.zonaledge.com?action=status
curl "https://api.zonaledge.com?action=quotes&symbols=NIFTY%2050"
```

## 3. Alice Blue side (required!)

1. Log in to https://a3.aliceblueonline.com -> My Apps.
2. Register **147.93.19.24** as the static IP (replace any old IP).
   Confirm the VPS IP with: `curl https://api.ipify.org`
3. Every trading day: website -> **Broker** page -> "Login to Alice Blue" ->
   paste the redirect URL -> **Connect & go live**.

## 4. Website side (Vercel)

Set in Vercel -> Settings -> Environment Variables (and local `.env`):

```
VITE_BROKER_API_URL=https://api.zonaledge.com
```

Redeploy. Charts, quotes and the live tick stream then come from this gateway.

## Data storage

The daily session lives in `/opt/zonaledge-gateway/data/session.json` on this
VPS - no Supabase storage needed for it. Quote/history caches are in memory.
The site keeps using Supabase only for login/user accounts and the admin's
published analysis (realtime push).

## Notes

- HTTPS is required (Caddy gets a free Let's Encrypt certificate automatically).
- `systemctl status zonaledge-gateway` to check, `journalctl -u zonaledge-gateway -f` for logs.
- After a reboot nothing else is needed; the service starts automatically.
