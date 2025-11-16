// Complete course content for Kyrgyz learning
// Audio URLs will be populated after generation

export const courses = [
  {
    title: 'Alphabets & Sounds',
    description: 'Master the Kyrgyz alphabet and pronunciation basics',
    category: 'alphabets',
    difficulty: 1,
    icon_emoji: '🔤',
    order_index: 0,
  },
  {
    title: 'Numbers & Counting',
    description: 'Learn numbers, counting, and telling time in Kyrgyz',
    category: 'numbers',
    difficulty: 1,
    icon_emoji: '🔢',
    order_index: 1,
  },
  {
    title: 'Colors & Objects',
    description: 'Everyday colors and common objects around you',
    category: 'colors',
    difficulty: 1,
    icon_emoji: '🎨',
    order_index: 2,
  },
  {
    title: 'Family & Relationships',
    description: 'Family members, relationships, and greetings',
    category: 'family',
    difficulty: 2,
    icon_emoji: '👨‍👩‍👧‍👦',
    order_index: 3,
  },
  {
    title: 'Dining & Food',
    description: 'Food vocabulary, ordering, and dining etiquette',
    category: 'dining',
    difficulty: 2,
    icon_emoji: '🍽️',
    order_index: 4,
  },
  {
    title: 'Outdoor & Nature',
    description: 'Weather, seasons, and nature vocabulary',
    category: 'outdoor',
    difficulty: 2,
    icon_emoji: '🌳',
    order_index: 5,
  },
  {
    title: 'Social Situations',
    description: 'Greetings, introductions, and conversations',
    category: 'social',
    difficulty: 3,
    icon_emoji: '💬',
    order_index: 6,
  },
  {
    title: 'Daily Routines',
    description: 'Morning, evening, and everyday activities',
    category: 'daily',
    difficulty: 3,
    icon_emoji: '⏰',
    order_index: 7,
  },
]

export const lessons = {
  // COURSE 1: Alphabets & Sounds
  alphabets: [
    {
      title: 'Vowel Sounds',
      description: 'Learn the 8 vowel sounds in Kyrgyz',
      order_index: 0,
      points_value: 10,
      required_score: 70,
    },
    {
      title: 'Common Consonants',
      description: 'Practice basic consonant sounds',
      order_index: 1,
      points_value: 10,
      required_score: 70,
    },
    {
      title: 'Special Characters',
      description: 'Master Ң, Ү, Ө unique to Kyrgyz',
      order_index: 2,
      points_value: 15,
      required_score: 70,
    },
    {
      title: 'Reading Practice',
      description: 'Read simple Kyrgyz words',
      order_index: 3,
      points_value: 15,
      required_score: 70,
    },
  ],

  // COURSE 2: Numbers & Counting
  numbers: [
    {
      title: 'Numbers 1-10',
      description: 'Count from one to ten',
      order_index: 0,
      points_value: 10,
      required_score: 70,
    },
    {
      title: 'Numbers 11-20',
      description: 'Continue counting to twenty',
      order_index: 1,
      points_value: 10,
      required_score: 70,
    },
    {
      title: 'Tens (20-100)',
      description: 'Learn multiples of ten',
      order_index: 2,
      points_value: 15,
      required_score: 70,
    },
    {
      title: 'Telling Time',
      description: 'Ask and tell the time',
      order_index: 3,
      points_value: 15,
      required_score: 70,
    },
  ],

  // COURSE 3: Colors & Objects
  colors: [
    {
      title: 'Basic Colors',
      description: 'Primary and common colors',
      order_index: 0,
      points_value: 10,
      required_score: 70,
    },
    {
      title: 'Household Items',
      description: 'Things around your home',
      order_index: 1,
      points_value: 10,
      required_score: 70,
    },
    {
      title: 'Clothing',
      description: 'What you wear',
      order_index: 2,
      points_value: 15,
      required_score: 70,
    },
    {
      title: 'School & Office',
      description: 'Items at work and school',
      order_index: 3,
      points_value: 15,
      required_score: 70,
    },
  ],

  // COURSE 4: Family & Relationships
  family: [
    {
      title: 'Immediate Family',
      description: 'Parents, siblings, children',
      order_index: 0,
      points_value: 10,
      required_score: 70,
    },
    {
      title: 'Extended Family',
      description: 'Grandparents, aunts, uncles',
      order_index: 1,
      points_value: 10,
      required_score: 70,
    },
    {
      title: 'Family Interactions',
      description: 'Talking about your family',
      order_index: 2,
      points_value: 15,
      required_score: 70,
    },
    {
      title: 'Relationships',
      description: 'Friends, colleagues, neighbors',
      order_index: 3,
      points_value: 15,
      required_score: 70,
    },
  ],

  // COURSE 5: Dining & Food
  dining: [
    {
      title: 'Common Foods',
      description: 'Fruits, vegetables, meats',
      order_index: 0,
      points_value: 10,
      required_score: 70,
    },
    {
      title: 'Traditional Kyrgyz Dishes',
      description: 'Beshbarmak, shorpo, and more',
      order_index: 1,
      points_value: 15,
      required_score: 70,
    },
    {
      title: 'At the Restaurant',
      description: 'Ordering and dining out',
      order_index: 2,
      points_value: 15,
      required_score: 70,
    },
    {
      title: 'Cooking Conversations',
      description: 'Talking about food preparation',
      order_index: 3,
      points_value: 15,
      required_score: 70,
    },
  ],

  // COURSE 6: Outdoor & Nature
  outdoor: [
    {
      title: 'Weather Words',
      description: 'Sunny, rainy, snowy, windy',
      order_index: 0,
      points_value: 10,
      required_score: 70,
    },
    {
      title: 'Seasons',
      description: 'Spring, summer, fall, winter',
      order_index: 1,
      points_value: 10,
      required_score: 70,
    },
    {
      title: 'Nature & Animals',
      description: 'Mountains, rivers, and wildlife',
      order_index: 2,
      points_value: 15,
      required_score: 70,
    },
    {
      title: 'Outdoor Activities',
      description: 'Hiking, camping, sports',
      order_index: 3,
      points_value: 15,
      required_score: 70,
    },
  ],

  // COURSE 7: Social Situations
  social: [
    {
      title: 'Greetings & Goodbyes',
      description: 'Hello, goodbye, and pleasantries',
      order_index: 0,
      points_value: 10,
      required_score: 70,
    },
    {
      title: 'Introductions',
      description: 'Introducing yourself and others',
      order_index: 1,
      points_value: 15,
      required_score: 70,
    },
    {
      title: 'Small Talk',
      description: 'Casual conversations',
      order_index: 2,
      points_value: 15,
      required_score: 70,
    },
    {
      title: 'Polite Expressions',
      description: 'Thank you, please, excuse me',
      order_index: 3,
      points_value: 15,
      required_score: 70,
    },
  ],

  // COURSE 8: Daily Routines
  daily: [
    {
      title: 'Morning Routine',
      description: 'Waking up and getting ready',
      order_index: 0,
      points_value: 15,
      required_score: 70,
    },
    {
      title: 'Evening Routine',
      description: 'Dinner and bedtime',
      order_index: 1,
      points_value: 15,
      required_score: 70,
    },
    {
      title: 'Daily Activities',
      description: 'Work, shopping, errands',
      order_index: 2,
      points_value: 15,
      required_score: 70,
    },
    {
      title: 'Weekend Plans',
      description: 'Leisure and social activities',
      order_index: 3,
      points_value: 15,
      required_score: 70,
    },
  ],
}

// Questions for each lesson (will be expanded with actual content)
export const questions = {
  // Alphabets - Lesson 1: Vowel Sounds
  'alphabets-0': [
    {
      type: 'multiple_choice',
      question_text: 'Which of these is a Kyrgyz vowel?',
      correct_answer: 'А',
      options: ['А', 'Б', 'В', 'Г'],
      explanation: 'А (a) is one of the 8 vowels in Kyrgyz',
      points_value: 5,
      order_index: 0,
    },
    {
      type: 'listening',
      question_text: 'Listen and select the correct vowel:',
      question_audio_key: 'vowel_э',
      correct_answer: 'Э',
      options: ['Е', 'Э', 'И', 'Ы'],
      explanation: 'Э sounds like "e" in "bed"',
      points_value: 5,
      order_index: 1,
    },
    {
      type: 'matching',
      question_text: 'Match the vowels with their sounds:',
      correct_answer: 'matched',
      options: [
        { kyrgyz: 'А', sound: 'ah' },
        { kyrgyz: 'Э', sound: 'eh' },
        { kyrgyz: 'И', sound: 'ee' },
        { kyrgyz: 'О', sound: 'oh' },
      ],
      explanation: 'These are the basic vowel sounds',
      points_value: 10,
      order_index: 2,
    },
  ],

  // Numbers - Lesson 1: Numbers 1-10
  'numbers-0': [
    {
      type: 'multiple_choice',
      question_text: 'How do you say "one" in Kyrgyz?',
      correct_answer: 'бир',
      options: ['бир', 'эки', 'үч', 'төрт'],
      explanation: 'бир (bir) means "one"',
      points_value: 5,
      order_index: 0,
    },
    {
      type: 'listening',
      question_text: 'Listen to the number:',
      question_audio_key: 'number_беш',
      correct_answer: '5',
      options: ['3', '4', '5', '6'],
      explanation: 'беш (besh) means "five"',
      points_value: 5,
      order_index: 1,
    },
    {
      type: 'matching',
      question_text: 'Match the numbers:',
      correct_answer: 'matched',
      options: [
        { kyrgyz: 'бир', english: '1' },
        { kyrgyz: 'эки', english: '2' },
        { kyrgyz: 'үч', english: '3' },
        { kyrgyz: 'төрт', english: '4' },
        { kyrgyz: 'беш', english: '5' },
      ],
      explanation: 'Numbers 1-5 in Kyrgyz',
      points_value: 10,
      order_index: 2,
    },
    {
      type: 'sentence_builder',
      question_text: 'Form the sentence: "I have three books"',
      correct_answer: 'Менде үч китеп бар',
      options: ['Менде', 'үч', 'китеп', 'бар'],
      explanation: 'Менде = I have, үч = three, китеп = book, бар = there is/are',
      points_value: 10,
      order_index: 3,
    },
  ],

  // Family - Lesson 1: Immediate Family
  'family-0': [
    {
      type: 'multiple_choice',
      question_text: 'How do you say "mother" in Kyrgyz?',
      correct_answer: 'апа',
      options: ['апа', 'ата', 'эже', 'ини'],
      explanation: 'апа (apa) means "mother"',
      points_value: 5,
      order_index: 0,
    },
    {
      type: 'listening',
      question_text: 'Listen and identify the family member:',
      question_audio_key: 'family_ата',
      correct_answer: 'father',
      options: ['mother', 'father', 'sister', 'brother'],
      explanation: 'ата (ata) means "father"',
      points_value: 5,
      order_index: 1,
    },
    {
      type: 'matching',
      question_text: 'Match family members:',
      correct_answer: 'matched',
      options: [
        { kyrgyz: 'апа', english: 'mother' },
        { kyrgyz: 'ата', english: 'father' },
        { kyrgyz: 'эже', english: 'older sister' },
        { kyrgyz: 'ага', english: 'older brother' },
      ],
      explanation: 'Basic family terms in Kyrgyz',
      points_value: 10,
      order_index: 2,
    },
    {
      type: 'sentence_builder',
      question_text: 'Form: "This is my mother"',
      correct_answer: 'Бул менин апам',
      options: ['Бул', 'менин', 'апам'],
      explanation: 'Бул = this, менин = my, апам = my mother',
      points_value: 10,
      order_index: 3,
    },
  ],

  // Dining - Lesson 1: Common Foods
  'dining-0': [
    {
      type: 'multiple_choice',
      question_text: 'What is "тамак" in English?',
      correct_answer: 'food',
      options: ['water', 'food', 'bread', 'meat'],
      explanation: 'тамак (tamak) means "food"',
      points_value: 5,
      order_index: 0,
    },
    {
      type: 'listening',
      question_text: 'Listen to the food word:',
      question_audio_key: 'food_нан',
      correct_answer: 'bread',
      options: ['bread', 'meat', 'rice', 'water'],
      explanation: 'нан (nan) means "bread"',
      points_value: 5,
      order_index: 1,
    },
    {
      type: 'matching',
      question_text: 'Match the foods:',
      correct_answer: 'matched',
      options: [
        { kyrgyz: 'нан', english: 'bread' },
        { kyrgyz: 'эт', english: 'meat' },
        { kyrgyz: 'сүт', english: 'milk' },
        { kyrgyz: 'суу', english: 'water' },
      ],
      explanation: 'Common food and drink words',
      points_value: 10,
      order_index: 2,
    },
  ],

  // Social - Lesson 1: Greetings
  'social-0': [
    {
      type: 'multiple_choice',
      question_text: 'How do you greet someone in Kyrgyz?',
      correct_answer: 'Салам',
      options: ['Салам', 'Рахмат', 'Кош', 'Жок'],
      explanation: 'Салам (salam) means "hello"',
      points_value: 5,
      order_index: 0,
    },
    {
      type: 'listening',
      question_text: 'Listen to the greeting:',
      question_audio_key: 'greeting_кандайсыз',
      correct_answer: 'How are you?',
      options: ['Hello', 'How are you?', 'Goodbye', 'Thank you'],
      explanation: 'Кандайсыз? means "How are you?" (formal)',
      points_value: 5,
      order_index: 1,
    },
    {
      type: 'sentence_builder',
      question_text: 'Form: "How are you?"',
      correct_answer: 'Кандайсыз',
      options: ['Кандайсыз'],
      explanation: 'Кандайсыз is the polite way to ask how someone is',
      points_value: 10,
      order_index: 2,
    },
  ],
}

// Audio generation map - unique Kyrgyz words that need audio
export const audioToGenerate = [
  // Vowels
  'А', 'Э', 'О', 'Ө', 'У', 'Ү', 'Ы', 'И',

  // Numbers 1-20
  'бир', 'эки', 'үч', 'төрт', 'беш', 'алты', 'жети', 'сегиз', 'тогуз', 'он',
  'он бир', 'он эки', 'он үч', 'он төрт', 'он беш', 'он алты', 'он жети', 'он сегиз', 'он тогуз', 'жыйырма',

  // Family
  'апа', 'ата', 'эже', 'ага', 'ини', 'сиңди', 'таята', 'чоң апа', 'чоң ата',

  // Food
  'тамак', 'нан', 'эт', 'сүт', 'суу', 'жашылча', 'жемиш',

  // Greetings
  'Салам', 'Кандайсыз', 'Рахмат', 'Кош болуңуз', 'Жакшы',

  // Sentences
  'Менде үч китеп бар',
  'Бул менин апам',
  'Кандайсыз',
]
