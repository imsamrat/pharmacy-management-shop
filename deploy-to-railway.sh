#!/bin/bash

# Railway Deployment Script
# This script helps deploy to Railway.app

echo "🚂 Railway Deployment Helper"
echo "============================"

echo "1. Go to https://railway.app"
echo "2. Create new project from GitHub repo: imsamrat/point-of-sales-module"
echo "3. Set these environment variables in Railway dashboard:"
echo ""

echo "DATABASE_URL=postgresql://neondb_owner:npg_8zZ9FMbWmELU@ep-muddy-sunset-aduh2vpc-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
echo "NEXTAUTH_SECRET=your-secure-random-secret-here"
echo "NEXTAUTH_URL=https://your-app-name.up.railway.app"
echo ""

echo "4. Railway will auto-deploy from your GitHub repo"
echo "5. Your app will be live at: https://your-app-name.up.railway.app"
echo ""

echo "Login credentials:"
echo "- Email: admin@pos.com"
echo "- Password: password123"

echo ""
echo "✅ Deployment ready! Railway handles everything automatically."