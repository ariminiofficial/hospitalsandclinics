-- Migration: 005_payment_auditing.sql
-- Add audit tracking, transaction references, and audit logs for payments

-- 1. Modify payments table to support transaction references and audit state
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS transaction_ref VARCHAR(255),
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS audit_status VARCHAR(30) NOT NULL DEFAULT 'pending_audit',
  ADD COLUMN IF NOT EXISTS audited_by UUID REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS audited_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS audit_notes TEXT;

-- Update payments method check constraint to support additional payment modes
DO $$
BEGIN
  ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_method_check;
  ALTER TABLE payments ADD CONSTRAINT payments_method_check
    CHECK (method IN ('cash', 'card_offline', 'upi_offline', 'razorpay', 'net_banking', 'insurance'));
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- 2. Create payment audit logs table
CREATE TABLE IF NOT EXISTS payment_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL,
  performed_by UUID REFERENCES users(id),
  old_values JSONB,
  new_values JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_audit_logs_payment_id ON payment_audit_logs(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_audit_logs_created_at ON payment_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_audit_status ON payments(audit_status);
CREATE INDEX IF NOT EXISTS idx_payments_method ON payments(method);
CREATE INDEX IF NOT EXISTS idx_payments_paid_at ON payments(paid_at DESC);

-- 3. Seed initial audit log entries for existing completed payments
INSERT INTO payment_audit_logs (payment_id, appointment_id, action, performed_by, new_values, notes, created_at)
SELECT 
  p.id,
  p.appointment_id,
  'RECORDED',
  p.recorded_by,
  jsonb_build_object(
    'amount', p.amount,
    'method', p.method,
    'status', p.status,
    'transaction_ref', p.transaction_ref
  ),
  'Initial offline payment recorded',
  COALESCE(p.paid_at, p.created_at)
FROM payments p
WHERE NOT EXISTS (
  SELECT 1 FROM payment_audit_logs pal WHERE pal.payment_id = p.id
);
