#!/bin/bash

# Flipbase Restore Script
# Kør dette script på den nye server efter overførsel

set -e

echo "🚀 Starter Flipbase restore..."

# Tjek om backup mappe eksisterer
if [ ! -d "$1" ]; then
    echo "❌ Error: Backup directory not found!"
    echo "Usage: ./restore.sh <backup-directory>"
    exit 1
fi

BACKUP_DIR="$1"
echo "📁 Restoring from: $BACKUP_DIR"

# Stop eksisterende containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Restore projekt filer
echo "📦 Restoring project files..."
if [ -f "$BACKUP_DIR/project.tar.gz" ]; then
    tar -xzf "$BACKUP_DIR/project.tar.gz"
fi

# Restore SSL certifikater
echo "🔒 Restoring SSL certificates..."
if [ -d "$BACKUP_DIR/ssl" ]; then
    mkdir -p certbot/conf
    cp -r "$BACKUP_DIR/ssl"/* certbot/conf/
fi

# Restore mail data
echo "📧 Restoring mail data..."
if [ -f "$BACKUP_DIR/mailserver.tar.gz" ]; then
    mkdir -p data
    tar -xzf "$BACKUP_DIR/mailserver.tar.gz" -C data/
fi

# Start containers
echo "🚀 Starting containers..."
docker-compose up -d

# Vent på at MongoDB er klar
echo "⏳ Waiting for MongoDB to be ready..."
sleep 10

# Restore MongoDB data
echo "🗄️  Restoring MongoDB data..."
if [ -d "$BACKUP_DIR/mongodb" ]; then
    docker cp "$BACKUP_DIR/mongodb" iwoweb-mongo-1:/data/backup-restore
    docker exec iwoweb-mongo-1 mongorestore /data/backup-restore/
fi

# Tjek status
echo "✅ Restore completed!"
echo "📊 Container status:"
docker-compose ps

echo "🔍 Checking logs..."
docker-compose logs --tail=10

echo "🌐 Your application should now be available at:"
echo "   - Website: https://flipbase.dk"
echo "   - CRM: https://flipbase.dk/crm"
echo "   - Mail: https://flipbase.dk (port 8888 for Rainloop)"

echo "📝 Next steps:"
echo "1. Update DNS records to point to new server IP"
echo "2. Test all functionality"
echo "3. Update SSL certificates if needed"
echo "4. Configure firewall and security" 