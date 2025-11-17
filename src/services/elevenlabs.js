const env = import.meta.env ?? (typeof process !== 'undefined' ? process.env : {})
const ELEVENLABS_API_KEY = env.VITE_ELEVENLABS_API_KEY

// Speech-to-Text using ElevenLabs Scribe API
// Note: ElevenLabs STT requires a paid plan with Scribe access
// If you get 400 errors, your plan might not include STT or Kyrgyz might not be supported
export const transcribeAudio = async (audioBlob) => {
  try {
    const formData = new FormData()
    formData.append('file', audioBlob, 'recording.webm')
    formData.append('model_id', 'eleven_multilingual_v2')  // Required field
    formData.append('language', 'ky')  // Kyrgyz language code

    const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('ElevenLabs STT Error:', response.status, errorData)
      console.error('Note: ElevenLabs STT requires a paid plan with Scribe access')
      console.error('Consider using OpenAI Whisper API as an alternative for better Kyrgyz support')

      throw new Error(`STT not available. Status: ${response.status}. Please use text input instead or upgrade your ElevenLabs plan.`)
    }

    const result = await response.json()
    return { text: result.text, error: null }
  } catch (error) {
    console.error('Error transcribing audio:', error)
    return { text: null, error }
  }
}

// Text-to-Speech using ElevenLabs TTS API
export const generateSpeech = async (text, languageCode = 'ky') => {
  const voiceId = env.VITE_ELEVENLABS_VOICE_ID || 'pNInz6obpgDQGcFmaJgB'
  const modelId = env.VITE_ELEVENLABS_MODEL_ID || 'eleven_turbo_v2_5'

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text: text,
          model_id: modelId,
          voice_settings: {
            stability: 0.65,
            similarity_boost: 0.85,
            style: 0.4,
            use_speaker_boost: true,
          },
        }),
      }
    )

    if (!response.ok) {
      const errorData = await response.text()
      console.error('ElevenLabs API Error:', response.status, errorData)

      // If the custom voice fails, try with default voice
      if (voiceId !== 'pNInz6obpgDQGcFmaJgB') {
        console.log('Retrying with default voice...')
        return generateSpeechWithVoice(text, 'pNInz6obpgDQGcFmaJgB', 'eleven_multilingual_v2')
      }

      throw new Error(`API error: ${response.status} - ${errorData}`)
    }

    const audioBlob = await response.blob()
    return { audioBlob, error: null }
  } catch (error) {
    console.error('Error generating speech:', error)
    return { audioBlob: null, error }
  }
}

// Helper function to generate speech with specific voice and model
async function generateSpeechWithVoice(text, voiceId, modelId) {
  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text: text,
          model_id: modelId,
          voice_settings: {
            stability: 0.65,
            similarity_boost: 0.85,
            style: 0.4,
            use_speaker_boost: true,
          },
        }),
      }
    )

    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`Fallback API error: ${response.status} - ${errorData}`)
    }

    const audioBlob = await response.blob()
    return { audioBlob, error: null }
  } catch (error) {
    console.error('Error in fallback speech generation:', error)
    return { audioBlob: null, error }
  }
}

// Stream-based Speech-to-Text for real-time transcription
export class RealtimeTranscriber {
  constructor(onTranscript, onError) {
    this.ws = null
    this.onTranscript = onTranscript
    this.onError = onError
  }

  connect() {
    const wsUrl = `wss://api.elevenlabs.io/v1/speech-to-text/websocket?language=ky`

    this.ws = new WebSocket(wsUrl)

    this.ws.onopen = () => {
      console.log('WebSocket connected for STT')
      // Send API key authentication
      this.ws.send(JSON.stringify({
        type: 'auth',
        api_key: ELEVENLABS_API_KEY,
      }))
    }

    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data)

      if (message.type === 'transcript') {
        this.onTranscript(message.text)
      }
    }

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      this.onError(error)
    }

    this.ws.onclose = () => {
      console.log('WebSocket closed')
    }
  }

  sendAudio(audioData) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(audioData)
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
    }
  }
}
