-- Pharmacy portal: pharmacist staff + prescription dispensing workflow

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check
  CHECK (role IN ('admin', 'doctor', 'receptionist', 'pharmacist'));

CREATE TABLE IF NOT EXISTS pharmacists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS pharmacy_status VARCHAR(20) NOT NULL DEFAULT 'draft'
  CHECK (pharmacy_status IN ('draft', 'pending', 'dispensing', 'dispensed', 'cancelled'));
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS dispensed_at TIMESTAMPTZ;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS dispensed_by UUID REFERENCES pharmacists(id);

CREATE INDEX IF NOT EXISTS idx_prescriptions_pharmacy_status ON prescriptions(pharmacy_status, created_at DESC);
