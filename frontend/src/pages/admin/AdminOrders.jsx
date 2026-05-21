import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { Spinner } from '../../components/common/Spinner';
import { FiSearch } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './Admin.css';

const STATUS_OPTIONS = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
const STATUS_COLORS  = {
  Pending:    'badge-warning',
  Processing: 'badge-info',
  Shipped:    'badge-info',
  Delivered:  'badge-success',
  Cancelled:  'badge-danger',
};

export default function AdminOrders() {
  const [orders,   setOrders]   = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [filter,   setFilter]   = useState('All');
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    api.get('/admin/orders')
      .then(r => { setOrders(r.data.orders); setFiltered(r.data.orders); })
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = orders;
    if (filter !== 'All') result = result.filter(o => o.orderStatus === filter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(o =>
        o._id.toLowerCase().includes(q) ||
        o.user?.name?.toLowerCase().includes(q) ||
        o.user?.email?.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [search, filter, orders]);

  const updateStatus = async (orderId, status) => {
    setUpdating(orderId);
    try {
      const { data } = await api.put(`/admin/orders/${orderId}/status`, { status });
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, orderStatus: data.order.orderStatus } : o));
      toast.success(`Order marked as ${status}`);
    } catch { toast.error('Update failed'); }
    finally { setUpdating(null); }
  };

  const totalRevenue = filtered.filter(o => o.isPaid).reduce((sum, o) => sum + o.totalPrice, 0);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>Orders</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>
          {filtered.length} orders · ₹{totalRevenue.toLocaleString('en-IN')} revenue from filtered results
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative' }}>
          <FiSearch style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} size={14} />
          <input
            type="text" className="form-control" placeholder="Search by order ID or customer…"
            style={{ paddingLeft: 32, width: 280 }}
            value={search} onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['All', ...STATUS_OPTIONS].map(s => (
            <button key={s} className={`btn btn-sm ${filter === s ? 'btn-dark' : 'btn-outline'}`}
              onClick={() => setFilter(s)}>{s}</button>
          ))}
        </div>
      </div>

      {loading ? <Spinner /> : (
        <div className="admin-table-wrap">
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Update Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(order => (
                  <tr key={order._id}>
                    <td>
                      <Link to={`/orders/${order._id}`} style={{ color: '#0066c0', fontFamily: 'monospace', fontSize: 13, fontWeight: 600 }}>
                        #{order._id.slice(-8).toUpperCase()}
                      </Link>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500, fontSize: 14 }}>{order.user?.name || 'Deleted User'}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{order.user?.email}</div>
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ fontSize: 13 }}>{order.orderItems.length} item{order.orderItems.length > 1 ? 's' : ''}</td>
                    <td style={{ fontWeight: 700 }}>₹{order.totalPrice.toLocaleString('en-IN')}</td>
                    <td>
                      <div style={{ fontSize: 12, fontWeight: 600, color: order.isPaid ? 'var(--success)' : '#856404' }}>
                        {order.isPaid ? '✓ Paid' : order.paymentMethod === 'COD' ? 'COD - Pending' : '✗ Unpaid'}
                      </div>
                    </td>
                    <td><span className={`badge ${STATUS_COLORS[order.orderStatus]}`}>{order.orderStatus}</span></td>
                    <td>
                      <select
                        className="form-control"
                        style={{ fontSize: 13, padding: '6px 8px', minWidth: 130 }}
                        value={order.orderStatus}
                        onChange={e => updateStatus(order._id, e.target.value)}
                        disabled={updating === order._id || order.orderStatus === 'Delivered' || order.orderStatus === 'Cancelled'}
                      >
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-secondary)' }}>
                No orders match your filters
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
