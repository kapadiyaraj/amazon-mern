import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { Spinner } from '../components/common/Spinner';
import { FiPackage, FiChevronRight } from 'react-icons/fi';

const STATUS_COLORS = {
  Pending:    'badge-warning',
  Processing: 'badge-info',
  Shipped:    'badge-info',
  Delivered:  'badge-success',
  Cancelled:  'badge-danger',
};

export default function OrdersPage() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/myorders')
      .then(r => setOrders(r.data.orders))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  if (orders.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <FiPackage size={64} style={{ color: 'var(--border)' }} />
        <h2 style={{ marginTop: 16, fontSize: 22 }}>No orders yet</h2>
        <p style={{ color: 'var(--text-secondary)', margin: '8px 0 24px' }}>
          Once you place an order, it will appear here.
        </p>
        <Link to="/products" className="btn btn-primary">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: 24, paddingBottom: 40 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>My Orders</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {orders.map(order => (
          <div key={order._id} className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
              <div>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>ORDER PLACED</p>
                <p style={{ fontSize: 14, fontWeight: 500 }}>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
              <div>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>TOTAL</p>
                <p style={{ fontSize: 14, fontWeight: 700 }}>₹{order.totalPrice.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>PAYMENT</p>
                <p style={{ fontSize: 14 }}>{order.paymentMethod} {order.isPaid ? '✅' : '⏳'}</p>
              </div>
              <div>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>STATUS</p>
                <span className={`badge ${STATUS_COLORS[order.orderStatus] || 'badge-info'}`}>
                  {order.orderStatus}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>ORDER ID</p>
                <p style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--text-secondary)' }}>#{order._id.slice(-8).toUpperCase()}</p>
              </div>
            </div>

            {/* Order Items Preview */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', borderTop: '1px solid var(--border)', paddingTop: 16, marginBottom: 16 }}>
              {order.orderItems.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <img
                    src={item.image || 'https://via.placeholder.com/56'}
                    alt={item.name}
                    style={{ width: 56, height: 56, objectFit: 'contain', background: '#f8f8f8', borderRadius: 6, padding: 4 }}
                  />
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 500, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              ))}
            </div>

            <Link
              to={`/orders/${order._id}`}
              className="btn btn-outline btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              View Order Details <FiChevronRight />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
