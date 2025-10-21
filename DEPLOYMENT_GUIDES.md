# Railway Deployment Guide

## 🚂 Railway.app (Recommended Alternative)

Railway is excellent for Next.js + PostgreSQL applications.

### Step 1: Create Railway Account

1. Go to https://railway.app
2. Sign up with GitHub

### Step 2: Create Project

1. Click "New Project"
2. Choose "Deploy from GitHub repo"
3. Connect your repository: `imsamrat/point-of-sales-module`

### Step 3: Configure Environment Variables

In Railway dashboard, go to your project → Variables:

```
DATABASE_URL=postgresql://neondb_owner:npg_8zZ9FMbWmELU@ep-muddy-sunset-aduh2vpc-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
NEXTAUTH_SECRET=your-secure-random-secret-here
NEXTAUTH_URL=https://your-app-name.up.railway.app
```

### Step 4: Deploy

Railway will automatically detect Next.js and deploy!

### Pricing: Free tier available, then $5/month for hobby plan

---

# Render Deployment Guide

## 🔄 Render.com

### Step 1: Create Render Account

1. Go to https://render.com
2. Sign up (free tier available)

### Step 2: Create Web Service

1. Click "New" → "Web Service"
2. Connect GitHub repo: `imsamrat/point-of-sales-module`
3. Configure:
   - **Runtime**: Node
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`

### Step 3: Environment Variables

```
DATABASE_URL=postgresql://neondb_owner:npg_8zZ9FMbWmELU@ep-muddy-sunset-aduh2vpc-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
NEXTAUTH_SECRET=your-secure-random-secret-here
NEXTAUTH_URL=https://your-app-name.onrender.com
```

### Step 4: Deploy

Render will build and deploy automatically!

### Pricing: 750 hours free/month, then $7/month

---

# Netlify Deployment Guide

## 🌐 Netlify.com

### Step 1: Create Netlify Account

1. Go to https://netlify.com
2. Sign up with GitHub

### Step 2: Deploy from Git

1. Click "Add new site" → "Import from Git"
2. Choose GitHub repo: `imsamrat/point-of-sales-module`
3. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`

### Step 3: Environment Variables

In Site settings → Environment variables:

```
DATABASE_URL=postgresql://neondb_owner:npg_8zZ9FMbWmELU@ep-muddy-sunset-aduh2vpc-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
NEXTAUTH_SECRET=your-secure-random-secret-here
NEXTAUTH_URL=https://your-app-name.netlify.app
```

### Step 4: Deploy

Netlify will build and deploy!

### ⚠️ Note: Netlify Functions needed for API routes

You may need to configure Netlify Functions for API routes.

### Pricing: Generous free tier, then $19/month for Pro

---

# Fly.io Deployment Guide

## ✈️ Fly.io

### Step 1: Install Fly CLI

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh
fly auth login
```

### Step 2: Create fly.toml

```toml
app = "your-pos-app-name"
primary_region = "iad"

[build]
  builder = "heroku/buildpacks:20"

[env]
  PORT = "8080"

[[services]]
  internal_port = 8080
  protocol = "tcp"

  [services.concurrency]
    hard_limit = 25
    soft_limit = 20

  [[services.ports]]
    handlers = ["http"]
    port = "80"

  [[services.ports]]
    handlers = ["tls", "http"]
    port = "443"

  [[services.tcp_checks]]
    interval = "10s"
    timeout = "2s"
    grace_period = "5s"
```

### Step 3: Deploy

```bash
fly launch
fly secrets set DATABASE_URL="postgresql://neondb_owner:npg_8zZ9FMbWmELU@ep-muddy-sunset-aduh2vpc-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
fly secrets set NEXTAUTH_SECRET="your-secure-secret"
fly secrets set NEXTAUTH_URL="https://your-app-name.fly.dev"
fly deploy
```

### Pricing: Free tier available, then pay-as-you-go
