# Deployment Guide

## Deploy to Vercel (Recommended)

Vercel is perfect for this app because it:
- Supports environment variables securely
- Has a generous free tier
- Deploys automatically on git push
- Provides HTTPS by default

### Method 1: Deploy via Vercel Dashboard (Easiest)

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "Add New Project"
3. Import your `kyrgyz-learning-app` repository
4. Vercel will auto-detect Vite settings
5. Add your environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_ELEVENLABS_API_KEY`
   - `VITE_ELEVENLABS_VOICE_ID`
   - `VITE_ELEVENLABS_MODEL_ID`
   - `VITE_DEEPSEEK_API_KEY`
   - `VITE_OPENAI_API_KEY`
6. Click "Deploy"

Your app will be live at `https://kyrgyz-learning-app.vercel.app` (or your custom domain)

### Method 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod

# Add environment variables via dashboard at vercel.com/dashboard
```

## Deploy to Netlify (Alternative)

1. Go to [netlify.com](https://netlify.com) and sign in with GitHub
2. Click "Add new site" → "Import an existing project"
3. Select your repository
4. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Add environment variables (same as above)
6. Click "Deploy"

## Important Notes

- **Never commit `.env` file** - It's already in `.gitignore`
- **Add all environment variables** in your deployment platform's dashboard
- **Browser API usage**: This app uses `dangerouslyAllowBrowser: true` for OpenAI. In production, consider proxying API calls through a backend to keep keys secure.

## Environment Variables Needed

Copy these from your `.env` file and add them in Vercel/Netlify dashboard:

```
VITE_SUPABASE_URL=your_value_here
VITE_SUPABASE_ANON_KEY=your_value_here
VITE_ELEVENLABS_API_KEY=your_value_here
VITE_ELEVENLABS_VOICE_ID=5dORE7Khzn5FlSDUvuHn
VITE_ELEVENLABS_MODEL_ID=eleven_multilingual_v2
VITE_DEEPSEEK_API_KEY=your_value_here
VITE_OPENAI_API_KEY=your_value_here
```
