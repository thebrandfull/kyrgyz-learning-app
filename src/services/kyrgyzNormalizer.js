// Normalize Kazakh characters to Kyrgyz equivalents
// Whisper sometimes detects Kyrgyz as Kazakh since they're closely related Turkic languages

const KAZAKH_TO_KYRGYZ_MAP = {
  'і': 'и', // Kazakh dotted i → Kyrgyz и
  'ә': 'э', // Kazakh ә → Kyrgyz э
  'ғ': 'г', // Kazakh ғ → Kyrgyz г
  'қ': 'к', // Kazakh қ → Kyrgyz к
  'ң': 'ң', // Same in both
  'ұ': 'у', // Kazakh ұ → Kyrgyz у
  'ү': 'ү', // Same in both
  'һ': 'х', // Kazakh һ → Kyrgyz х
  'ө': 'ө', // Same in both

  // Uppercase versions
  'І': 'И',
  'Ә': 'Э',
  'Ғ': 'Г',
  'Қ': 'К',
  'Ң': 'Ң',
  'Ұ': 'У',
  'Ү': 'Ү',
  'Һ': 'Х',
  'Ө': 'Ө',
}

export const normalizeToKyrgyz = (text) => {
  if (!text) return text

  let normalized = text

  // Replace each Kazakh character with its Kyrgyz equivalent
  Object.entries(KAZAKH_TO_KYRGYZ_MAP).forEach(([kazakh, kyrgyz]) => {
    const regex = new RegExp(kazakh, 'g')
    normalized = normalized.replace(regex, kyrgyz)
  })

  return normalized
}

// Check if text contains Kazakh-specific characters
export const containsKazakhCharacters = (text) => {
  if (!text) return false

  const kazakhSpecificChars = ['і', 'І', 'ә', 'Ә', 'ғ', 'Ғ', 'қ', 'Қ', 'ұ', 'Ұ', 'һ', 'Һ']
  return kazakhSpecificChars.some(char => text.includes(char))
}

// Get a user-friendly message about the conversion
export const getConversionMessage = (originalText, normalizedText) => {
  if (originalText === normalizedText) {
    return null
  }

  return 'Converted Kazakh characters to Kyrgyz equivalents'
}
