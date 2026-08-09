import { Router } from 'express';
import { query } from '../../config/db.js';
import { redis, CMS_CACHE_PREFIX } from '../../config/redis.js';

const router = Router();
const CMS_CACHE_TTL = 300;

router.get('/content', async (req, res, next) => {
  try {
    const cacheKey = `${CMS_CACHE_PREFIX}all`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const { rows } = await query(
      `SELECT section_key, content FROM website_content WHERE is_published = true`
    );
    const content = Object.fromEntries(rows.map((r) => [r.section_key, r.content]));
    await redis.setex(cacheKey, CMS_CACHE_TTL, JSON.stringify(content));
    res.json(content);
  } catch (err) {
    next(err);
  }
});

router.get('/doctors', async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT id, full_name, specialization, qualification, bio, photo_url, consultation_fee
       FROM doctors WHERE is_active = true ORDER BY full_name`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get('/services', async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT id, title, description, icon FROM services
       WHERE is_published = true ORDER BY sort_order, title`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get('/testimonials', async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT id, patient_name, content, rating FROM testimonials
       WHERE is_published = true ORDER BY sort_order`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

export default router;
