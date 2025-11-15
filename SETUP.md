# Quick Setup Guide

## 1. Environment Variables

Create a `.env` file in the root directory:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key
VITE_DEEPSEEK_API_KEY=your_deepseek_api_key
```

### Getting API Keys:

**Supabase:**
1. Go to https://supabase.com
2. Create a new project
3. Go to Settings > API
4. Copy "Project URL" and "anon public" key

**ElevenLabs:**
1. Go to https://elevenlabs.io
2. Sign up for an account
3. Go to Profile Settings > API Keys
4. Generate and copy your API key

**DeepSeek:**
1. Go to https://platform.deepseek.com
2. Sign up for an account
3. Navigate to API Keys section
4. Generate and copy your API key

## 2. Set Up Supabase Database

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Copy all content from `supabase-schema.sql`
4. Paste and run it in the SQL Editor
5. Verify that tables and storage bucket are created

## 3. Run the App

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app will open at `http://localhost:3000`

## 4. Optional: Add PWA Icons

For mobile installation, add these icon files to `/public`:
- `icon-192.png` (192x192 pixels)
- `icon-512.png` (512x512 pixels)

You can use any Kyrgyz flag or language-related icon.

## Test the App

1. **Home Page:**
   - Try recording in English or Kyrgyz
   - Try text input
   - Check if translation and audio work

2. **Vocabulary Page:**
   - Enter an English word
   - Verify card generation with audio

3. **History Page:**
   - Check if translations appear
   - Test audio playback
   - Try deleting entries

## Troubleshooting

- **Build errors**: Make sure all dependencies are installed (`npm install`)
- **API errors**: Check that all API keys in `.env` are correct
- **Database errors**: Verify Supabase schema is set up correctly
- **Microphone access**: Use HTTPS or localhost (required for recording)

## Important Notes

- All API keys should be kept secret
- Never commit `.env` file to version control
- ElevenLabs and DeepSeek APIs are paid services (check pricing)
- Supabase has a free tier with limits

---

You're ready to start learning Kyrgyz! 🎉
