// ── Footer.jsx ──────────────────────────────────────────
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{ background: 'var(--amazon-dark)', color: 'var(--white)', marginTop: 40 }}>
      <div className="container" style={{ padding: '40px 16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 24 }}>
        <div>
          <h4 style={{ color: 'var(--amazon-orange)', marginBottom: 12, fontSize: 16 }}>ShopMart</h4>
          <p style={{ fontSize: 13, color: '#aaa', lineHeight: 1.7 }}>India's favourite online store. Quality products at the best prices.</p>
        </div>
        <div>
          <h4 style={{ marginBottom: 12, fontSize: 14 }}>Quick Links</h4>
          {['/', '/products', '/cart', '/orders'].map((to, i) => (
            <Link key={to} to={to} style={{ display: 'block', color: '#aaa', fontSize: 13, marginBottom: 8, transition: 'color 0.2s' }}>
              {['Home', 'Products', 'Cart', 'My Orders'][i]}
            </Link>
          ))}
        </div>
        <div>
          <h4 style={{ marginBottom: 12, fontSize: 14 }}>Categories</h4>
          {['Electronics', 'Fashion', 'Home & Kitchen', 'Books', 'Sports'].map(c => (
            <Link key={c} to={`/products?category=${c}`} style={{ display: 'block', color: '#aaa', fontSize: 13, marginBottom: 8 }}>{c}</Link>
          ))}
        </div>
        <div>
          <h4 style={{ marginBottom: 12, fontSize: 14 }}>Contact</h4>
          <p style={{ color: '#aaa', fontSize: 13 }}>📧 support@shopmart.in</p>
          <p style={{ color: '#aaa', fontSize: 13, marginTop: 8 }}>📞 1800-XXX-XXXX</p>
          <p style={{ color: '#aaa', fontSize: 13, marginTop: 8 }}>🏢 Ahmedabad, Gujarat</p>
        </div>
      </div>
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', padding: '16px', fontSize: 13, color: '#888' }}>
        © {new Date().getFullYear()} ShopMart. All rights reserved.
      </div>
    </footer>
  );
}
