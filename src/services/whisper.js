import OpenAI from 'openai'
import { normalizeToKyrgyz, containsKazakhCharacters } from './kyrgyzNormalizer'

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // Note: In production, proxy through your backend
})

// Convert WebM/PCM audio to WAV format for Whisper compatibility
const convertToWav = async (audioBlob) => {
  const arrayBuffer = await audioBlob.arrayBuffer()
  const audioContext = new (window.AudioContext || window.webkitAudioContext)()

  try {
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)

    // Convert to WAV format
    const wavBuffer = audioBufferToWav(audioBuffer)
    const wavBlob = new Blob([wavBuffer], { type: 'audio/wav' })

    console.log('✓ Converted audio:', audioBlob.size, 'bytes →', wavBlob.size, 'bytes WAV')
    await audioContext.close()

    return wavBlob
  } catch (error) {
    console.error('Error converting audio:', error)
    await audioContext.close()
    throw error
  }
}

// Helper function to convert AudioBuffer to WAV format
const audioBufferToWav = (audioBuffer) => {
  const numChannels = audioBuffer.numberOfChannels
  const sampleRate = audioBuffer.sampleRate
  const format = 1 // PCM
  const bitDepth = 16

  const bytesPerSample = bitDepth / 8
  const blockAlign = numChannels * bytesPerSample

  const data = []
  for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
    data.push(audioBuffer.getChannelData(i))
  }

  const interleaved = interleave(data)
  const dataLength = interleaved.length * bytesPerSample
  const buffer = new ArrayBuffer(44 + dataLength)
  const view = new DataView(buffer)

  // Write WAV header
  writeString(view, 0, 'RIFF')
  view.setUint32(4, 36 + dataLength, true)
  writeString(view, 8, 'WAVE')
  writeString(view, 12, 'fmt ')
  view.setUint32(16, 16, true) // fmt chunk size
  view.setUint16(20, format, true)
  view.setUint16(22, numChannels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * blockAlign, true)
  view.setUint16(32, blockAlign, true)
  view.setUint16(34, bitDepth, true)
  writeString(view, 36, 'data')
  view.setUint32(40, dataLength, true)

  // Write audio data
  floatTo16BitPCM(view, 44, interleaved)

  return buffer
}

const interleave = (channelData) => {
  const length = channelData[0].length
  const numChannels = channelData.length
  const result = new Float32Array(length * numChannels)

  for (let i = 0; i < length; i++) {
    for (let channel = 0; channel < numChannels; channel++) {
      result[i * numChannels + channel] = channelData[channel][i]
    }
  }

  return result
}

const writeString = (view, offset, string) => {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i))
  }
}

const floatTo16BitPCM = (view, offset, input) => {
  for (let i = 0; i < input.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, input[i]))
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true)
  }
}

// Transcribe audio using OpenAI Whisper
// Whisper has excellent Kyrgyz support with lower error rates than other services
// Note: Whisper auto-detects language - it supports 99 languages including Kyrgyz
export const transcribeWithWhisper = async (audioBlob, language = null) => {
  try {
    // Convert WebM/PCM to WAV for better Whisper compatibility
    console.log('Converting audio to WAV format...')
    const wavBlob = await convertToWav(audioBlob)

    const audioFile = new File([wavBlob], 'recording.wav', {
      type: 'audio/wav',
    })

    console.log('Sending to Whisper:', audioFile.size, 'bytes, type:', audioFile.type)

    // Whisper auto-detects language by default
    // Note: Whisper may use Kazakh orthography (і, ә) instead of Kyrgyz (и, э)
    // We'll correct this post-transcription since Kyrgyz and Kazakh are closely related
    const transcriptionParams = {
      file: audioFile,
      model: 'whisper-1',
      response_format: 'text',
    }

    // Specify language to avoid wrong script detection (e.g., Georgian instead of Cyrillic)
    if (language === 'en') {
      transcriptionParams.language = 'en'
    } else if (language === 'ky') {
      // Use Russian as proxy since Whisper doesn't support 'ky' code
      // This forces Cyrillic script and we normalize Kazakh chars after
      transcriptionParams.language = 'ru'
    }

    const transcription = await openai.audio.transcriptions.create(transcriptionParams)

    console.log('Whisper transcription (raw):', transcription)

    // Always correct Kazakh characters to Kyrgyz orthography when detected
    // This is necessary because Whisper often confuses Kyrgyz with Kazakh
    if (containsKazakhCharacters(transcription)) {
      const corrected = normalizeToKyrgyz(transcription)
      console.log('✓ Corrected to proper Kyrgyz orthography:', corrected)
      console.log('   (і→и, ә→э, ғ→г, қ→к, ұ→у, һ→х)')
      return { text: corrected, error: null }
    }

    return { text: transcription, error: null }
  } catch (error) {
    console.error('Error transcribing with Whisper:', error)
    return { text: null, error }
  }
}

// Alternative: Get detailed transcription with timestamps and detected language
export const transcribeWithWhisperDetailed = async (audioBlob, language = null) => {
  try {
    const audioFile = new File([audioBlob], 'recording.webm', {
      type: audioBlob.type,
    })

    const transcriptionParams = {
      file: audioFile,
      model: 'whisper-1',
      response_format: 'verbose_json',
      timestamp_granularities: ['word'],
    }

    // For English: specify language
    if (language === 'en') {
      transcriptionParams.language = 'en'
    }
    // For Kyrgyz: Let auto-detect, then correct orthography

    const transcription = await openai.audio.transcriptions.create(transcriptionParams)

    console.log('Detected language:', transcription.language)
    console.log('Raw transcription:', transcription.text)

    // Always correct Kazakh characters to proper Kyrgyz orthography
    let normalizedText = transcription.text
    let normalizedWords = transcription.words

    if (containsKazakhCharacters(transcription.text)) {
      normalizedText = normalizeToKyrgyz(transcription.text)
      console.log('✓ Corrected to Kyrgyz orthography:', normalizedText)

      // Normalize word-level transcriptions too
      if (normalizedWords) {
        normalizedWords = normalizedWords.map(word => ({
          ...word,
          word: normalizeToKyrgyz(word.word)
        }))
      }
    }

    return {
      text: normalizedText,
      words: normalizedWords,
      detectedLanguage: transcription.language,
      error: null
    }
  } catch (error) {
    console.error('Error transcribing with Whisper (detailed):', error)
    return { text: null, words: null, error }
  }
}
