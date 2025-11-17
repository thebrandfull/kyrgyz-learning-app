// Generate audio for ALL Kyrgyz text in course content
import { generateSpeech } from '../services/elevenlabs.js'
import { uploadAudio } from '../services/supabase.js'
import { audioToGenerateFull } from '../data/audioToGenerateFull.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

async function generateAllAudio() {
  const audioMap = {}
  let successCount = 0
  let errorCount = 0
  const errors = []

  console.log(`\n🎵 Starting audio generation for ${audioToGenerateFull.length} items...\n`)
  console.log(`⏱️  Estimated time: ~${Math.ceil(audioToGenerateFull.length * 2.5 / 60)} minutes\n`)

  for (let i = 0; i < audioToGenerateFull.length; i++) {
    const item = audioToGenerateFull[i]
    const { key, text } = item

    try {
      console.log(`[${i + 1}/${audioToGenerateFull.length}] Generating: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`)

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

      console.log(`✓ ${key}`)

      // Rate limiting: wait 500ms between requests
      if (i < audioToGenerateFull.length - 1) {
        await delay(500)
      }

      // Save progress every 50 items
      if ((i + 1) % 50 === 0) {
        const outputPath = path.join(process.cwd(), 'src/data/audioUrlsFull.json')
        fs.writeFileSync(outputPath, JSON.stringify(audioMap, null, 2))
        console.log(`\n💾 Progress saved (${i + 1}/${audioToGenerateFull.length})\n`)
      }

    } catch (error) {
      console.error(`✗ Error for "${text.substring(0, 30)}": ${error.message}`)
      errors.push({ key, text, error: error.message })
      errorCount++
    }
  }

  // Save final audio map
  const outputPath = path.join(process.cwd(), 'src/data/audioUrlsFull.json')
  fs.writeFileSync(outputPath, JSON.stringify(audioMap, null, 2))

  console.log(`\n📊 Generation complete!`)
  console.log(`✓ Success: ${successCount}`)
  console.log(`✗ Errors: ${errorCount}`)
  console.log(`📁 Audio map saved to: ${outputPath}`)

  if (errors.length > 0) {
    const errorsPath = path.join(process.cwd(), 'src/data/audioErrors.json')
    fs.writeFileSync(errorsPath, JSON.stringify(errors, null, 2))
    console.log(`⚠️  Errors saved to: ${errorsPath}`)
  }

  console.log(`\nNext steps:`)
  console.log(`1. Review the audioUrlsFull.json file`)
  console.log(`2. If there were errors, retry failed items`)
  console.log(`3. Run database update script to attach URLs to questions\n`)
}

// Run the generation
generateAllAudio().catch(console.error)
