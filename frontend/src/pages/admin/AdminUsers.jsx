import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Spinner } from '../../components/common/Spinner';
import { FiTrash2, FiSearch, FiUser, FiShield } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './Admin.css';

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users,    setUsers]    = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    api.get('/admin/users')
      .then(r => { setUsers(r.data.users); setFiltered(r.data.users); })
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!search) { setFiltered(users); return; }
    const q = search.toLowerCase();
    setFiltered(users.filter(u =>
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    ));
  }, [search, users]);

  const handleDelete = async (id, name) => {
    if (id === currentUser._id) { toast.error("You can't delete your own account"); return; }
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers(prev => prev.filter(u => u._id !== id));
      toast.success('User deleted');
    } catch { toast.error('Delete failed'); }
    finally { setDeleting(null); }
  };

  const admins    = users.filter(u => u.role === 'admin').length;
  const customers = users.filter(u => u.role === 'user').length;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>Users</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>
          {users.length} total users · {admins} admin{admins !== 1 ? 's' : ''} · {customers} customer{customers !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Summary cards */}
      <div className="admin-stats" style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Users',  value: users.length,  icon: <FiUser />,   color: '#e3f2fd', iconColor: '#1565c0' },
          { label: 'Admins',       value: admins,         icon: <FiShield />, color: '#fce4ec', iconColor: '#c62828' },
          { label: 'Customers',    value: customers,      icon: <FiUser />,   color: '#e8f5e9', iconColor: '#2e7d32' },
        ].map(card => (
          <div key={card.label} className="stat-card">
            <div className="stat-icon" style={{ background: card.color, color: card.iconColor }}>{card.icon}</div>
            <div><div className="stat-value">{card.value}</div><div className="stat-label">{card.label}</div></div>
          </div>
        ))}
      </div>

      <div className="admin-table-wrap">
        <div className="admin-table-header">
          <span className="admin-table-title">All Users ({filtered.length})</span>
          <div style={{ position: 'relative' }}>
            <FiSearch style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} size={14} />
            <input
              type="text" className="form-control" placeholder="Search users…"
              style={{ paddingLeft: 32, width: 240 }}
              value={search} onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? <Spinner /> : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%',
                          background: u.role === 'admin'
                            ? 'linear-gradient(135deg, #c62828, #e53935)'
                            : 'linear-gradient(135deg, var(--amazon-orange), var(--accent-orange))',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'white', fontWeight: 700, fontSize: 14, flexShrink: 0,
                        }}>
                          {u.name[0].toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>
                            {u.name}
                            {u._id === currentUser._id && (
                              <span style={{ fontSize: 11, background: '#e8f5e9', color: 'var(--success)', padding: '2px 6px', borderRadius: 10, marginLeft: 8 }}>You</span>
                            )}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{u._id.slice(-8)}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: 14 }}>{u.email}</td>
                    <td>
                      <span className={`badge ${u.role === 'admin' ? 'badge-danger' : 'badge-success'}`}>
                        {u.role === 'admin' ? '🛡 Admin' : '👤 Customer'}
                      </span>
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                      {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(u._id, u.name)}
                        disabled={deleting === u._id || u._id === currentUser._id}
                        title={u._id === currentUser._id ? "Cannot delete your own account" : "Delete user"}
                      >
                        {deleting === u._id ? '…' : <FiTrash2 size={14} />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-secondary)' }}>No users found</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
