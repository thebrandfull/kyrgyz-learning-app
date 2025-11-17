import { questions } from '../data/courseContent.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const kyrgyzTexts = new Set()

// Extract all unique Kyrgyz texts
for (const lessonQuestions of Object.values(questions)) {
  for (const q of lessonQuestions) {
    // Add question text if in Kyrgyz
    if (q.question_text && /[\u0400-\u04FF]/.test(q.question_text)) {
      kyrgyzTexts.add(q.question_text)
    }

    // Add correct answer if Kyrgyz (exclude 'matched')
    if (q.correct_answer && q.correct_answer !== 'matched' && /[\u0400-\u04FF]/.test(q.correct_answer)) {
      kyrgyzTexts.add(q.correct_answer)
    }

    // Add options
    if (Array.isArray(q.options)) {
      q.options.forEach(opt => {
        if (typeof opt === 'string' && /[\u0400-\u04FF]/.test(opt)) {
          kyrgyzTexts.add(opt)
        } else if (opt && opt.kyrgyz) {
          kyrgyzTexts.add(opt.kyrgyz)
        }
      })
    }

    // Add explanation if in Kyrgyz
    if (q.explanation && /[\u0400-\u04FF]/.test(q.explanation)) {
      kyrgyzTexts.add(q.explanation)
    }
  }
}

// Generate audioToGenerate array with keys
const audioToGenerate = []
const textsArray = Array.from(kyrgyzTexts).sort()

textsArray.forEach((text, index) => {
  // Use simple numeric key since Supabase doesn't accept Cyrillic in filenames
  const key = `kyrgyz_audio_${String(index).padStart(4, '0')}`

  audioToGenerate.push({
    key: key,
    text: text
  })
})

console.log(`\n✅ Extracted ${audioToGenerate.length} unique Kyrgyz texts\n`)

// Save to a new file
const outputPath = path.join(__dirname, '../data/audioToGenerateFull.js')
const content = `// Auto-generated list of all Kyrgyz texts needing audio
// Generated: ${new Date().toISOString()}
// Total items: ${audioToGenerate.length}

export const audioToGenerateFull = ${JSON.stringify(audioToGenerate, null, 2)}
`

fs.writeFileSync(outputPath, content)
console.log(`✅ Saved to ${outputPath}\n`)
console.log(`Next steps:`)
console.log(`1. Review the file`)
console.log(`2. Run: node --experimental-modules src/scripts/generateAllAudio.js`)
console.log(`3. Update database with new audio URLs\n`)
