import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiUser, FiSearch, FiMenu, FiX, FiChevronDown } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import './Navbar.css';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [search,   setSearch]   = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdown, setDropdown] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/products?keyword=${encodeURIComponent(search.trim())}`);
      setSearch('');
    }
  };

  return (
    <header className="navbar">
      {/* Top bar */}
      <div className="navbar-top">
        <div className="container navbar-inner">
          {/* Logo */}
          <Link to="/" className="navbar-logo">
            <span className="logo-shop">shop</span>
            <span className="logo-mart">mart</span>
            <span className="logo-dot">●</span>
          </Link>

          {/* Search */}
          <form className="navbar-search" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search products, brands and more…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button type="submit"><FiSearch size={18} /></button>
          </form>

          {/* Right actions */}
          <div className="navbar-actions">
            {user ? (
              <div className="dropdown-wrapper" onMouseEnter={() => setDropdown(true)} onMouseLeave={() => setDropdown(false)}>
                <button className="nav-btn">
                  <FiUser size={18} />
                  <span className="hide-sm">{user.name.split(' ')[0]}</span>
                  <FiChevronDown size={14} />
                </button>
                {dropdown && (
                  <div className="dropdown">
                    <Link to="/profile">My Profile</Link>
                    <Link to="/orders">My Orders</Link>
                    {isAdmin && <Link to="/admin">Admin Panel</Link>}
                    <button onClick={logout}>Logout</button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="nav-btn"><FiUser size={18} /><span className="hide-sm">Login</span></Link>
            )}

            <Link to="/cart" className="nav-btn cart-btn">
              <FiShoppingCart size={20} />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>

            <button className="nav-btn mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Category nav */}
      <nav className="navbar-categories">
        <div className="container">
            {/* 👇 Home first */}
  <Link to="/">Home</Link>
          {['Electronics', 'Fashion', 'Home & Kitchen', 'Books', 'Sports', 'Mobiles', 'Grocery', 'Toys'].map(cat => (
            <Link key={cat} to={`/products?category=${cat}`}>{cat}</Link>
          ))}
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="mobile-menu">
          <form onSubmit={handleSearch}>
            <input type="text" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} />
            <button type="submit"><FiSearch /></button>
          </form>
          <Link to="/products"  onClick={() => setMenuOpen(false)}>All Products</Link>
          <Link to="/cart"      onClick={() => setMenuOpen(false)}>Cart ({cartCount})</Link>
          {user ? (
            <>
              <Link to="/orders"  onClick={() => setMenuOpen(false)}>My Orders</Link>
              <Link to="/profile" onClick={() => setMenuOpen(false)}>Profile</Link>
              {isAdmin && <Link to="/admin" onClick={() => setMenuOpen(false)}>Admin</Link>}
              <button onClick={() => { logout(); setMenuOpen(false); }}>Logout</button>
            </>
          ) : (
            <Link to="/login" onClick={() => setMenuOpen(false)}>Login / Register</Link>
          )}
        </div>
      )}
    </header>
  );
}
