import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import ProductCard from '../components/common/ProductCard';
import { Spinner } from '../components/common/Spinner';
import './HomePage.css';

const CATEGORIES = [
  { name: 'Electronics',    icon: '💻', color: '#e8f0fe' },
  { name: 'Fashion',        icon: '👗', color: '#fce8f3' },
  { name: 'Home & Kitchen', icon: '🏠', color: '#e8fde8' },
  { name: 'Books',          icon: '📚', color: '#fff8e1' },
  { name: 'Sports',         icon: '⚽', color: '#e8f5e9' },
  { name: 'Mobiles',        icon: '📱', color: '#f3e8ff' },
  { name: 'Grocery',        icon: '🛒', color: '#e8f0fe' },
  { name: 'Toys',           icon: '🎮', color: '#fff3e0' },
];

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [newest,   setNewest]   = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const [featRes, newRes] = await Promise.all([
          api.get('/products?limit=8&sort=rating'),
          api.get('/products?limit=8&sort=newest'),
        ]);
        setFeatured(featRes.data.products);
        setNewest(newRes.data.products);
      } catch { /* silent */ }
      finally { setLoading(false); }
    };
    fetchProducts();
  }, []);

  return (
    <div className="home">
      {/* Hero Banner */}
      <section className="hero">
        <div className="hero-content">
          <p className="hero-tag">🎉 Limited Time Offer</p>
          <h1>Shop the Best Deals <br/><span>Up to 70% Off</span></h1>
          <p className="hero-sub">Quality products from trusted brands, delivered to your doorstep across India.</p>
          <div className="hero-ctas">
            <Link to="/products" className="btn btn-primary">Shop Now →</Link>
            <Link to="/products?category=Electronics" className="btn btn-outline" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)' }}>Explore Electronics</Link>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-float">🛍️</div>
        </div>
      </section>

      <div className="container">
        {/* Category Grid */}
        <section className="section">
          <div className="section-header">
            <h2>Shop by Category</h2>
            <Link to="/products" className="see-all">See all →</Link>
          </div>
          <div className="category-grid">
            {CATEGORIES.map(cat => (
              <Link key={cat.name} to={`/products?category=${cat.name}`} className="category-card" style={{ background: cat.color }}>
                <span className="category-icon">{cat.icon}</span>
                <span className="category-name">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Top Rated */}
        <section className="section">
          <div className="section-header">
            <h2>⭐ Top Rated Products</h2>
            <Link to="/products?sort=rating" className="see-all">View all →</Link>
          </div>
          {loading ? <Spinner /> : (
            <div className="grid-4">
              {featured.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          )}
        </section>

        {/* Newest */}
        <section className="section">
          <div className="section-header">
            <h2>🆕 New Arrivals</h2>
            <Link to="/products?sort=newest" className="see-all">View all →</Link>
          </div>
          {loading ? <Spinner /> : (
            <div className="grid-4">
              {newest.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          )}
        </section>

        {/* Trust badges */}
        <section className="trust-badges">
          {[
            { icon: '🚚', title: 'Free Delivery',    sub: 'On orders over ₹500' },
            { icon: '🔒', title: 'Secure Payment',   sub: 'UPI, Cards & COD' },
            { icon: '↩️', title: 'Easy Returns',     sub: '7-day return policy' },
            { icon: '✅', title: '100% Authentic',   sub: 'Verified brands only' },
          ].map(b => (
            <div key={b.title} className="trust-card">
              <span className="trust-icon">{b.icon}</span>
              <div>
                <strong>{b.title}</strong>
                <p>{b.sub}</p>
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
