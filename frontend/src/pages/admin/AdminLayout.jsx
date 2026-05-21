import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiGrid, FiPackage, FiShoppingBag, FiUsers,
  FiLogOut, FiChevronRight, FiMenu, FiX
} from 'react-icons/fi';
import { useState } from 'react';
import './Admin.css';

const NAV_ITEMS = [
  { to: '/admin',          label: 'Dashboard',  icon: <FiGrid />,        end: true },
  { to: '/admin/products', label: 'Products',   icon: <FiPackage /> },
  { to: '/admin/orders',   label: 'Orders',     icon: <FiShoppingBag /> },
  { to: '/admin/users',    label: 'Users',      icon: <FiUsers /> },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar__header">
          <div>
            <h2 className="admin-logo">ShopMart</h2>
            <p className="admin-logo-sub">Admin Panel</p>
          </div>
          <button className="sidebar-close" onClick={() => setSidebarOpen(false)}><FiX /></button>
        </div>

        <div className="admin-user-card">
          <div className="admin-avatar">{user?.name?.[0]?.toUpperCase()}</div>
          <div>
            <p className="admin-user-name">{user?.name}</p>
            <p className="admin-user-role">Administrator</p>
          </div>
        </div>

        <nav className="admin-nav">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `admin-nav__item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="admin-nav__icon">{item.icon}</span>
              <span>{item.label}</span>
              <FiChevronRight className="admin-nav__arrow" size={14} />
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar__footer">
          <NavLink to="/" className="admin-nav__item">
            <span className="admin-nav__icon">🏪</span>
            <span>View Store</span>
          </NavLink>
          <button className="admin-nav__item admin-logout" onClick={handleLogout}>
            <span className="admin-nav__icon"><FiLogOut /></span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Main content */}
      <main className="admin-main">
        <div className="admin-topbar">
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(true)}><FiMenu size={22} /></button>
          <h1 className="admin-page-title">Admin Panel</h1>
        </div>
        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
