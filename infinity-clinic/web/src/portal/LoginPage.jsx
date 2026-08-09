import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../shared/auth/AuthContext.jsx';
import { CLINIC } from '../public-site/clinicData.js';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const user = await login(email, password);
      navigate({
        admin: '/portal/admin',
        receptionist: '/portal/receptionist',
        doctor: '/portal/doctor',
        pharmacist: '/portal/pharmacy',
      }[user.role] || '/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card card">
        <div className="login-brand">
          <div className="brand-mark">∞</div>
          <h1>{CLINIC.name}</h1>
          <p className="text-body-sm">Staff Portal</p>
        </div>
        <form className="form" onSubmit={handleSubmit}>
          {error && <div className="alert-error">{error}</div>}
          <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
          <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
          <button type="submit" className="btn btn-primary btn-block">Sign In</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 24 }}><Link to="/">← Back to website</Link></p>
      </div>
    </div>
  );
}
