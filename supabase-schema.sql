-- =====================================================
-- Unideb Ask - Questions & Wrong Answers Tracking
-- =====================================================
-- Simplified schema to track total questions and store wrong answers
-- =====================================================

-- Table to track all questions asked (for counting only)
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  chat_id TEXT NOT NULL,
  message_id TEXT NOT NULL UNIQUE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table to store questions flagged as wrong answers
CREATE TABLE IF NOT EXISTS wrong_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  chat_id TEXT NOT NULL,
  message_id TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  flagged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_questions_user_id ON questions(user_id);
CREATE INDEX IF NOT EXISTS idx_questions_created_at ON questions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_questions_message_id ON questions(message_id);

CREATE INDEX IF NOT EXISTS idx_wrong_answers_user_id ON wrong_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_wrong_answers_flagged_at ON wrong_answers(flagged_at DESC);
CREATE INDEX IF NOT EXISTS idx_wrong_answers_message_id ON wrong_answers(message_id);

-- Enable Row Level Security (RLS)
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE wrong_answers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for questions table
-- Allow inserting questions (authenticated and anonymous)
CREATE POLICY "Anyone can insert questions"
  ON questions FOR INSERT
  WITH CHECK (true);

-- Allow reading own questions
CREATE POLICY "Users can read their own questions"
  ON questions FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- RLS Policies for wrong_answers table
-- Allow authenticated users to flag wrong answers
CREATE POLICY "Authenticated users can flag wrong answers"
  ON wrong_answers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to read their own flagged answers
CREATE POLICY "Users can read their own flagged answers"
  ON wrong_answers FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Allow users to delete their own flags
CREATE POLICY "Users can delete their own flags"
  ON wrong_answers FOR DELETE
  USING (auth.uid() = user_id);

-- Comments for documentation
COMMENT ON TABLE questions IS 'Tracks all questions asked for counting total questions';
COMMENT ON TABLE wrong_answers IS 'Stores questions flagged as having wrong answers';
COMMENT ON COLUMN questions.message_id IS 'Unique message identifier to prevent duplicates';
COMMENT ON COLUMN wrong_answers.flagged_at IS 'Timestamp when the answer was flagged as wrong';
