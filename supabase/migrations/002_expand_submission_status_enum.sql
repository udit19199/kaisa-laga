ALTER TYPE submission_status ADD VALUE IF NOT EXISTS 'accepted';
ALTER TYPE submission_status ADD VALUE IF NOT EXISTS 'processing';
ALTER TYPE submission_status ADD VALUE IF NOT EXISTS 'terminal_failed';
