# Flipbase - iPhone Refurbishing Platform

En komplet web-applikation til salg af istandsatte iPhones med CRM, analytics og email funktionalitet.

## 🚀 Features

- **E-commerce Website** - React frontend med produktkatalog
- **CRM Dashboard** - Admin panel til ordrehåndtering
- **Analytics** - Besøgende tracking med geolocation
- **Email System** - Komplet mailserver med webmail
- **Docker Deployment** - Nem deployment med Docker Compose

## 📋 Prerequisites

- Docker og Docker Compose
- Domæne pegende på server IP
- SSL certifikater (Let's Encrypt)

## 🛠️ Installation

### 1. Klon repository
```bash
git clone https://github.com/dit-username/flipbase.git
cd flipbase
```

### 2. Konfigurer miljøvariabler
```bash
# Kopier environment template
cp backend/config/env.example backend/config/.env

# Rediger .env fil med dine værdier
nano backend/config/.env
```

### 3. Opret SSL certifikater
```bash
# Opret certbot mapper
mkdir -p certbot/conf certbot/www

# Generer SSL certifikater
sudo docker run --rm -it \
  -v $(pwd)/certbot/conf:/etc/letsencrypt \
  -v $(pwd)/certbot/www:/var/www/certbot \
  certbot/certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email din-email@flipbase.dk \
  --agree-tos \
  --no-eff-email \
  -d flipbase.dk \
  -d www.flipbase.dk
```

### 4. Start services
```bash
# Byg og start alle services
docker-compose up -d

# Tjek status
docker-compose ps
```

## 🌐 Services

- **Website**: https://flipbase.dk
- **CRM**: https://flipbase.dk/crm
- **Analytics**: https://flipbase.dk/crm/analytics
- **Email**: mail.flipbase.dk

## 📊 Analytics

Systemet inkluderer komplet analytics med:
- Besøgende tracking
- Geolocation (land/by)
- Enhed og browser statistik
- Live besøgende
- Sidevisninger og kurv aktivitet

## 🔧 Vedligeholdelse

### Backup
```bash
./backup.sh
```

### Updates
```bash
docker-compose pull
docker-compose up -d
```

### Logs
```bash
docker-compose logs -f [service-name]
```

## 📁 Projektstruktur

```
flipbase/
├── backend/                 # Node.js API
│   ├── config/             # Konfiguration
│   ├── models/             # MongoDB modeller
│   ├── routes/             # API routes
│   └── server.js           # Server entry point
├── frontend/               # React app
│   ├── src/               # React komponenter
│   ├── nginx/             # Nginx konfiguration
│   └── Dockerfile         # Frontend Docker
├── data/                  # Persistent data
├── certbot/               # SSL certifikater
├── docker-compose.yml     # Container orchestration
├── backup.sh              # Backup script
├── restore.sh             # Restore script
└── DEPLOYMENT.md          # Deployment guide
```

## 🔒 Sikkerhed

- Alle sensitive filer er ekskluderet fra Git
- SSL certifikater fornyes automatisk
- Firewall konfiguration inkluderet
- Environment variabler for sikker konfiguration

## 📞 Support

Ved problemer:
1. Tjek logs: `docker-compose logs -f`
2. Tjek status: `docker-compose ps`
3. Se DEPLOYMENT.md for detaljerede instruktioner

## 📄 License

Dette projekt er privat og tilhører Flipbase. 