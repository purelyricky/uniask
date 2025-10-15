-- =====================================================
-- Unideb Ask - Questions & Wrong Answers Tracking
-- =====================================================
-- This schema creates tables to track all questions asked
-- and questions flagged as having wrong answers.
-- =====================================================

-- Table to track all questions asked
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  chat_id TEXT NOT NULL,
  message_id TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table to track questions flagged as wrong answers
CREATE TABLE IF NOT EXISTS wrong_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  chat_id TEXT NOT NULL,
  message_id TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  flagged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_questions_user_id ON questions(user_id);
CREATE INDEX IF NOT EXISTS idx_questions_chat_id ON questions(chat_id);
CREATE INDEX IF NOT EXISTS idx_questions_message_id ON questions(message_id);
CREATE INDEX IF NOT EXISTS idx_questions_created_at ON questions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_wrong_answers_user_id ON wrong_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_wrong_answers_chat_id ON wrong_answers(chat_id);
CREATE INDEX IF NOT EXISTS idx_wrong_answers_message_id ON wrong_answers(message_id);
CREATE INDEX IF NOT EXISTS idx_wrong_answers_flagged_at ON wrong_answers(flagged_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE wrong_answers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for questions table
-- Users can read all questions (for statistics)
CREATE POLICY "Anyone can view questions statistics"
  ON questions FOR SELECT
  USING (true);

-- Users can insert their own questions
CREATE POLICY "Users can insert their own questions"
  ON questions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own questions
CREATE POLICY "Users can update their own questions"
  ON questions FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own questions
CREATE POLICY "Users can delete their own questions"
  ON questions FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for wrong_answers table
-- Users can read all wrong answers (for statistics and display)
CREATE POLICY "Anyone can view wrong answers"
  ON wrong_answers FOR SELECT
  USING (true);

-- Users can insert wrong answer flags
CREATE POLICY "Users can flag wrong answers"
  ON wrong_answers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own flags
CREATE POLICY "Users can delete their own flags"
  ON wrong_answers FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at on questions table
CREATE TRIGGER update_questions_updated_at
  BEFORE UPDATE ON questions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create a view for statistics (optional, for easier querying)
CREATE OR REPLACE VIEW question_statistics AS
SELECT
  COUNT(DISTINCT q.id) as total_questions,
  COUNT(DISTINCT wa.id) as total_wrong_answers,
  ROUND((COUNT(DISTINCT wa.id)::NUMERIC / NULLIF(COUNT(DISTINCT q.id), 0)) * 100, 2) as wrong_answer_percentage
FROM questions q
LEFT JOIN wrong_answers wa ON q.message_id = wa.message_id;

-- Grant access to the view
GRANT SELECT ON question_statistics TO authenticated;
GRANT SELECT ON question_statistics TO anon;

-- Comments for documentation
COMMENT ON TABLE questions IS 'Tracks all questions asked in the system';
COMMENT ON TABLE wrong_answers IS 'Tracks questions that were flagged as having wrong answers';
COMMENT ON COLUMN questions.user_id IS 'Reference to the user who asked the question';
COMMENT ON COLUMN questions.chat_id IS 'ID of the chat session';
COMMENT ON COLUMN questions.message_id IS 'Unique message identifier';
COMMENT ON COLUMN wrong_answers.flagged_at IS 'Timestamp when the answer was flagged as wrong';
