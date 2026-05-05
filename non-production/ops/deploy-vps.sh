#!/bin/bash
# Hunt-X Deployment Script
# Run this on your VPS to deploy Hunt-X

set -e

echo "🚀 Deploying Hunt-X..."

# Navigate to project
cd /data/.openclaw/workspace/empire/careerpilot

# Pull latest code
echo "📥 Pulling latest code..."
git pull

# Build and start services
echo "🔨 Building services..."
docker-compose down 2>/dev/null || true
docker-compose up -d --build

# Check status
echo "✅ Checking deployment status..."
docker-compose ps

echo ""
echo "🎉 Hunt-X deployed!"
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:3000"
