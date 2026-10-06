import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import PaymentReceipt from '../portal/receptionist/PaymentReceipt.jsx';

vi.mock('../shared/api/client.js', () => ({
  api: {
    get: vi.fn().mockImplementation((url) => {
      if (url.includes('/receipt')) {
        return Promise.resolve({
          id: 'pay-12345',
          appointment_id: 'appt-101',
          patient_name: 'Aditya Roy',
          patient_phone: '9876543210',
          doctor_name: 'Dr. Sarah Connor',
          specialization: 'Cardiology',
          amount: 800,
          payment_method: 'cash',
          appointment_date: '2026-10-15',
          appointment_time: '10:30:00',
          paid_at: '2026-10-15T10:35:00Z',
          recorded_by_name: 'receptionist@infinityclinic.in',
        });
      }
      return Promise.resolve({});
    }),
  },
}));

describe('PaymentReceipt Component', () => {
  it('renders invoice details, patient name, and doctor information correctly', async () => {
    render(<PaymentReceipt appointmentId="appt-101" onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText(/Aditya Roy/i)).toBeInTheDocument();
    });

    expect(screen.getAllByText(/Dr. Sarah Connor/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/800/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Rupees Eight Hundred Only/i)).toBeInTheDocument();
  });
});
