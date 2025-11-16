import { generateSpeech } from '../services/elevenlabs.js'
import { uploadAudio } from '../services/supabase.js'
import { audioToGenerate } from '../data/courseContent.js'
import fs from 'fs'
import path from 'path'

// This script pre-generates all audio for course content
// Run with: node --experimental-modules src/scripts/generateAudio.js

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

async function generateAllAudio() {
  const audioMap = {}
  let successCount = 0
  let errorCount = 0

  console.log(`\n🎵 Starting audio generation for ${audioToGenerate.length} items...\n`)

  for (let i = 0; i < audioToGenerate.length; i++) {
    const text = audioToGenerate[i]
    const key = text.replace(/\s+/g, '_').toLowerCase()

    try {
      console.log(`[${i + 1}/${audioToGenerate.length}] Generating: "${text}"`)

      // Generate speech
      const { audioBlob, error: ttsError } = await generateSpeech(text, 'ky')

      if (ttsError) {
        throw new Error(`TTS failed: ${ttsError.message}`)
      }

      // Upload to Supabase
      const filename = `course-audio/${key}.mp3`
      const { url, error: uploadError } = await uploadAudio(audioBlob, filename)

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`)
      }

      audioMap[key] = url
      successCount++

      console.log(`✓ Uploaded: ${key} → ${url}`)

      // Rate limiting: wait 500ms between requests to avoid hitting API limits
      if (i < audioToGenerate.length - 1) {
        await delay(500)
      }

    } catch (error) {
      console.error(`✗ Error for "${text}": ${error.message}`)
      audioMap[key] = null
      errorCount++
    }
  }

  // Save audio map to JSON file
  const outputPath = path.join(process.cwd(), 'src/data/audioUrls.json')
  fs.writeFileSync(outputPath, JSON.stringify(audioMap, null, 2))

  console.log(`\n📊 Generation complete!`)
  console.log(`✓ Success: ${successCount}`)
  console.log(`✗ Errors: ${errorCount}`)
  console.log(`📁 Audio map saved to: ${outputPath}`)
  console.log(`\nNext steps:`)
  console.log(`1. Review the audioUrls.json file`)
  console.log(`2. Re-run for any failed items if needed`)
  console.log(`3. The URLs will be used when seeding the database\n`)
}

// Run the generation
generateAllAudio().catch(console.error)
