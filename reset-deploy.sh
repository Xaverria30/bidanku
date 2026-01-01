#!/bin/bash

echo "🚀 Starting Full Reset & Deployment..."

# 1. Stop all running containers
echo "🛑 Stopping containers..."
docker compose down

# 2. DELETE the persistent database volume to force re-initialization
echo "🧹 Deleting Database Volume (bidanku_dbdata)..."
docker volume rm bidanku_dbdata || true

# 3. Pull latest changes (just in case)
echo "📥 Git Pulling..."
git pull

# 4. Rebuild and Start everything
echo "🏗️  Rebuilding and Starting..."
docker compose up -d --build --force-recreate

echo "⏳ Waiting for Database to Initialize (30s)..."
sleep 30

echo "✅ Deployment Complete!"
echo "👉 Check status with: docker ps"
