<a href="https://directus.io" target="_blank">
  <h1 align="center">Open Source Santa</h1>
</a>

<p align="center">A fun holiday project that uses AI to generate personalized roast letters from Salty Open Source Santa based on your GitHub open source contributions. Find out if you're on the naughty or nice list! 🎅</p>

<p align="center"><em>Built with ❤️ by the <a href="https://github.com/directus/directus" target="_blank">Directus team</a></em></p>

<p align="center">
  <a href="#introduction"><strong>Introduction</strong></a> ·
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#tech-stack"><strong>Tech Stack</strong></a> ·
  <a href="#getting-started"><strong>Getting Started</strong></a> ·
  <a href="#development"><strong>Development</strong></a>
</p>

<br/>

# Introduction

Open Source Santa is a playful web application that analyzes GitHub profiles and generates AI-powered "naughty or nice" letters from Santa. Whether you want to check your own open source karma or roast a friend, Santa's got opinions about everyone's commits!

# Features

- 🎅 Generate AI-powered letters from Santa based on GitHub profiles
- 🎄 Check if you're on the naughty or nice list
- 🎁 Write letters for yourself or roast your friends
- 🌟 Beautiful particle snow effects and holiday theming
- 🔊 Festive sound effects
- 📱 Fully responsive design
- 🔒 GitHub OAuth authentication
- 🖼️ Dynamic OG image generation

# Tech Stack

## Frontend
- [Nuxt 3](https://nuxt.com) - Vue.js Framework
- [Nuxt UI v3-alpha](https://ui.nuxt.com/) - UI Component Library
- [Tailwind CSS v4-beta](https://tailwindcss.com) - Utility-first CSS
- [VueUse](https://vueuse.org) - Vue Composition Utilities
- [tsParticles](https://particles.js.org) - Particle Effects
- [Vercel AI SDK](https://sdk.vercel.ai) - AI SDK

## Backend
- [Directus](https://directus.io) - Headless CMS & Backend
- [Anthropic Claude](https://anthropic.com) - AI Text Generation
- [PostgreSQL](https://www.postgresql.org) - Database

# Getting Started

## Prerequisites
- Node.js >= 18
- PNPM >= 8.6.0
- PostgreSQL Database
- Directus Instance
- GitHub OAuth App
- Anthropic API Key

## Environment Variables

```bash
# Directus Configuration
DIRECTUS_URL=
DIRECTUS_SERVER_TOKEN=

# Site Configuration
NUXT_PUBLIC_SITE_URL=

# Authentication
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# AI Generation
ANTHROPIC_API_KEY=
```

# Detailed Setup Guide

## 1. Backend Setup (Directus)

### Option A: Directus Cloud (Recommended for Quick Start)
1. Create an account at [Directus Cloud](https://directus.cloud)
2. Create a new project
3. Once created, note down your project URL
4. Generate an API token with admin access from Settings > API Hooks
5. Save both the URL and token for environment variables

### Option B: Self-Hosted Setup
1. Navigate to the directus directory:

```bash
cd directus
```

2. Start the Directus instance using Docker:

```bash
docker-compose up -d
```

3. Access Directus admin panel at `http://localhost:8055`
4. Create an admin user and generate an API token

## 2. GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the application details:
   - Application name: "Open Source Santa" (or your preferred name)
   - Homepage URL: `http://localhost:3000` (development) or your production URL
   - Authorization callback URL: `http://localhost:3000/auth/github/callback`
4. Save the Client ID and Client Secret for environment variables

## 3. Anthropic API Setup

1. Create an account at [Anthropic](https://anthropic.com)
2. Generate an API key from your dashboard
3. Save the API key for environment variables

## 4. Environment Configuration

1. Copy the example environment file:

```bash
cp .env.example .env
```

2. Fill in your environment variables:

```env
# Directus Configuration
DIRECTUS_URL=your_directus_url
DIRECTUS_SERVER_TOKEN=your_directus_token

# Site Configuration
NUXT_PUBLIC_SITE_URL=http://localhost:3000

# Authentication
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# AI Generation
ANTHROPIC_API_KEY=your_anthropic_api_key

# Analytics (Optional)
POSTHOG_API_KEY=your_posthog_api_key
POSTHOG_API_HOST=your_posthog_host # defaults to https://app.posthog.com
```

Note: PostHog analytics is optional and will be disabled in development mode. If you don't need product analytics, you can skip these environment variables.

## 5. Application Setup

1. Install dependencies:

```bash
pnpm install
```

2. Generate Directus types:

```bash
pnpm generate:types
```

3. Start the development server:

```bash
pnpm dev
```

4. Visit `http://localhost:3000` in your browser

## Common Issues and Troubleshooting

### CORS Issues
If you're running into CORS issues with Directus, ensure your Directus instance has CORS properly configured. For development, you can add the following to your Directus environment:

```env
CORS_ENABLED=true
CORS_ORIGIN=http://localhost:3000
```

### Authentication Issues
- Ensure your GitHub OAuth callback URL exactly matches your application setup
- Verify your Directus token has admin access
- Check that all environment variables are properly set

### Type Generation Issues
If you encounter issues with type generation:
1. Ensure Directus is running and accessible
2. Verify your DIRECTUS_URL and DIRECTUS_SERVER_TOKEN are correct
3. Try running type generation with verbose logging:

```bash
DEBUG=1 pnpm generate:types
```

## Production Deployment Checklist

Before deploying to production:

1. Update environment variables for production URLs
2. Update GitHub OAuth callback URLs for production
3. Configure proper CORS settings in Directus
4. Set up proper SSL certificates
5. Configure proper security headers
6. Set up proper database backups for Directus
7. Configure rate limiting for the API endpoints

# Development

1. Clone the repository

```bash
git clone https://github.com/directus-labs/os-santa.git
cd os-santa
```

2. Install dependencies

```bash
pnpm install
```

3. Start the development server

```bash
pnpm dev
```

4. Visit http://localhost:3000

# Deployment

The application can be deployed to any hosting platform that supports Nuxt 3. The backend requires a Directus instance with PostgreSQL.

## Frontend Deployment
- Vercel
- Netlify
- CloudFlare Pages

## Backend Deployment
- Self-hosted Directus
- Directus Cloud
- Docker (see docker-compose.yml for configuration)
