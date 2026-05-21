import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

const INITIAL_ADDR = { fullName: '', street: '', city: '', state: '', pincode: '', phone: '' };

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();

  const [address, setAddress]   = useState(INITIAL_ADDR);
  const [method,  setMethod]    = useState('COD');
  const [loading, setLoading]   = useState(false);

  const subtotal = cart?.totalPrice || 0;
  const shipping = subtotal >= 500 ? 0 : 50;
  const tax      = Math.round(subtotal * 0.18 * 100) / 100;
  const total    = subtotal + shipping + tax;

  const handleChange = e => setAddress(a => ({ ...a, [e.target.name]: e.target.value }));

  const placeOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/orders', { shippingAddress: address, paymentMethod: method });
      const order = data.order;

      // if (method === 'Razorpay') {
      //   const { data: rzpData } = await api.post('/payment/create-order', { orderId: order._id });
      //   const options = {
      //     key:      rzpData.keyId,
      //     amount:   rzpData.amount,
      //     currency: 'INR',
      //     name:     'ShopMart',
      //     description: `Order #${order._id}`,
      //     order_id: rzpData.razorpayOrderId,
      //     handler: async (response) => {
      //       try {
      //         await api.post('/payment/verify', {
      //           orderId: order._id,
      //           ...response,
      //         });
      //         toast.success('Payment successful! Order placed.');
      //         navigate(`/orders/${order._id}`);
      //       } catch {
      //         toast.error('Payment verification failed');
      //       }
      //     },
      //     prefill:  { name: address.fullName, contact: address.phone },
      //     theme:    { color: '#ff9900' },
      //   };
      //   const rzp = new window.Razorpay(options);
      //   rzp.open();
      // } 

      if (method === 'UPI') {
  navigate('/qr-payment', {
    state: {
      amount: total,
      orderId: order._id
    }
  });
} 
      else {
        toast.success('Order placed! Cash on Delivery selected.');
        navigate(`/orders/${order._id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally { setLoading(false); }
  };

  const fields = [
    { name: 'fullName', label: 'Full Name',    type: 'text', placeholder: 'John Doe' },
    { name: 'phone',    label: 'Phone Number', type: 'tel',  placeholder: '9876543210' },
    { name: 'street',   label: 'Street Address', type: 'text', placeholder: '123, MG Road, Bandra' },
    { name: 'city',     label: 'City',         type: 'text', placeholder: 'Mumbai' },
    { name: 'state',    label: 'State',        type: 'text', placeholder: 'Maharashtra' },
    { name: 'pincode',  label: 'PIN Code',     type: 'text', placeholder: '400001' },
  ];

  return (
    <div className="container" style={{ paddingTop: 24, paddingBottom: 40 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Checkout</h1>
      <form onSubmit={placeOrder}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
          <div>
            {/* Shipping */}
            <div className="card" style={{ padding: 24, marginBottom: 24 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>📦 Shipping Address</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {fields.map(f => (
                  <div key={f.name} className="form-group" style={{ gridColumn: f.name === 'street' ? 'span 2' : 'span 1', margin: 0 }}>
                    <label>{f.label}</label>
                    <input type={f.type} name={f.name} className="form-control" placeholder={f.placeholder}
                      value={address[f.name]} onChange={handleChange} required />
                  </div>
                ))}
              </div>
            </div>

            {/* Payment */}
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>💳 Payment Method</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { value: 'COD',      label: '💵 Cash on Delivery',        sub: 'Pay when your order arrives' },
                  // { value: 'Razorpay', label: '⚡ Online Payment (Razorpay)', sub: 'UPI, Cards, Net Banking, GPay, PhonePe' },
                  { value: 'UPI', label: '⚡ Online Payment', sub: 'UPI, Cards, Net Banking, GPay, PhonePe' },
                ].map(opt => (
                  <label key={opt.value} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: 16,
                    border: `2px solid ${method === opt.value ? 'var(--amazon-orange)' : 'var(--border)'}`,
                    borderRadius: 8, cursor: 'pointer', background: method === opt.value ? '#fff8f0' : 'white',
                    transition: 'all 0.2s'
                  }}>
                    <input type="radio" name="payment" value={opt.value} checked={method === opt.value} onChange={() => setMethod(opt.value)} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{opt.label}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{opt.sub}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="card" style={{ padding: 24, height: 'fit-content', position: 'sticky', top: 90 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Order Summary</h3>
            <div style={{ maxHeight: 200, overflowY: 'auto', marginBottom: 16 }}>
              {cart?.items?.map(item => (
                <div key={item._id} style={{ display: 'flex', gap: 10, marginBottom: 10, fontSize: 13 }}>
                  <img src={item.product?.images?.[0]?.url || 'https://via.placeholder.com/48'} alt="" style={{ width: 48, height: 48, objectFit: 'contain', background: '#f8f8f8', borderRadius: 4 }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 500, marginBottom: 2 }}>{item.product?.name}</p>
                    <p style={{ color: 'var(--text-secondary)' }}>Qty: {item.quantity} × ₹{item.price}</p>
                  </div>
                </div>
              ))}
            </div>
            {[['Subtotal', `₹${subtotal.toLocaleString('en-IN')}`],
              ['Shipping', shipping === 0 ? 'Free' : `₹${shipping}`],
              ['GST (18%)', `₹${tax.toLocaleString('en-IN')}`]].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 10 }}>
                <span style={{ color: 'var(--text-secondary)' }}>{k}</span><span>{v}</span>
              </div>
            ))}
            <div style={{ borderTop: '2px solid var(--border)', paddingTop: 12, display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 18, marginBottom: 20 }}>
              <span>Total</span><span>₹{total.toLocaleString('en-IN')}</span>
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Placing Order…' : method === 'COD' ? '🛍️ Place Order (COD)' : '⚡ Pay ₹' + total.toLocaleString('en-IN')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
