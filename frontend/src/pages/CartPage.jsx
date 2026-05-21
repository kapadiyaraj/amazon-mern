import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag } from 'react-icons/fi';

export default function CartPage() {
  const { cart, updateItem, removeItem } = useCart();
  const navigate = useNavigate();

  const items = cart?.items || [];
  const subtotal = cart?.totalPrice || 0;
  const shipping = subtotal >= 500 ? 0 : 50;
  const tax      = Math.round(subtotal * 0.18 * 100) / 100;
  const total    = subtotal + shipping + tax;

  if (items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <FiShoppingBag size={64} style={{ color: 'var(--border)' }} />
        <h2 style={{ marginTop: 16, fontSize: 22 }}>Your cart is empty</h2>
        <p style={{ color: 'var(--text-secondary)', margin: '8px 0 24px' }}>Browse our products and add items to cart!</p>
        <Link to="/products" className="btn btn-primary">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: 24, paddingBottom: 40 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Shopping Cart ({items.length} items)</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
        {/* Cart Items */}
        <div className="card" style={{ padding: 24 }}>
          {items.map(item => (
            <div key={item._id} style={{ display: 'flex', gap: 20, padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
              <Link to={`/products/${item.product._id}`}>
                <img src={item.product.images?.[0]?.url || 'https://via.placeholder.com/100'} alt={item.product.name}
                  style={{ width: 100, height: 100, objectFit: 'contain', background: '#f8f8f8', borderRadius: 6, padding: 8 }} />
              </Link>
              <div style={{ flex: 1 }}>
                <Link to={`/products/${item.product._id}`}>
                  <h3 style={{ fontSize: 15, fontWeight: 500, marginBottom: 6 }}>{item.product.name}</h3>
                </Link>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>Unit Price: ₹{item.price.toLocaleString('en-IN')}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: 6 }}>
                    <button onClick={() => updateItem(item._id, item.quantity - 1)} style={{ padding: '6px 12px', background: 'none', border: 'none', cursor: 'pointer' }}>
                      <FiMinus size={14} />
                    </button>
                    <span style={{ padding: '0 10px', fontWeight: 600 }}>{item.quantity}</span>
                    <button onClick={() => updateItem(item._id, item.quantity + 1)} disabled={item.quantity >= item.product.stock}
                      style={{ padding: '6px 12px', background: 'none', border: 'none', cursor: 'pointer' }}>
                      <FiPlus size={14} />
                    </button>
                  </div>
                  <button onClick={() => removeItem(item._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
                    <FiTrash2 size={14} /> Remove
                  </button>
                </div>
              </div>
              <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                <strong style={{ fontSize: 16 }}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</strong>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="card" style={{ padding: 24, height: 'fit-content', position: 'sticky', top: 90 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Order Summary</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20, fontSize: 14 }}>
            {[['Subtotal', `₹${subtotal.toLocaleString('en-IN')}`],
              ['Shipping', shipping === 0 ? '🎉 Free' : `₹${shipping}`],
              ['GST (18%)', `₹${tax.toLocaleString('en-IN')}`]].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{k}</span><span>{v}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 16 }}>
              <span>Total</span><span>₹{total.toLocaleString('en-IN')}</span>
            </div>
          </div>
          {subtotal < 500 && (
            <p style={{ fontSize: 12, color: 'var(--success)', background: '#e4f5f0', padding: '8px 12px', borderRadius: 6, marginBottom: 16 }}>
              Add ₹{(500 - subtotal).toFixed(0)} more for free shipping!
            </p>
          )}
          <button className="btn btn-primary btn-full" onClick={() => navigate('/checkout')}>
            Proceed to Checkout
          </button>
          <Link to="/products" className="btn btn-outline btn-full" style={{ marginTop: 10 }}>Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
}
