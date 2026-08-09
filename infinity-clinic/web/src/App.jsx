import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './shared/auth/AuthContext.jsx';
import PublicLayout from './public-site/PublicLayout.jsx';
import HomePage from './public-site/HomePage.jsx';
import AboutPage from './public-site/AboutPage.jsx';
import DoctorsPage from './public-site/DoctorsPage.jsx';
import ServicesPage from './public-site/ServicesPage.jsx';
import BookPage from './public-site/BookPage.jsx';
import ContactPage from './public-site/ContactPage.jsx';
import TestimonialsPage from './public-site/TestimonialsPage.jsx';
import PortalLayout from './portal/PortalLayout.jsx';
import LoginPage from './portal/LoginPage.jsx';
import ReceptionistDashboard from './portal/receptionist/ReceptionistDashboard.jsx';
import PatientsPage from './portal/receptionist/PatientsPage.jsx';
import WalkInPage from './portal/receptionist/WalkInPage.jsx';
import ReceptionistAppointmentsPage from './portal/receptionist/AppointmentsPage.jsx';
import DoctorDashboard from './portal/doctor/DoctorDashboard.jsx';
import DoctorAppointmentsPage from './portal/doctor/DoctorAppointmentsPage.jsx';
import DoctorPatientsPage from './portal/doctor/DoctorPatientsPage.jsx';
import DoctorPatientDetailPage from './portal/doctor/DoctorPatientDetailPage.jsx';
import DoctorHistoryPage from './portal/doctor/DoctorHistoryPage.jsx';
import AdminDashboard from './portal/admin/AdminDashboard.jsx';
import AdminDoctorsPage from './portal/admin/DoctorsPage.jsx';
import ReceptionistsPage from './portal/admin/ReceptionistsPage.jsx';
import AdminAppointmentsPage from './portal/admin/AdminAppointmentsPage.jsx';
import CmsPage from './portal/admin/CmsPage.jsx';
import SettingsPage from './portal/admin/SettingsPage.jsx';
import PharmacyDashboard from './portal/pharmacy/PharmacyDashboard.jsx';
import PharmacyHistoryPage from './portal/pharmacy/PharmacyHistoryPage.jsx';
import PermissionsPage from './portal/admin/PermissionsPage.jsx';
import './styles.css';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/doctors" element={<DoctorsPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/book" element={<BookPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/testimonials" element={<TestimonialsPage />} />
          </Route>

          <Route path="/portal/login" element={<LoginPage />} />

          <Route path="/portal/receptionist" element={<PortalLayout allowedRoles={['receptionist', 'admin']} />}>
            <Route index element={<ReceptionistDashboard />} />
            <Route path="patients" element={<PatientsPage />} />
            <Route path="appointments" element={<ReceptionistAppointmentsPage />} />
            <Route path="walk-in" element={<WalkInPage />} />
          </Route>

          <Route path="/portal/doctor" element={<PortalLayout allowedRoles={['doctor', 'admin']} />}>
            <Route index element={<DoctorDashboard />} />
            <Route path="appointments" element={<DoctorAppointmentsPage />} />
            <Route path="patients" element={<DoctorPatientsPage />} />
            <Route path="patients/:patientId" element={<DoctorPatientDetailPage />} />
            <Route path="history" element={<DoctorHistoryPage />} />
          </Route>

          <Route path="/portal/pharmacy" element={<PortalLayout allowedRoles={['pharmacist', 'admin']} />}>
            <Route index element={<PharmacyDashboard />} />
            <Route path="history" element={<PharmacyHistoryPage />} />
          </Route>

          <Route path="/portal/admin" element={<PortalLayout allowedRoles={['admin']} />}>
            <Route index element={<AdminDashboard />} />
            <Route path="doctors" element={<AdminDoctorsPage />} />
            <Route path="receptionists" element={<ReceptionistsPage />} />
            <Route path="appointments" element={<AdminAppointmentsPage />} />
            <Route path="cms" element={<CmsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="permissions" element={<PermissionsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
