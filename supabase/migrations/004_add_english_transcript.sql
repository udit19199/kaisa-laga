ALTER TABLE submissions
  ADD COLUMN IF NOT EXISTS english_transcript TEXT;

UPDATE submissions AS s
SET english_transcript = CASE
  WHEN s.english_transcript IS NOT NULL THEN s.english_transcript
  WHEN COALESCE(s.detected_language, '') ILIKE 'en%' THEN COALESCE(s.original_transcript, s.transcript, s.translated_transcript)
  WHEN COALESCE(o.primary_language, '') ILIKE 'en%' THEN COALESCE(s.translated_transcript, s.transcript, s.original_transcript)
  ELSE NULL
END
FROM organizations AS o
WHERE s.organization_id = o.id
  AND s.english_transcript IS NULL;
