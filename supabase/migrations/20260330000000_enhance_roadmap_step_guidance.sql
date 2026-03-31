-- Add comprehensive guidance fields to roadmap_steps
ALTER TABLE roadmap_steps
ADD COLUMN IF NOT EXISTS time_estimate VARCHAR(50),
ADD COLUMN IF NOT EXISTS difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'medium', 'hard')),
ADD COLUMN IF NOT EXISTS prerequisites TEXT[],
ADD COLUMN IF NOT EXISTS resources JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS common_pitfalls TEXT[],
ADD COLUMN IF NOT EXISTS success_criteria TEXT;

-- Add comment to explain the fields
COMMENT ON COLUMN roadmap_steps.time_estimate IS 'Estimated time to complete (e.g., "30 minutes", "2 hours")';
COMMENT ON COLUMN roadmap_steps.difficulty IS 'Difficulty level: easy, medium, or hard';
COMMENT ON COLUMN roadmap_steps.prerequisites IS 'Array of prerequisite step titles or requirements';
COMMENT ON COLUMN roadmap_steps.resources IS 'JSON array of helpful resources/tools with name and url';
COMMENT ON COLUMN roadmap_steps.common_pitfalls IS 'Common mistakes to avoid';
COMMENT ON COLUMN roadmap_steps.success_criteria IS 'How to know when the step is completed successfully';
