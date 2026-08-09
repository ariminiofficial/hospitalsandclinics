import { useLocation, useNavigate } from 'react-router-dom';

export default function BackButton({ fallback, label = 'Back', className = 'btn btn-secondary' }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    const hasHistory = location.key && location.key !== 'default';
    if (hasHistory) {
      navigate(-1);
    } else if (fallback) {
      navigate(fallback);
    } else {
      navigate(-1);
    }
  };

  return (
    <button type="button" className={className} onClick={handleBack}>
      ← {label}
    </button>
  );
}
