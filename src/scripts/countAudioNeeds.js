import { questions } from '../data/courseContent.js'

let totalKyrgyzText = new Set()
let questionCount = 0

for (const lessonQuestions of Object.values(questions)) {
  for (const q of lessonQuestions) {
    questionCount++

    // Add question text if in Kyrgyz (Cyrillic)
    if (q.question_text && /[\u0400-\u04FF]/.test(q.question_text)) {
      totalKyrgyzText.add(q.question_text)
    }

    // Add correct answer if Kyrgyz
    if (q.correct_answer && q.correct_answer !== 'matched' && /[\u0400-\u04FF]/.test(q.correct_answer)) {
      totalKyrgyzText.add(q.correct_answer)
    }

    // Add options
    if (Array.isArray(q.options)) {
      q.options.forEach(opt => {
        if (typeof opt === 'string' && /[\u0400-\u04FF]/.test(opt)) {
          totalKyrgyzText.add(opt)
        } else if (opt && opt.kyrgyz) {
          totalKyrgyzText.add(opt.kyrgyz)
        }
      })
    }
  }
}

console.log('\n📊 Audio Requirements Analysis:\n')
console.log(`Total questions: ${questionCount}`)
console.log(`Unique Kyrgyz texts needing audio: ${totalKyrgyzText.size}`)
console.log(`Currently generated: 48`)
console.log(`Missing audio files: ${totalKyrgyzText.size - 48}\n`)

// Show first 20 items
console.log('Sample of Kyrgyz texts:')
Array.from(totalKyrgyzText).slice(0, 20).forEach((text, i) => {
  console.log(`  ${i + 1}. ${text}`)
})
console.log(`  ... and ${totalKyrgyzText.size - 20} more\n`)
