#!/bin/bash

# Flipbase Backup Script
# Kør dette script før overførsel til ny server

set -e

echo "🚀 Starter Flipbase backup..."

# Opret backup mappe
BACKUP_DIR="backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "📁 Opretter backup i: $BACKUP_DIR"

# Backup MongoDB data
echo "🗄️  Backing up MongoDB..."
docker exec iwoweb-mongo-1 mongodump --out /data/backup/
docker cp iwoweb-mongo-1:/data/backup "$BACKUP_DIR/mongodb"

# Backup mail data
echo "📧 Backing up mail data..."
if [ -d "data/mailserver" ]; then
    tar -czf "$BACKUP_DIR/mailserver.tar.gz" data/mailserver/
fi

# Backup SSL certifikater
echo "🔒 Backing up SSL certificates..."
if [ -d "certbot/conf" ]; then
    cp -r certbot/conf "$BACKUP_DIR/ssl"
fi

# Backup konfigurationsfiler
echo "⚙️  Backing up configuration files..."
cp docker-compose.yml "$BACKUP_DIR/"
cp -r backend/config "$BACKUP_DIR/"
cp -r frontend/nginx "$BACKUP_DIR/"

# Backup projekt filer (ekskluder node_modules og andre store mapper)
echo "📦 Backing up project files..."
tar --exclude='node_modules' \
    --exclude='.git' \
    --exclude='backup-*' \
    --exclude='data' \
    --exclude='certbot' \
    -czf "$BACKUP_DIR/project.tar.gz" .

# Opret backup info
echo "📝 Creating backup info..."
cat > "$BACKUP_DIR/backup-info.txt" << EOF
Flipbase Backup
Date: $(date)
Docker containers:
$(docker-compose ps)

Disk usage:
$(df -h)

Backup contents:
- MongoDB data
- Mail server data
- SSL certificates
- Configuration files
- Project files (excluding node_modules)

To restore:
1. Extract project.tar.gz
2. Copy SSL certificates to certbot/conf/
3. Copy mail data to data/mailserver/
4. Run: docker-compose up -d
5. Restore MongoDB: docker exec iwoweb-mongo-1 mongorestore /data/backup/
EOF

echo "✅ Backup completed successfully!"
echo "📁 Backup location: $BACKUP_DIR"
echo "📊 Backup size: $(du -sh "$BACKUP_DIR" | cut -f1)"

# Vis backup indhold
echo "📋 Backup contents:"
ls -la "$BACKUP_DIR/" 