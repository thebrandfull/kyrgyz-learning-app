# Kyrgyz Learning Assistant

A mobile-friendly web application for learning Kyrgyz language with high-quality speech recognition and pronunciation.

## Features

- **Bidirectional Translation**: Translate between English and Kyrgyz
- **Voice Recording**: Record speech in either language using OpenAI Whisper (best Kyrgyz accuracy) or ElevenLabs Scribe
- **Text Input**: Type text for translation
- **Perfect Pronunciation**: Generate native Kyrgyz audio using ElevenLabs TTS with Kazakh voice (linguistically close to Kyrgyz)
- **Transcript Editing**: Review and correct speech recognition before translation
- **Translation History**: Save and review all your translations
- **Vocabulary Cards**: Create flashcards with example sentences and audio
- **Orthography Correction**: Automatically converts Kazakh characters to proper Kyrgyz orthography

## Technologies

- **Frontend**: React 18 + Vite
- **Styling**: TailwindCSS
- **Speech-to-Text**: OpenAI Whisper API / ElevenLabs Scribe
- **Text-to-Speech**: ElevenLabs TTS
- **Translation**: DeepSeek AI (optimized for natural Kyrgyz)
- **Database**: Supabase (PostgreSQL + Storage)

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example` and add your API keys:
   - Supabase project URL and anon key
   - ElevenLabs API key
   - DeepSeek API key
   - OpenAI API key

4. Set up Supabase database using the schema in `supabase-schema.sql`

5. Run the development server:
   ```bash
   npm run dev
   ```

## API Keys Required

- **Supabase**: Free tier available at [supabase.com](https://supabase.com)
- **ElevenLabs**: For TTS and optional Scribe STT at [elevenlabs.io](https://elevenlabs.io)
- **DeepSeek**: For translation at [deepseek.com](https://deepseek.com)
- **OpenAI**: For Whisper STT at [openai.com](https://openai.com)

## Audio Recording

The app uses high-quality audio capture (48kHz sample rate, PCM codec) and converts to WAV format for optimal Whisper transcription accuracy. Noise suppression is disabled to preserve word endings.

## Kyrgyz Orthography

Whisper sometimes transcribes Kyrgyz using Kazakh orthography (і, ә, ғ, қ, ұ, һ). The app automatically normalizes these to proper Kyrgyz characters (и, э, г, к, у, х).

## License

MIT
