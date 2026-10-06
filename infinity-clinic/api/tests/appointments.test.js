import request from 'supertest';
import { app } from '../src/app.js';

describe('Public Appointment Endpoints', () => {
  it('GET /api/public/appointments/doctors/:doctorId/slots returns 400 when date is missing', async () => {
    const res = await request(app).get('/api/public/appointments/doctors/doc-123/slots');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('code', 'VALIDATION_ERROR');
    expect(res.body.error).toContain('Date is required');
  });

  it('GET /api/public/appointments/doctors/:doctorId/slots returns 400 for invalid date format', async () => {
    const res = await request(app).get('/api/public/appointments/doctors/doc-123/slots?date=invalid-date');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('code', 'VALIDATION_ERROR');
  });

  it('POST /api/public/appointments returns 400 when required payload fields are missing', async () => {
    const res = await request(app)
      .post('/api/public/appointments')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('code', 'VALIDATION_ERROR');
  });
});
