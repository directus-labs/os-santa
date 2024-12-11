<a href="https://directus.io" target="_blank">
  <h1 align="center">Open Source Santa</h1>
</a>

<img src="https://github.com/directus-labs/os-santa/blob/main/nuxt/public/images/screenshot.png?raw=true" alt="Open Source Santa screenshot" />

<p align="center">A fun holiday project that uses AI to generate personalized roast letters from Salty Open Source Santa based on your GitHub open source contributions. Find out if you're on the naughty or nice list! 🎅</p>

<p align="center"><em>Built with ❤️ by the <a href="https://github.com/directus/directus" target="_blank">Directus team</a></em></p>

<p align="center">
  <a href="#introduction"><strong>Introduction</strong></a> ·
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#tech-stack"><strong>Tech Stack</strong></a> ·
  <a href="#setup-guide"><strong>Setup Guide</strong></a> ·
</p>

<br/>

# Introduction

Open Source Santa is a playful web application that analyzes GitHub profiles and generates AI-powered "naughty or nice" letters from Santa. Whether you want to check your own open source karma or roast a friend, Santa's got opinions about everyone's commits!

# Features

- 🎅 Generate AI-powered roast letters from Santa based on GitHub public profile data
- 🎄 Check if you're on the naughty or nice list
- 🎁 Write letters for yourself or roast your friends
- 🌟 Beautiful particle snow effects and holiday theming
- 🔊 Fun sound effects
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
- [Directus](https://directus.io) - Backend + CMS (Admin)
- [Anthropic Claude](https://anthropic.com) - AI Text Generation
- [PostgreSQL](https://www.postgresql.org) - Database

# Setup Guide

## 0. Prerequisites

- [Node.js](https://nodejs.org) - v18.17.0 or higher
- [pnpm](https://pnpm.io) - v9.0.0 or higher
- [Docker](https://docker.com) - v25.0.0 or higher

Clone the repository and navigate to the root directory.

```bash
git clone https://github.com/directus-labs/os-santa.git
cd os-santa
```

## 1. Backend Setup (Directus)

<img src="https://directus.io/images/logo-dark.svg" alt="Directus Logo" width="200" />

We recommend you checkout the [Directus documentation](https://docs.directus.io/getting-started/quickstart/) for more information on how to setup and run Directus.

### Option A: Directus Cloud (Recommended for Quick Start)
1. Create an account at [Directus Cloud](https://directus.cloud?ref=directus-labs%2Fos-santa)
2. Create a new trial project - choose the build from scratch option
3. Once created, note your project URL and login credentials.
4. Run the `directus-template-cli` tool to apply the template to your project. Replace the values with your specific project URL and login credentials.

```bash
cd directus
```
```bash
npx directus-template-cli@latest apply --directusUrl="your_directus_url" --userEmail="your_email" --userPassword="your_password" --templateLocation="./template" --templateType="local"
```

5. Login to Directus and generate a static access token for the "Santa's Helper" user. Add to DIRECTUS_SERVER_TOKEN in .env file.

### Option B: Self-Hosted Setup
1. Ensure you have docker installed and running on your machine. [Install Docker](https://docs.docker.com/get-docker/)

2. Start the Directus instance using Docker:

```bash
cd directus
```

```bash
docker-compose up -d
```

3. Run the `directus-template-cli` tool to apply the template to your project. Replace the values with your specific project details.

```bash
npx directus-template-cli@latest apply --directusUrl="http://localhost:8055" --userEmail="admin@example.com" --userPassword="d1r3ctus" --templateLocation="./template" --templateType="local"
```

4. Login to Directus and generate a static access token for the "Santa's Helper" user. Save the token for the environment variables.

```env
DIRECTUS_SERVER_TOKEN=your_directus_token
```


## 2. GitHub OAuth Setup

<img src="https://github.githubassets.com/assets/GitHub-Logo-ee398b662d42.png" alt="GitHub Logo" width="200" />

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the application details:
   - Application name: "Open Source Santa" (or your preferred name)
   - Homepage URL: `http://localhost:3000` (development) or your production URL
   - Authorization callback URL: `http://localhost:3000/auth/github`
4. Save the Client ID and Client Secret for environment variables

```env
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

### Generating a GitHub Token for GraphQL API

1. Go to [GitHub Personal Access Tokens](https://github.com/settings/tokens)
2. Click "Generate new token"
3. Fill in the token details:
   - Note: "Open Source Santa GraphQL Access" (or your preferred note)
   - Expiration: Choose an appropriate expiration time
   - Repository access: Public Repositories (read-only)
5. Add the token to your environment variables:

```env
GITHUB_TOKEN=your_github_token
```

## 3. Anthropic API Setup

<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Anthropic_logo.svg/1600px-Anthropic_logo.svg.png" alt="Anthropic Logo" width="200" />

1. Create an account at [Anthropic](https://anthropic.com)
2. Generate an API key from [your dashboard](https://console.anthropic.com/settings/keys)
3. Save the API key for environment variables

```env
ANTHROPIC_API_KEY=your_anthropic_api_key
```

## 4. Frontend (Nuxt) Setup

<img src="https://nuxt.com/assets/design-kit/logo-green-black.svg" alt="Nuxt Logo" width="200" />

1. Install dependencies:

```bash
cd nuxt
```

```bash
pnpm i
```

2. Copy the example environment file:

```bash
cp .env.example .env
```

3. Fill in your environment variables:

```env
# Directus Configuration
DIRECTUS_URL=your_directus_url
DIRECTUS_SERVER_TOKEN=your_directus_token

# AI Generation
ANTHROPIC_API_KEY=your_anthropic_api_key

# Site Configuration
NUXT_PUBLIC_SITE_URL=http://localhost:3000
NUXT_SESSION_PASSWORD="password-with-at-least-32-characters"
SALT="some-random-salt-string"

# Authentication
GITHUB_TOKEN=your_github_token_for_graphql_api
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Analytics (Optional)
POSTHOG_API_KEY=your_posthog_api_key
POSTHOG_API_HOST=your_posthog_host
```

Note: PostHog analytics is optional and will be disabled in development mode. If you don't need product analytics, you can skip these environment variables.

4. Generate Directus types:

NOTE: Your Directus instance must be running for type generation to work.

```bash
pnpm generate:types
```

5. Start the development server:

```bash
pnpm dev
```

6. Visit `http://localhost:3000` in your browser

## Common Issues and Troubleshooting

### CORS Issues
If you're running into CORS issues with Directus, ensure your Directus instance has CORS properly configured. For development, you can add the following to your Directus environment:

Learn more about [CORS in Directus](https://docs.directus.io/self-hosted/config-options.html#cors).

```env
CORS_ENABLED=true
CORS_ORIGIN=http://localhost:3000
```

### Authentication Issues
- Ensure your GitHub OAuth callback URL exactly matches your application setup
- Verify your Directus token has admin access
- Check that all environment variables are properly set
