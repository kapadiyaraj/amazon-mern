import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { FiUser, FiPackage, FiLock, FiEdit2, FiCheck } from 'react-icons/fi';

export default function ProfilePage() {
  const { user, login } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [editing,   setEditing]   = useState(false);
  const [loading,   setLoading]   = useState(false);

  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '' });
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });

  const saveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.put('/auth/profile', { name: profile.name, email: profile.email });
      // Update local storage
      localStorage.setItem('user',  JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      toast.success('Profile updated!');
      setEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setLoading(false); }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (pwdForm.newPassword !== pwdForm.confirm) { toast.error('Passwords do not match'); return; }
    if (pwdForm.newPassword.length < 6)           { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await api.put('/auth/profile', { password: pwdForm.newPassword });
      toast.success('Password changed!');
      setPwdForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally { setLoading(false); }
  };

  const tabs = [
    { id: 'profile',  label: 'My Profile', icon: <FiUser /> },
    { id: 'orders',   label: 'My Orders',  icon: <FiPackage /> },
    { id: 'password', label: 'Password',   icon: <FiLock /> },
  ];

  return (
    <div className="container" style={{ paddingTop: 24, paddingBottom: 40 }}>
      <div className="page-header"><h1>My Account</h1></div>

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 24 }}>
        {/* Sidebar */}
        <div>
          {/* Avatar card */}
          <div className="card" style={{ padding: 24, textAlign: 'center', marginBottom: 16 }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--amazon-orange), var(--accent-orange))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 12px', fontSize: 28, fontWeight: 700, color: 'white'
            }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>{user?.name}</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{user?.email}</p>
            {user?.role === 'admin' && (
              <span className="badge badge-warning" style={{ marginTop: 8, display: 'inline-block' }}>Admin</span>
            )}
          </div>

          {/* Tab nav */}
          <div className="card" style={{ overflow: 'hidden' }}>
            {tabs.map((tab, i) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  width: '100%', padding: '14px 20px',
                  background: activeTab === tab.id ? '#fff8f0' : 'white',
                  border: 'none', borderLeft: activeTab === tab.id ? '3px solid var(--amazon-orange)' : '3px solid transparent',
                  borderBottom: i < tabs.length - 1 ? '1px solid var(--border)' : 'none',
                  cursor: 'pointer', fontSize: 14, fontWeight: activeTab === tab.id ? 600 : 400,
                  color: activeTab === tab.id ? 'var(--amazon-orange)' : 'var(--text-primary)',
                  transition: 'all 0.2s',
                }}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="card" style={{ padding: 32 }}>
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700 }}>Personal Information</h2>
                <button className="btn btn-outline btn-sm" onClick={() => setEditing(!editing)}>
                  {editing ? <><FiCheck /> Cancel</> : <><FiEdit2 /> Edit</>}
                </button>
              </div>

              {editing ? (
                <form onSubmit={saveProfile}>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" className="form-control" value={profile.name}
                      onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" className="form-control" value={profile.email}
                      onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} required />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Saving…' : 'Save Changes'}
                  </button>
                </form>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                  {[
                    { label: 'Full Name',   value: user?.name },
                    { label: 'Email',       value: user?.email },
                    { label: 'Account Type', value: user?.role === 'admin' ? 'Administrator' : 'Customer' },
                    { label: 'Member Since', value: new Date().getFullYear() },
                  ].map(item => (
                    <div key={item.label} style={{ padding: 16, background: 'var(--bg-light)', borderRadius: 8 }}>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>{item.label}</p>
                      <p style={{ fontSize: 15, fontWeight: 600 }}>{item.value}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Order History</h2>
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <FiPackage size={48} style={{ color: 'var(--border)', marginBottom: 16 }} />
                <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>View all your orders from one place</p>
                <Link to="/orders" className="btn btn-primary">Go to My Orders</Link>
              </div>
            </div>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 28 }}>Change Password</h2>
              <form onSubmit={changePassword} style={{ maxWidth: 400 }}>
                <div className="form-group">
                  <label>New Password</label>
                  <input type="password" className="form-control" placeholder="Min 6 characters"
                    value={pwdForm.newPassword}
                    onChange={e => setPwdForm(p => ({ ...p, newPassword: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input type="password" className="form-control" placeholder="Repeat new password"
                    value={pwdForm.confirm}
                    onChange={e => setPwdForm(p => ({ ...p, confirm: e.target.value }))} required />
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Updating…' : 'Update Password'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
