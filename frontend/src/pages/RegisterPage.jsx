import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created! Welcome to ShopMart 🎉');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'var(--bg-light)' }}>
      <div className="card" style={{ width: '100%', maxWidth: 440, padding: 40 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800 }}>
            <span style={{ color: 'var(--amazon-dark)' }}>shop</span>
            <span style={{ color: 'var(--amazon-orange)' }}>mart</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 8, fontSize: 15 }}>Create your free account</p>
        </div>

        <form onSubmit={handleSubmit}>
          {[
            { key: 'name',     label: 'Full Name',        type: 'text',     placeholder: 'John Doe' },
            { key: 'email',    label: 'Email Address',    type: 'email',    placeholder: 'you@example.com' },
            { key: 'password', label: 'Password',         type: 'password', placeholder: 'Min 6 characters' },
            { key: 'confirm',  label: 'Confirm Password', type: 'password', placeholder: 'Repeat your password' },
          ].map(f => (
            <div key={f.key} className="form-group">
              <label>{f.label}</label>
              <input
                type={f.type}
                className="form-control"
                placeholder={f.placeholder}
                value={form[f.key]}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                required
              />
            </div>
          ))}

          <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ marginTop: 8, padding: '12px' }}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: 'var(--text-secondary)' }}>
          By creating an account, you agree to our{' '}
          <span style={{ color: '#0066c0', cursor: 'pointer' }}>Terms of Service</span>{' '}
          and{' '}
          <span style={{ color: '#0066c0', cursor: 'pointer' }}>Privacy Policy</span>.
        </div>

        <div style={{ borderTop: '1px solid var(--border)', marginTop: 24, paddingTop: 20, textAlign: 'center', fontSize: 14, color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#0066c0', fontWeight: 600 }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}
