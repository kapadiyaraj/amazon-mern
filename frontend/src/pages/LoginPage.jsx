import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login, loading } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = location.state?.from?.pathname || '/';
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(form.email, form.password);
      toast.success('Welcome back! 👋');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password');
    }
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'var(--bg-light)' }}>
      <div className="card" style={{ width: '100%', maxWidth: 420, padding: 40 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800 }}>
            <span style={{ color: 'var(--amazon-dark)' }}>shop</span>
            <span style={{ color: 'var(--amazon-orange)' }}>mart</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 8, fontSize: 15 }}>Sign in to your account</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" className="form-control" placeholder="you@example.com"
              value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required autoFocus />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" className="form-control" placeholder="••••••••"
              value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ marginTop: 8, padding: '12px' }}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
        <div style={{ borderTop: '1px solid var(--border)', marginTop: 24, paddingTop: 20, textAlign: 'center', fontSize: 14, color: 'var(--text-secondary)' }}>
          New to ShopMart? <Link to="/register" style={{ color: '#0066c0', fontWeight: 600 }}>Create account</Link>
        </div>
      </div>
    </div>
  );
}
