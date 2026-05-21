import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { Spinner } from '../../components/common/Spinner';
import { FiShoppingBag, FiPackage, FiUsers, FiDollarSign, FiTrendingUp } from 'react-icons/fi';
import './Admin.css';

const STATUS_COLORS = {
  Pending:    'badge-warning',
  Processing: 'badge-info',
  Shipped:    'badge-info',
  Delivered:  'badge-success',
  Cancelled:  'badge-danger',
};

export default function AdminDashboard() {
  const [stats,   setStats]   = useState(null);
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/admin/stats'),
      api.get('/admin/orders'),
    ]).then(([statsRes, ordersRes]) => {
      setStats(statsRes.data.stats);
      setOrders(ordersRes.data.orders.slice(0, 8));
    }).catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  const STAT_CARDS = [
    { label: 'Total Revenue',  value: `₹${(stats?.totalRevenue || 0).toLocaleString('en-IN')}`, icon: <FiDollarSign />, color: '#e8f5e9', iconColor: '#2e7d32' },
    { label: 'Total Orders',   value: stats?.totalOrders   || 0, icon: <FiShoppingBag />, color: '#e3f2fd', iconColor: '#1565c0' },
    { label: 'Total Products', value: stats?.totalProducts || 0, icon: <FiPackage />,     color: '#fff8e1', iconColor: '#f57f17' },
    { label: 'Total Users',    value: stats?.totalUsers    || 0, icon: <FiUsers />,       color: '#fce4ec', iconColor: '#c62828' },
  ];

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats */}
      <div className="admin-stats">
        {STAT_CARDS.map(card => (
          <div key={card.label} className="stat-card">
            <div className="stat-icon" style={{ background: card.color, color: card.iconColor }}>
              {card.icon}
            </div>
            <div>
              <div className="stat-value">{card.value}</div>
              <div className="stat-label">{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="admin-table-wrap">
        <div className="admin-table-header">
          <span className="admin-table-title">Recent Orders</span>
          <Link to="/admin/orders" className="btn btn-outline btn-sm">View All Orders</Link>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order._id}>
                  <td>
                    <Link to={`/orders/${order._id}`} style={{ color: '#0066c0', fontFamily: 'monospace', fontSize: 13 }}>
                      #{order._id.slice(-8).toUpperCase()}
                    </Link>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{order.user?.name || 'N/A'}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{order.user?.email}</div>
                  </td>
                  <td>{order.orderItems.length} item{order.orderItems.length > 1 ? 's' : ''}</td>
                  <td style={{ fontWeight: 600 }}>₹{order.totalPrice.toLocaleString('en-IN')}</td>
                  <td>
                    <span style={{ fontSize: 12, color: order.isPaid ? 'var(--success)' : 'var(--error)', fontWeight: 600 }}>
                      {order.isPaid ? '✓ Paid' : order.paymentMethod === 'COD' ? 'COD' : '✗ Unpaid'}
                    </span>
                  </td>
                  <td><span className={`badge ${STATUS_COLORS[order.orderStatus] || 'badge-info'}`}>{order.orderStatus}</span></td>
                  <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
