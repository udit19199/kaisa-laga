UPDATE storage.buckets
SET allowed_mime_types = ARRAY[
  'audio/webm',
  'audio/webm;codecs=opus',
  'audio/webm;codecs=vorbis',
  'audio/ogg',
  'audio/mp4',
  'audio/mpeg',
  'audio/wav',
  'video/mp4',
  'audio/aac',
  'audio/x-m4a',
  'audio/mp4;codecs=mp4a'
]
WHERE id = 'submissions-audio';
