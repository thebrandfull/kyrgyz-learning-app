SELECT 
  q.type,
  q.question_text,
  q.question_audio_url,
  l.title as lesson_title,
  c.title as course_title
FROM questions q
JOIN lessons l ON q.lesson_id = l.id
JOIN courses c ON l.course_id = c.id
WHERE q.type = 'listening'
LIMIT 5;
