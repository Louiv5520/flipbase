# Flipbase Deployment Guide - Linux Server

## Prerequisites

### Server Requirements
- Ubuntu 20.04+ eller Debian 11+
- Docker og Docker Compose installeret
- Domæne pegende på server IP
- SSL certifikater (Let's Encrypt)

### Ports der skal være åbne
- 80 (HTTP)
- 443 (HTTPS)
- 25 (SMTP)
- 587 (SMTP Submission)
- 993 (IMAP SSL)

## Installation

### 1. Installer Docker og Docker Compose
```bash
# Opdater system
sudo apt update && sudo apt upgrade -y

# Installer Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Tilføj bruger til docker gruppe
sudo usermod -aG docker $USER

# Installer Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Genstart session eller log ud/ind igen
```

### 2. Klon projektet fra GitHub
```bash
# Opret projekt mappe
mkdir -p /opt/flipbase
cd /opt/flipbase

# Klon fra GitHub
git clone https://github.com/dit-username/flipbase.git .
```

### 3. Konfigurer miljøvariabler
```bash
# Kopier environment template
cp backend/config/env.example backend/config/.env

# Rediger .env fil med dine værdier
nano backend/config/.env
```

### 4. Opret SSL certifikater
```bash
# Opret certbot mapper
mkdir -p certbot/conf certbot/www

# Generer SSL certifikater (kør kun hvis domæne peger på server)
sudo docker run --rm -it \
  -v /opt/flipbase/certbot/conf:/etc/letsencrypt \
  -v /opt/flipbase/certbot/www:/var/www/certbot \
  certbot/certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email din-email@flipbase.dk \
  --agree-tos \
  --no-eff-email \
  -d flipbase.dk \
  -d www.flipbase.dk
```

### 5. Start services
```bash
# Byg og start alle services
docker-compose up -d

# Tjek status
docker-compose ps

# Se logs
docker-compose logs -f
```

## Konfiguration

### Domæne og DNS
- Sørg for at `flipbase.dk` og `www.flipbase.dk` peger på din server IP
- Vent 5-10 minutter på DNS propagation

### SSL Certifikater
- Certifikater fornyes automatisk hver 60. dag
- Certbot container håndterer fornyelse

### Email Konfiguration
- Mailserver kører på `mail.flipbase.dk`
- Rainloop webmail på port 8888 (hvis nødvendigt)
- Konfigurer DNS MX records for domænet

## Vedligeholdelse

### Backup
```bash
# Backup MongoDB data
docker exec iwoweb-mongo-1 mongodump --out /data/backup/$(date +%Y%m%d)

# Backup mail data
sudo tar -czf mail-backup-$(date +%Y%m%d).tar.gz data/mailserver/

# Backup SSL certifikater
sudo cp -r certbot/conf certbot-backup-$(date +%Y%m%d)
```

### Updates
```bash
# Opdater fra GitHub
git pull origin main

# Opdater images
docker-compose pull

# Genstart services
docker-compose up -d

# Fjern gamle images
docker image prune -f
```

### Monitoring
```bash
# Se resource usage
docker stats

# Se disk usage
df -h

# Se logs
docker-compose logs -f [service-name]
```

## Troubleshooting

### SSL Problemer
```bash
# Test certifikater
sudo docker run --rm -it \
  -v /opt/flipbase/certbot/conf:/etc/letsencrypt \
  certbot/certbot certificates

# Forny certifikater manuelt
sudo docker run --rm -it \
  -v /opt/flipbase/certbot/conf:/etc/letsencrypt \
  -v /opt/flipbase/certbot/www:/var/www/certbot \
  certbot/certbot renew
```

### Database Problemer
```bash
# Tjek MongoDB status
docker exec iwoweb-mongo-1 mongosh --eval "db.adminCommand('ping')"

# Backup og restore
docker exec iwoweb-mongo-1 mongodump --out /data/backup/
docker exec iwoweb-mongo-1 mongorestore /data/backup/
```

### Email Problemer
```bash
# Tjek mailserver logs
docker-compose logs mailserver

# Test SMTP
telnet localhost 25
```

## Sikkerhed

### Firewall
```bash
# Installer UFW
sudo apt install ufw

# Konfigurer firewall
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 25
sudo ufw allow 587
sudo ufw allow 993
sudo ufw enable
```

### Regular Updates
```bash
# System updates
sudo apt update && sudo apt upgrade -y

# Docker updates
docker-compose pull
docker-compose up -d
```

## Support

Ved problemer:
1. Tjek logs: `docker-compose logs -f`
2. Tjek status: `docker-compose ps`
3. Tjek disk space: `df -h`
4. Tjek memory: `free -h` 