import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/common/StarRating';
import { Spinner } from '../components/common/Spinner';
import { FiShoppingCart, FiZap, FiTruck, FiShield } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const [product,   setProduct]   = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [qty,       setQty]       = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [review,    setReview]    = useState({ rating: 5, comment: '' });
  const [reviewing, setReviewing] = useState(false);

  useEffect(() => {
    api.get(`/products/${id}`)
      .then(r => setProduct(r.data.product))
      .catch(() => navigate('/products'))
      .finally(() => setLoading(false));
  }, [id]);

  const submitReview = async (e) => {
    e.preventDefault();
    setReviewing(true);
    try {
      await api.post(`/products/${id}/reviews`, review);
      toast.success('Review submitted!');
      const r = await api.get(`/products/${id}`);
      setProduct(r.data.product);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally { setReviewing(false); }
  };

  if (loading) return <Spinner />;
  if (!product) return null;

  const discount = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  return (
    <div className="container" style={{ paddingTop: 24, paddingBottom: 40 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, background: 'white', borderRadius: 8, padding: 32, boxShadow: 'var(--shadow)' }}>
        {/* Images */}
        <div>
          <div style={{ background: '#f8f8f8', borderRadius: 8, aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: 12 }}>
            <img src={product.images?.[activeImg]?.url || 'https://via.placeholder.com/500'} alt={product.name}
              style={{ maxHeight: 400, objectFit: 'contain', padding: 20, transition: 'opacity 0.3s' }} />
          </div>
          {product.images?.length > 1 && (
            <div style={{ display: 'flex', gap: 8 }}>
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)}
                  style={{ border: i === activeImg ? '2px solid var(--amazon-orange)' : '2px solid var(--border)', borderRadius: 6, overflow: 'hidden', cursor: 'pointer', background: '#f8f8f8', padding: 4 }}>
                  <img src={img.url} alt="" style={{ width: 60, height: 60, objectFit: 'contain' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1 }}>{product.category}</span>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: '8px 0 12px', lineHeight: 1.3 }}>{product.name}</h1>
          <StarRating rating={product.rating} count={product.numReviews} size={16} />
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, margin: '16px 0' }}>
            <span className="price">₹{product.price.toLocaleString('en-IN')}</span>
            {product.originalPrice > product.price && (
              <><span className="price-original">₹{product.originalPrice.toLocaleString('en-IN')}</span>
              <span className="discount-badge">{discount}% off</span></>
            )}
          </div>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 20 }}>{product.description}</p>

          {/* Quantity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>Qty:</span>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: 6 }}>
              <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ padding: '8px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}>−</button>
              <span style={{ padding: '0 12px', fontWeight: 600 }}>{qty}</span>
              <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} style={{ padding: '8px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}>+</button>
            </div>
            <span style={{ fontSize: 13, color: product.stock > 0 ? 'var(--success)' : 'var(--error)', fontWeight: 600 }}>
              {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => addToCart(product._id, qty)} disabled={product.stock === 0} style={{ flex: 1 }}>
              <FiShoppingCart /> Add to Cart
            </button>
            <button className="btn btn-dark" onClick={() => { addToCart(product._id, qty); navigate('/checkout'); }} disabled={product.stock === 0} style={{ flex: 1 }}>
              <FiZap /> Buy Now
            </button>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[{ icon: <FiTruck />, text: 'Free delivery on orders over ₹500' },
              { icon: <FiShield />, text: '7-day easy return policy' }].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-secondary)' }}>
                {item.icon} {item.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="card" style={{ padding: 32, marginTop: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Customer Reviews ({product.numReviews})</h2>
        {product.reviews.map(r => (
          <div key={r._id} style={{ borderBottom: '1px solid var(--border)', paddingBottom: 16, marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <strong style={{ fontSize: 14 }}>{r.name}</strong>
              <StarRating rating={r.rating} size={14} />
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{r.comment}</p>
          </div>
        ))}
        {product.reviews.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No reviews yet. Be the first!</p>}

        {user && (
          <form onSubmit={submitReview} style={{ marginTop: 24, borderTop: '1px solid var(--border)', paddingTop: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Write a Review</h3>
            <div className="form-group">
              <label>Rating</label>
              <select className="form-control" value={review.rating} onChange={e => setReview(r => ({ ...r, rating: Number(e.target.value) }))}>
                {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Star{n > 1 ? 's' : ''}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Comment</label>
              <textarea className="form-control" rows={4} value={review.comment}
                onChange={e => setReview(r => ({ ...r, comment: e.target.value }))} required />
            </div>
            <button className="btn btn-primary" type="submit" disabled={reviewing}>
              {reviewing ? 'Submitting…' : 'Submit Review'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
