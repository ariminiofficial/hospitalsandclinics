import { Router } from 'express';
import { z } from 'zod';
import { query } from '../../config/db.js';
import { redis, CMS_CACHE_PREFIX } from '../../config/redis.js';
import { authenticate, authorize } from '../../middleware/auth.js';
import { AppError } from '../../middleware/errorHandler.js';
import { serviceInput, testimonialInput, websiteContentInput } from '../../schema/index.js';

const router = Router();

router.use(authenticate);
router.use(authorize('admin'));

async function invalidateCmsCache() {
  const keys = await redis.keys(`${CMS_CACHE_PREFIX}*`);
  if (keys.length > 0) await redis.del(...keys);
}

// Website content sections
router.get('/content', async (req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM website_content ORDER BY section_key');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.put('/content/:sectionKey', async (req, res, next) => {
  try {
    const data = websiteContentInput.parse(req.body);
    const { rows } = await query(
      `INSERT INTO website_content (section_key, content, is_published)
       VALUES ($1, $2, $3)
       ON CONFLICT (section_key) DO UPDATE SET content = $2, is_published = $3, updated_at = NOW()
       RETURNING *`,
      [req.params.sectionKey, JSON.stringify(data.content), data.isPublished !== false]
    );
    await invalidateCmsCache();
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// Services
router.get('/services', async (req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM services ORDER BY sort_order, title');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

const serviceSchema = serviceInput;

router.post('/services', async (req, res, next) => {
  try {
    const data = serviceSchema.parse(req.body);
    const { rows } = await query(
      `INSERT INTO services (title, description, icon, is_published, sort_order)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [data.title, data.description || null, data.icon || null, data.isPublished !== false, data.sortOrder || 0]
    );
    await invalidateCmsCache();
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err instanceof z.ZodError) return next(new AppError('Invalid input', 400, 'VALIDATION_ERROR'));
    next(err);
  }
});

router.put('/services/:id', async (req, res, next) => {
  try {
    const data = serviceSchema.parse(req.body);
    const { rows } = await query(
      `UPDATE services SET title = $1, description = $2, icon = $3, is_published = $4, sort_order = $5
       WHERE id = $6 RETURNING *`,
      [data.title, data.description || null, data.icon || null, data.isPublished !== false, data.sortOrder || 0, req.params.id]
    );
    if (!rows[0]) throw new AppError('Service not found', 404, 'NOT_FOUND');
    await invalidateCmsCache();
    res.json(rows[0]);
  } catch (err) {
    if (err instanceof z.ZodError) return next(new AppError('Invalid input', 400, 'VALIDATION_ERROR'));
    next(err);
  }
});

router.delete('/services/:id', async (req, res, next) => {
  try {
    await query('DELETE FROM services WHERE id = $1', [req.params.id]);
    await invalidateCmsCache();
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// Testimonials
router.get('/testimonials', async (req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM testimonials ORDER BY sort_order');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

const testimonialSchema = testimonialInput;

router.post('/testimonials', async (req, res, next) => {
  try {
    const data = testimonialSchema.parse(req.body);
    const { rows } = await query(
      `INSERT INTO testimonials (patient_name, content, rating, is_published, sort_order)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [data.patientName, data.content, data.rating || null, data.isPublished !== false, data.sortOrder || 0]
    );
    await invalidateCmsCache();
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err instanceof z.ZodError) return next(new AppError('Invalid input', 400, 'VALIDATION_ERROR'));
    next(err);
  }
});

router.put('/testimonials/:id', async (req, res, next) => {
  try {
    const data = testimonialSchema.parse(req.body);
    const { rows } = await query(
      `UPDATE testimonials SET patient_name = $1, content = $2, rating = $3, is_published = $4, sort_order = $5
       WHERE id = $6 RETURNING *`,
      [data.patientName, data.content, data.rating || null, data.isPublished !== false, data.sortOrder || 0, req.params.id]
    );
    if (!rows[0]) throw new AppError('Testimonial not found', 404, 'NOT_FOUND');
    await invalidateCmsCache();
    res.json(rows[0]);
  } catch (err) {
    if (err instanceof z.ZodError) return next(new AppError('Invalid input', 400, 'VALIDATION_ERROR'));
    next(err);
  }
});

router.delete('/testimonials/:id', async (req, res, next) => {
  try {
    await query('DELETE FROM testimonials WHERE id = $1', [req.params.id]);
    await invalidateCmsCache();
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
