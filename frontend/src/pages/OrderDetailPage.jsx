import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { Spinner } from '../components/common/Spinner';

const STATUS_STEPS = ['Pending', 'Processing', 'Shipped', 'Delivered'];

const STATUS_COLORS = {
  Pending:    'badge-warning',
  Processing: 'badge-info',
  Shipped:    'badge-info',
  Delivered:  'badge-success',
  Cancelled:  'badge-danger',
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order,   setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then(r => setOrder(r.data.order))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner />;
  if (!order)  return <p className="error-msg">Order not found.</p>;

  const stepIndex = STATUS_STEPS.indexOf(order.orderStatus);

  return (
    <div className="container" style={{ paddingTop: 24, paddingBottom: 40 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>
          Order #{order._id.slice(-8).toUpperCase()}
        </h1>
        <span className={`badge ${STATUS_COLORS[order.orderStatus] || 'badge-info'}`} style={{ fontSize: 13, padding: '6px 14px' }}>
          {order.orderStatus}
        </span>
      </div>

      {/* Progress Tracker */}
      {order.orderStatus !== 'Cancelled' && (
        <div className="card" style={{ padding: 28, marginBottom: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 24 }}>Order Progress</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            {STATUS_STEPS.map((step, i) => (
              <div key={step} style={{ display: 'flex', alignItems: 'center', flex: i < STATUS_STEPS.length - 1 ? 1 : 'none' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: i <= stepIndex ? 'var(--amazon-orange)' : 'var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 700, fontSize: 14, transition: 'background 0.3s'
                  }}>
                    {i < stepIndex ? '✓' : i + 1}
                  </div>
                  <span style={{ fontSize: 12, marginTop: 8, fontWeight: i === stepIndex ? 700 : 400, color: i <= stepIndex ? 'var(--text-primary)' : 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                    {step}
                  </span>
                </div>
                {i < STATUS_STEPS.length - 1 && (
                  <div style={{ flex: 1, height: 3, background: i < stepIndex ? 'var(--amazon-orange)' : 'var(--border)', margin: '0 4px', marginBottom: 20, transition: 'background 0.3s' }} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Items */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>📦 Items Ordered</h3>
            {order.orderItems.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 16, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                <img src={item.image || 'https://via.placeholder.com/72'} alt={item.name}
                  style={{ width: 72, height: 72, objectFit: 'contain', background: '#f8f8f8', borderRadius: 6, padding: 6 }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 500, fontSize: 14, marginBottom: 4 }}>{item.name}</p>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}
                  </p>
                </div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>
                  ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                </div>
              </div>
            ))}
          </div>

          {/* Shipping Address */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>🏠 Shipping Address</h3>
            <div style={{ fontSize: 14, lineHeight: 2, color: 'var(--text-secondary)' }}>
              <strong style={{ color: 'var(--text-primary)' }}>{order.shippingAddress.fullName}</strong><br />
              {order.shippingAddress.street}<br />
              {order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.pincode}<br />
              📞 {order.shippingAddress.phone}
            </div>
          </div>

          {/* Payment Info */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>💳 Payment Info</h3>
            <div style={{ fontSize: 14, lineHeight: 2 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Method</span>
                <span>{order.paymentMethod}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Status</span>
                <span style={{ color: order.isPaid ? 'var(--success)' : '#b7791f', fontWeight: 600 }}>
                  {order.isPaid ? `✅ Paid on ${new Date(order.paidAt).toLocaleDateString('en-IN')}` : '⏳ Pending'}
                </span>
              </div>
              {order.paymentResult?.razorpay_payment_id && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Payment ID</span>
                  <span style={{ fontSize: 12, fontFamily: 'monospace' }}>{order.paymentResult.razorpay_payment_id}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Price Summary */}
        <div className="card" style={{ padding: 24, height: 'fit-content', position: 'sticky', top: 90 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>💰 Price Summary</h3>
          {[
            ['Items',    `₹${order.itemsPrice.toLocaleString('en-IN')}`],
            ['Shipping', order.shippingPrice === 0 ? 'Free' : `₹${order.shippingPrice}`],
            ['GST',      `₹${order.taxPrice.toLocaleString('en-IN')}`],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 12 }}>
              <span style={{ color: 'var(--text-secondary)' }}>{k}</span><span>{v}</span>
            </div>
          ))}
          <div style={{ borderTop: '2px solid var(--border)', paddingTop: 14, display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 18 }}>
            <span>Total</span>
            <span>₹{order.totalPrice.toLocaleString('en-IN')}</span>
          </div>

          <div style={{ marginTop: 20, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            <p>Placed on: {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            {order.deliveredAt && <p>Delivered: {new Date(order.deliveredAt).toLocaleDateString('en-IN')}</p>}
          </div>

          <Link to="/orders" className="btn btn-outline btn-full btn-sm" style={{ marginTop: 20 }}>
            ← Back to Orders
          </Link>
        </div>
      </div>
    </div>
  );
}
