import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Layouts & Common
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';

// Pages
import HomePage        from './pages/HomePage';
import ProductListPage from './pages/ProductListPage';
import ProductDetail   from './pages/ProductDetail';
import CartPage        from './pages/CartPage';
import CheckoutPage    from './pages/CheckoutPage';
import LoginPage       from './pages/LoginPage';
import RegisterPage    from './pages/RegisterPage';
import OrdersPage      from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import ProfilePage     from './pages/ProfilePage';


import QrPaymentPage from "./pages/QrPaymentPage";

// Admin Pages
import AdminLayout      from './pages/admin/AdminLayout';
import AdminDashboard   from './pages/admin/AdminDashboard';
import AdminProducts    from './pages/admin/AdminProducts';
import AdminProductForm from './pages/admin/AdminProductForm';
import AdminOrders      from './pages/admin/AdminOrders';
import AdminUsers       from './pages/admin/AdminUsers';

// Protected route wrappers
const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};
const AdminRoute = ({ children }) => {
  const { user, isAdmin } = useAuth();
  if (!user)    return <Navigate to="/login"  replace />;
  if (!isAdmin) return <Navigate to="/"       replace />;
  return children;
};

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/"           element={<HomePage />} />
        <Route path="/products"   element={<ProductListPage />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/login"      element={<LoginPage />} />
        <Route path="/register"   element={<RegisterPage />} />

        {/* Protected User Routes */}
        <Route path="/cart"     element={<PrivateRoute><CartPage /></PrivateRoute>} />
        <Route path="/checkout" element={<PrivateRoute><CheckoutPage /></PrivateRoute>} />
        <Route path="/orders"   element={<PrivateRoute><OrdersPage /></PrivateRoute>} />
        <Route path="/orders/:id" element={<PrivateRoute><OrderDetailPage /></PrivateRoute>} />
        <Route path="/profile"  element={<PrivateRoute><ProfilePage /></PrivateRoute>} />



        <Route path="/qr-payment" element={<QrPaymentPage />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index           element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/new"  element={<AdminProductForm />} />
          <Route path="products/:id/edit" element={<AdminProductForm />} />
          <Route path="orders"   element={<AdminOrders />} />
          <Route path="users"    element={<AdminUsers />} />
        </Route>
      </Routes>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppRoutes />
          <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
