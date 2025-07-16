# Migration Checklist - Windows til Linux Server

## Før Overførsel (Windows)

### ✅ Backup
- [ ] Kør `./backup.sh` for at lave komplet backup
- [ ] Verificer at backup indeholder alle nødvendige data
- [ ] Kopier backup til sikker lokation

### ✅ Dokumentation
- [ ] Noter nuværende server IP og domæne konfiguration
- [ ] Noter alle miljøvariabler og passwords
- [ ] Noter port konfigurationer

### ✅ Test
- [ ] Test at alle services virker korrekt
- [ ] Test website, CRM, og email funktionalitet
- [ ] Test analytics og geolocation

## Under Overførsel

### ✅ Server Setup (Linux)
- [ ] Installer Ubuntu/Debian på server
- [ ] Installer Docker og Docker Compose
- [ ] Konfigurer firewall (UFW)
- [ ] Åbn nødvendige ports (80, 443, 25, 587, 993)

### ✅ DNS Konfiguration
- [ ] Opdater A records til ny server IP
- [ ] Opdater MX records for email
- [ ] Vent på DNS propagation (5-10 minutter)

### ✅ SSL Certifikater
- [ ] Generer nye SSL certifikater med Let's Encrypt
- [ ] Verificer certifikater virker korrekt

## Efter Overførsel (Linux)

### ✅ Restore
- [ ] Kopier backup til server
- [ ] Kør `./restore.sh <backup-directory>`
- [ ] Verificer alle containers starter korrekt

### ✅ Test Funktionalitet
- [ ] Test website: https://flipbase.dk
- [ ] Test CRM: https://flipbase.dk/crm
- [ ] Test email funktionalitet
- [ ] Test analytics dashboard
- [ ] Test geolocation tracking

### ✅ Sikkerhed
- [ ] Konfigurer firewall regler
- [ ] Opdater system og Docker images
- [ ] Sæt op automatiske backups
- [ ] Konfigurer monitoring

### ✅ Performance
- [ ] Tjek resource usage (CPU, RAM, disk)
- [ ] Optimér nginx konfiguration hvis nødvendigt
- [ ] Sæt op log rotation

## Troubleshooting

### Hvis noget ikke virker:
1. Tjek logs: `docker-compose logs -f`
2. Tjek status: `docker-compose ps`
3. Tjek disk space: `df -h`
4. Tjek memory: `free -h`
5. Tjek network: `netstat -tulpn`

### Almindelige problemer:
- **SSL fejl**: Generer nye certifikater
- **Database fejl**: Restore MongoDB data
- **Email fejl**: Tjek mailserver konfiguration
- **DNS fejl**: Vent på propagation eller tjek DNS indstillinger

## Post-Migration

### ✅ Monitoring
- [ ] Sæt op log monitoring
- [ ] Konfigurer backup automation
- [ ] Sæt op SSL certifikat fornyelse
- [ ] Konfigurer system updates

### ✅ Dokumentation
- [ ] Opdater server dokumentation
- [ ] Noter IP adresser og konfigurationer
- [ ] Opret vedligeholdelses rutiner

### ✅ Backup Strategy
- [ ] Test backup og restore process
- [ ] Sæt op automatiske backups
- [ ] Test disaster recovery plan 