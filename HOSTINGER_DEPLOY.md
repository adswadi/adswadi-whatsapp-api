# 🚀 Hostinger VPS Deployment Guide
# Adswadi WhatsApp API — Step by Step

---

## 📋 STEP 1 — Hostinger pe kya kharido

### ✅ Zaruri Plan:
- **VPS KVM 2** (₹799/month) — Minimum recommended
  - 2 vCPU, 8GB RAM, 100GB SSD
  - OS: Ubuntu 22.04 LTS
- **Domain** — Hostinger se ya bahar se (adswadi.com ya koi bhi)

### ❌ Kya mat kharido:
- Shared Hosting (Node.js support nahi)
- WordPress Hosting (kaam nahi karega)

**Link:** hostinger.in → VPS Hosting → KVM 2

---

## 📋 STEP 2 — VPS First Time Setup

### SSH se connect karo:
```bash
# Windows: PowerShell / PuTTY
# Mac/Linux: Terminal
ssh root@YOUR_VPS_IP
# Password: Hostinger ne email kiya hoga
```

### System update karo:
```bash
apt update && apt upgrade -y
```

### Node.js 20 install karo:
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt-get install -y nodejs
node --version   # Should show v20.x.x
npm --version
```

### MongoDB install karo:
```bash
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | gpg --dearmor -o /usr/share/keyrings/mongodb-server-7.0.gpg

echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list

apt-get update
apt-get install -y mongodb-org

# Start MongoDB
systemctl start mongod
systemctl enable mongod
systemctl status mongod   # Should show "active (running)"
```

### Redis install karo:
```bash
apt install -y redis-server
systemctl start redis
systemctl enable redis
redis-cli ping   # Should return PONG
```

### Nginx install karo:
```bash
apt install -y nginx
systemctl start nginx
systemctl enable nginx
```

### PM2 install karo (Node.js process manager):
```bash
npm install -g pm2
pm2 startup   # Copy-paste the command it shows
```

### Git install karo:
```bash
apt install -y git
```

---

## 📋 STEP 3 — Code Upload karo

### Option A: GitHub se (Recommended)
```bash
# GitHub pe repo banao (github.com → New Repository → adswadi-whatsapp-api)
# Apne PC se:
cd /Users/sadabalam/adswadi-whatsapp-api
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/TUMHARA_USERNAME/adswadi-whatsapp-api.git
git push -u origin main

# VPS pe:
cd /var/www
mkdir -p adswadi/client/dist
git clone https://github.com/TUMHARA_USERNAME/adswadi-whatsapp-api.git adswadi/app
cd /var/www/adswadi/app
```

### Option B: Direct File Upload (FTP/SFTP)
```
FileZilla use karo:
Host: YOUR_VPS_IP
Username: root
Password: VPS password
Port: 22
Upload to: /var/www/adswadi/
```

---

## 📋 STEP 4 — Environment Variables Set karo

```bash
cd /var/www/adswadi/app/server
cp .env.example .env
nano .env
```

### .env file mein ye fill karo:
```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb://localhost:27017/adswadi_whatsapp
REDIS_URL=redis://localhost:6379

# JWT (koi bhi random 64-char string)
JWT_SECRET=YAHAN_APNA_SECRET_DAALO_MINIMUM_32_CHARS
JWT_REFRESH_SECRET=YAHAN_REFRESH_SECRET_DAALO

# Meta WhatsApp API (Step 6 mein milega)
META_APP_ID=your_meta_app_id
META_APP_SECRET=your_meta_app_secret
META_WEBHOOK_VERIFY_TOKEN=adswadi_webhook_2024
META_API_VERSION=v18.0
META_BASE_URL=https://graph.facebook.com

# Razorpay (razorpay.com se milega)
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=your_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Cloudinary (cloudinary.com - free account)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret

# Email (Gmail App Password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your_app_password

# Encryption
ENCRYPTION_KEY=32characterlongencryptionkey1234

# Tumhara domain
CLIENT_URL=https://yourdomain.com
```

**Ctrl+X → Y → Enter** (save karo)

---

## 📋 STEP 5 — App Build & Start karo

```bash
# Server dependencies
cd /var/www/adswadi/app/server
npm install --production

# Frontend build
cd /var/www/adswadi/app/client
npm install
npm run build

# Build files copy karo
cp -r dist/* /var/www/adswadi/client/dist/

# Server start karo with PM2
cd /var/www/adswadi/app/server
pm2 start ecosystem.config.js --env production
pm2 save
pm2 status   # Should show "online"

# Logs check karo
pm2 logs adswadi-api --lines 20
```

---

## 📋 STEP 6 — Nginx Configure karo

```bash
# Nginx config copy karo
cp /var/www/adswadi/app/nginx.conf /etc/nginx/sites-available/adswadi

# Domain name update karo
nano /etc/nginx/sites-available/adswadi
# "yourdomain.com" ko apne domain se replace karo

# Enable karo
ln -s /etc/nginx/sites-available/adswadi /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default   # Default hata do

# Test karo
nginx -t   # Should say "syntax is ok"

# Reload karo
systemctl reload nginx
```

---

## 📋 STEP 7 — Domain Connect karo (Hostinger)

### Hostinger hPanel mein:
1. **Domains** → Apna domain select karo
2. **DNS Zone** → DNS Records
3. **A Record** add karo:
   ```
   Type: A
   Name: @
   Value: YOUR_VPS_IP_ADDRESS
   TTL: 3600
   ```
4. **A Record** for www:
   ```
   Type: A
   Name: www
   Value: YOUR_VPS_IP_ADDRESS
   TTL: 3600
   ```
5. Save karo → **24-48 hours** mein propagate hoga

### DNS check karo:
```bash
# VPS pe ya apne PC pe:
ping yourdomain.com   # VPS IP aana chahiye
```

---

## 📋 STEP 8 — SSL Certificate (HTTPS) — FREE

```bash
# Certbot install karo
apt install -y certbot python3-certbot-nginx

# SSL certificate lo (FREE - Let's Encrypt)
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow prompts:
# - Email enter karo
# - Agree to terms (A)
# - Share email? (N)
# - Redirect HTTP to HTTPS? (2) ← Select this

# Auto-renewal setup (automatic)
certbot renew --dry-run   # Test karo
```

---

## 📋 STEP 9 — Firewall Setup

```bash
ufw allow ssh
ufw allow 80
ufw allow 443
ufw enable
ufw status
```

---

## ✅ FINAL CHECK

```bash
# Sab services check karo
systemctl status mongod    # MongoDB running?
systemctl status redis     # Redis running?
systemctl status nginx     # Nginx running?
pm2 status                 # Node.js app running?

# App logs
pm2 logs adswadi-api
```

### Browser mein open karo:
- 🌐 `https://yourdomain.com` — Landing page
- 🔐 `https://yourdomain.com/register` — Register
- 📊 `https://yourdomain.com/app/dashboard` — Dashboard
- 🔌 `https://yourdomain.com/api/health` — API health check

---

## 🔄 Future Updates Deploy karna:

```bash
# Bas ye ek command:
cd /var/www/adswadi/app
./deploy.sh
```

---

## 🆘 Common Issues

| Problem | Solution |
|---------|----------|
| 502 Bad Gateway | `pm2 restart adswadi-api` |
| MongoDB not connecting | `systemctl restart mongod` |
| SSL error | `certbot renew` |
| App not starting | `pm2 logs adswadi-api` dekho |
| Port 5000 busy | `lsof -i :5000` then `kill PID` |

---

## 📞 Support
- Hostinger Support: Live chat 24/7
- PM2 Docs: pm2.keymetrics.io
- Certbot Docs: certbot.eff.org
