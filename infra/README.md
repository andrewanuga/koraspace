# KoraSpace Infrastructure — Security Stack
# Nginx + CrowdSec + Coraza WAF + Next.js

## Overview

```
Internet → Nginx (TLS termination, WAF, rate limit)
              └──→ CrowdSec Bouncer (IP reputation)
              └──→ Coraza WAF (OWASP CRS rules)
              └──→ Next.js (port 3000)
```

## Prerequisites

```bash
# Ubuntu/Debian
sudo apt install nginx certbot python3-certbot-nginx

# Install CrowdSec
curl -s https://packagecloud.io/install/repositories/crowdsec/crowdsec/script.deb.sh | sudo bash
sudo apt install crowdsec crowdsec-nginx-bouncer

# Install Coraza WAF (Nginx module — compile or use pre-built)
# See: https://coraza.io/docs/tutorials/nginx/
```

## File layout

```
infra/
├── nginx.conf              ← Main Nginx config (copy to /etc/nginx/)
├── crowdsec/
│   ├── profiles.yaml       ← CrowdSec scenarios/decisions
│   └── acquis.yaml         ← Log acquisition config
└── README.md               ← This file
```

## Deployment steps

### 1. TLS certificate
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 2. Copy Nginx config
```bash
sudo cp infra/nginx.conf /etc/nginx/sites-available/koraspace
sudo ln -s /etc/nginx/sites-available/koraspace /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### 3. CrowdSec setup
```bash
# Install collections
sudo cscli collections install crowdsecurity/nginx
sudo cscli collections install crowdsecurity/http-cve
sudo cscli collections install crowdsecurity/base-http-scenarios

# Copy acquisition config
sudo cp infra/crowdsec/acquis.yaml /etc/crowdsec/acquis.d/koraspace.yaml
sudo systemctl restart crowdsec
```

### 4. Verify CrowdSec bouncer
```bash
sudo cscli bouncers list
sudo cscli decisions list
```

### 5. Start Next.js app
```bash
# Use PM2 for process management
npm install -g pm2
pm2 start npm --name koraspace -- start
pm2 startup
pm2 save
```

## Environment variables

Set these in `/etc/environment` or a `.env.production` file:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
PAYSTACK_SECRET_KEY=...
OPENROUTER_API_KEY=...
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NODE_ENV=production
```

## Security notes

- **Session limit**: Enforced at the app layer (middleware.ts) — 3 days max.
- **Rate limiting**: Done at both Nginx level (connection limits) and app layer (lib/security/ratelimit.ts).
- **WAF**: Coraza enforces OWASP CRS rules to block SQLi, XSS, path traversal.
- **IP blocks**: Admin can block IPs via the KoraSpace admin dashboard → Security tab. CrowdSec also auto-blocks based on behavior analysis.
- **MITM protection**: HSTS with `max-age=31536000; includeSubDomains` is set in both Nginx and Next.js headers.
