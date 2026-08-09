-- Doctor's saved medicine presets (reused across patients)
CREATE TABLE IF NOT EXISTS medicine_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  medicine_name VARCHAR(255) NOT NULL,
  dose VARCHAR(50),
  times_per_day SMALLINT,
  timing_morning BOOLEAN NOT NULL DEFAULT false,
  timing_afternoon BOOLEAN NOT NULL DEFAULT false,
  timing_evening BOOLEAN NOT NULL DEFAULT false,
  timing_night BOOLEAN NOT NULL DEFAULT false,
  duration VARCHAR(50),
  instructions TEXT,
  use_count INT NOT NULL DEFAULT 1,
  last_used_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (doctor_id, medicine_name)
);

CREATE INDEX IF NOT EXISTS idx_medicine_templates_doctor ON medicine_templates(doctor_id, last_used_at DESC);

-- Structured fields on prescription line items (dosage/frequency still populated for print compat)
ALTER TABLE prescription_items ADD COLUMN IF NOT EXISTS dose VARCHAR(50);
ALTER TABLE prescription_items ADD COLUMN IF NOT EXISTS times_per_day SMALLINT;
ALTER TABLE prescription_items ADD COLUMN IF NOT EXISTS timing_morning BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE prescription_items ADD COLUMN IF NOT EXISTS timing_afternoon BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE prescription_items ADD COLUMN IF NOT EXISTS timing_evening BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE prescription_items ADD COLUMN IF NOT EXISTS timing_night BOOLEAN NOT NULL DEFAULT false;
