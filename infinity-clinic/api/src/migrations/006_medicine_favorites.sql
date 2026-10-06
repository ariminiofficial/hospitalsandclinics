-- Migration 006: Add is_favorite to medicine_templates
ALTER TABLE medicine_templates ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_medicine_templates_favorite ON medicine_templates(doctor_id, is_favorite) WHERE is_favorite = true;
