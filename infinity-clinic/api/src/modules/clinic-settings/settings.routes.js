import { Router } from 'express';
import { query } from '../../config/db.js';
import { authenticate, authorize } from '../../middleware/auth.js';

export const publicSettingsRouter = Router();

publicSettingsRouter.get('/', async (req, res, next) => {
  try {
    const { rows } = await query('SELECT key, value FROM clinic_settings');
    const settings = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    res.json(settings);
  } catch (err) {
    next(err);
  }
});

export const adminSettingsRouter = Router();
adminSettingsRouter.use(authenticate, authorize('admin'));

adminSettingsRouter.get('/', async (req, res, next) => {
  try {
    const { rows } = await query('SELECT key, value, updated_at FROM clinic_settings ORDER BY key');
    const settings = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    res.json(settings);
  } catch (err) {
    next(err);
  }
});

adminSettingsRouter.put('/:key', async (req, res, next) => {
  try {
    const { value } = req.body;
    const { rows } = await query(
      `INSERT INTO clinic_settings (key, value) VALUES ($1, $2)
       ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()
       RETURNING *`,
      [req.params.key, JSON.stringify(value)]
    );
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});
