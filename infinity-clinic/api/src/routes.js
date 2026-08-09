import { Router } from 'express';
import publicWebsiteRoutes from './modules/website-content/public.routes.js';
import adminCmsRoutes from './modules/website-content/admin.routes.js';
import publicAppointmentRoutes from './modules/appointments/public.routes.js';
import portalAppointmentRoutes from './modules/appointments/portal.routes.js';
import authRoutes from './modules/auth/auth.routes.js';
import opdRoutes from './modules/opd-queue/opd.routes.js';
import paymentRoutes from './modules/payments/payments.routes.js';
import consultationRoutes from './modules/consultations/consultations.routes.js';
import prescriptionRoutes from './modules/prescriptions/prescriptions.routes.js';
import medicineTemplateRoutes from './modules/prescriptions/templates.routes.js';
import patientRoutes from './modules/patients/portal.routes.js';
import doctorRoutes from './modules/doctors/admin.routes.js';
import receptionistRoutes from './modules/receptionists/admin.routes.js';
import { publicSettingsRouter, adminSettingsRouter } from './modules/clinic-settings/settings.routes.js';
import metricsRoutes from './modules/admin/metrics.routes.js';
import pharmacyRoutes from './modules/pharmacy/pharmacy.routes.js';
import permissionsRoutes from './modules/permissions/admin.routes.js';

const router = Router();

// Public
router.use('/public/website', publicWebsiteRoutes);
router.use('/public/appointments', publicAppointmentRoutes);
router.use('/public/settings', publicSettingsRouter);

// Auth
router.use('/auth', authRoutes);

// Portal
router.use('/portal/opd', opdRoutes);
router.use('/portal/payments', paymentRoutes);
router.use('/portal/consultations', consultationRoutes);
router.use('/portal/prescriptions/templates', medicineTemplateRoutes);
router.use('/portal/prescriptions', prescriptionRoutes);
router.use('/portal/patients', patientRoutes);
router.use('/portal/appointments', portalAppointmentRoutes);

// Admin
router.use('/portal/admin/doctors', doctorRoutes);
router.use('/portal/admin/receptionists', receptionistRoutes);
router.use('/portal/admin/cms', adminCmsRoutes);
router.use('/portal/admin/settings', adminSettingsRouter);
router.use('/portal/admin/metrics', metricsRoutes);
router.use('/portal/pharmacy', pharmacyRoutes);
router.use('/portal/admin/permissions', permissionsRoutes);

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
