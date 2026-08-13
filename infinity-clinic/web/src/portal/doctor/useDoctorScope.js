import { useEffect, useState } from 'react';
import { useAuth } from '../../shared/auth/AuthContext.jsx';
import { api } from '../../shared/api/client.js';

const STORAGE_KEY = 'admin-doctor-view-id';

export function doctorQs(doctorId) {
  return doctorId ? `doctorId=${encodeURIComponent(doctorId)}` : '';
}

export function useDoctorScope() {
  const { user } = useAuth();
  const isAdminView = user?.role === 'admin';
  const [doctors, setDoctors] = useState([]);
  const [selectedId, setSelectedId] = useState(() => {
    if (!isAdminView) return user?.doctorId || '';
    try {
      return sessionStorage.getItem(STORAGE_KEY) || '';
    } catch {
      return '';
    }
  });

  useEffect(() => {
    if (!isAdminView) return undefined;
    let cancelled = false;
    api.get('/public/website/doctors')
      .then((docs) => {
        if (cancelled) return;
        setDoctors(docs);
        setSelectedId((current) => {
          if (current && docs.some((d) => d.id === current)) return current;
          const first = docs[0]?.id || '';
          if (first) {
            try { sessionStorage.setItem(STORAGE_KEY, first); } catch { /* ignore */ }
          }
          return first;
        });
      })
      .catch(console.error);
    return () => { cancelled = true; };
  }, [isAdminView]);

  const setDoctorId = (id) => {
    setSelectedId(id);
    if (isAdminView) {
      try { sessionStorage.setItem(STORAGE_KEY, id); } catch { /* ignore */ }
    }
  };

  const doctorId = isAdminView ? selectedId : (user?.doctorId || '');
  const selectedDoctor = doctors.find((d) => d.id === doctorId) || null;

  return { doctorId, doctors, isAdminView, setDoctorId, selectedDoctor };
}

export function DoctorPicker({ doctors, value, onChange }) {
  if (!doctors?.length) return null;
  return (
    <select
      className="portal-select"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Select doctor"
    >
      {doctors.map((d) => (
        <option key={d.id} value={d.id}>
          {d.full_name}{d.specialization ? ` · ${d.specialization}` : ''}
        </option>
      ))}
    </select>
  );
}
