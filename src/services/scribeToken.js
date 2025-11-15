// Generate single-use token for ElevenLabs Scribe
// NOTE: In production, this should be done on the server side
// For development, we're doing it client-side (not recommended for production)

const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY

export const generateScribeToken = async () => {
  try {
    const response = await fetch(
      'https://api.elevenlabs.io/v1/single-use-token/realtime_scribe',
      {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
        },
      }
    )

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Token generation error:', response.status, errorData)
      throw new Error(`Failed to generate token: ${response.status}`)
    }

    const data = await response.json()
    return { token: data.token, error: null }
  } catch (error) {
    console.error('Error generating Scribe token:', error)
    return { token: null, error }
  }
}
