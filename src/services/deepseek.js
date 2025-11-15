import axios from 'axios'

const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'

// Translate text between English and Kyrgyz
export const translateText = async (text, targetLanguage = 'kyrgyz') => {
  try {
    const systemPrompt =
      targetLanguage === 'kyrgyz'
        ? `You are a native Kyrgyz speaker and expert translator specializing in English to Kyrgyz translation.

IMPORTANT GUIDELINES:
- Translate to NATURAL, COLLOQUIAL Kyrgyz as actually spoken by native speakers
- Use authentic Kyrgyz expressions and idioms, NOT literal word-for-word translations
- Consider cultural context and how Kyrgyz people actually say things in daily conversation
- Use common greetings and phrases as they are genuinely used in Kyrgyzstan

COMMON PHRASE EXAMPLES (learn the pattern):
- "Hello" → "Салам" (not a literal translation, but what people actually say)
- "How are you?" → "Кандайсыз?" or "Кандай жаксың?" (informal)
- "Good morning" → "Кутман таң"
- "Thank you" → "Рахмат"
- "Goodbye" → "Кош болуңуз" or "Кош" (informal)
- "Please" → "Өтүнөмүн"
- "Yes" → "Ооба"
- "No" → "Жок"
- "I'm fine" → "Жакшы"
- "What's your name?" → "Атыңыз ким?"

Follow these natural patterns. Provide ONLY the authentic Kyrgyz translation without explanations.`
        : `You are a native Kyrgyz speaker and expert translator specializing in Kyrgyz to English translation.

IMPORTANT GUIDELINES:
- Understand Kyrgyz cultural context and idiomatic expressions
- Translate the MEANING and INTENT, not just literal words
- Recognize common Kyrgyz greetings and phrases
- Convert to natural, fluent English

COMMON KYRGYZ PHRASES (for reference):
- "Салам" → "Hello"
- "Кандайсыз?" → "How are you?"
- "Рахмат" → "Thank you"
- "Кош болуңуз" → "Goodbye"
- "Жакшы" → "Good/Fine/Okay"
- "Ооба" → "Yes"
- "Жок" → "No"

Understand the context and provide natural English. Provide ONLY the English translation without explanations.`

    const response = await axios.post(
      DEEPSEEK_API_URL,
      {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: text,
          },
        ],
        temperature: 0.4, // Slightly higher for more natural, less literal translations
        max_tokens: 500,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
        },
      }
    )

    const translation = response.data.choices[0].message.content.trim()
    return { translation, error: null }
  } catch (error) {
    console.error('Error translating text:', error)
    return { translation: null, error }
  }
}

// Generate vocabulary card data for a given English word
export const generateVocabularyCard = async (englishWord) => {
  try {
    const systemPrompt = `You are a native Kyrgyz speaker and language learning expert specializing in teaching Kyrgyz to English speakers.

For the given English word, provide:
1. The NATURAL Kyrgyz translation (as actually used by native speakers)
2. A clear, concise meaning/definition in English
3. A practical, conversational example sentence in English
4. The example translated to AUTHENTIC, NATURAL Kyrgyz (not literal translation)

IMPORTANT:
- Use real, colloquial Kyrgyz as spoken in daily conversation
- Avoid literal word-for-word translations
- Include cultural context where relevant
- Use common, everyday vocabulary

EXAMPLE FORMAT:
For "hello":
{
  "kyrgyz_word": "Салам",
  "meaning": "A common greeting used in Kyrgyzstan",
  "example_en": "Hello, how are you today?",
  "example_ky": "Салам, бүгүн кандайсыз?"
}

Format your response as JSON:
{
  "kyrgyz_word": "natural Kyrgyz word/phrase",
  "meaning": "clear definition in English",
  "example_en": "practical example sentence",
  "example_ky": "natural Kyrgyz translation of example"
}

Provide ONLY the JSON object, no additional text.`

    const response = await axios.post(
      DEEPSEEK_API_URL,
      {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: englishWord,
          },
        ],
        temperature: 0.5,
        max_tokens: 800,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
        },
      }
    )

    const content = response.data.choices[0].message.content.trim()

    // Extract JSON from potential markdown code blocks
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Invalid JSON response')
    }

    const cardData = JSON.parse(jsonMatch[0])
    return { cardData, error: null }
  } catch (error) {
    console.error('Error generating vocabulary card:', error)
    return { cardData: null, error }
  }
}
