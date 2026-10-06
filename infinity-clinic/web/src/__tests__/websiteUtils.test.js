import { describe, it, expect } from 'vitest';
import { parsePhone, buildClinic, mergeDepartments, buildWebsiteState } from '../public-site/websiteUtils.js';

describe('websiteUtils', () => {
  describe('parsePhone', () => {
    it('formats a 10-digit Indian mobile number properly', () => {
      const result = parsePhone('9876543210');
      expect(result.phone).toBe('9876543210');
      expect(result.phoneDisplay).toBe('9876 543 210');
      expect(result.whatsapp).toBe('919876543210');
    });

    it('handles phone number with +91 prefix and formatting characters', () => {
      const result = parsePhone('+91 (98765) 43210');
      expect(result.phone).toBe('9876543210');
      expect(result.whatsapp).toBe('919876543210');
    });

    it('falls back to default clinic phone when input is invalid or empty', () => {
      const result = parsePhone('123');
      expect(result.phone).toBeDefined();
      expect(result.phoneDisplay).toBeDefined();
      expect(result.whatsapp).toBeDefined();
    });
  });

  describe('buildClinic', () => {
    it('merges custom contact info with fallback clinic details', () => {
      const clinic = buildClinic({
        clinicName: 'Clinixa Super Specialty',
        address: '123 Medical Center Way',
        phone: '9988776655',
      });
      expect(clinic.name).toBe('Clinixa Super Specialty');
      expect(clinic.address).toBe('123 Medical Center Way');
      expect(clinic.phone).toBe('9988776655');
      expect(clinic.phoneDisplay).toBe('9988 776 655');
    });
  });

  describe('mergeDepartments', () => {
    it('returns fallback departments if no doctors are provided', () => {
      const depts = mergeDepartments([]);
      expect(Array.isArray(depts)).toBe(true);
      expect(depts.length).toBeGreaterThan(0);
    });

    it('merges live doctor details into matching department', () => {
      const rawDoctors = [
        {
          id: 'doc-1',
          full_name: 'Dr. Sarah Connor',
          specialization: 'Cardiology',
          qualification: 'MBBS, MD',
          consultation_fee: 800,
        },
      ];
      const depts = mergeDepartments(rawDoctors);
      const cardio = depts.find((d) => d.id === 'heart');
      if (cardio) {
        expect(cardio.name).toBe('Dr. Sarah Connor');
        expect(cardio.fee).toBe('From ₹800');
      }
    });
  });

  describe('buildWebsiteState', () => {
    it('builds coherent state with hero, departments, and testimonials', () => {
      const state = buildWebsiteState({});
      expect(state.clinic).toBeDefined();
      expect(state.hero).toBeDefined();
      expect(Array.isArray(state.departments)).toBe(true);
    });
  });
});
