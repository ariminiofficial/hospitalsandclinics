import request from 'supertest';
import { app } from '../src/app.js';

describe('Health and System Routes', () => {
  it('GET /api/health returns status 200 and ok payload', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('timestamp');
  });

  it('GET /api/nonexistent-route returns 404 with standard error envelope', async () => {
    const res = await request(app).get('/api/nonexistent-route');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body).toHaveProperty('code', 'ROUTE_NOT_FOUND');
  });
});
