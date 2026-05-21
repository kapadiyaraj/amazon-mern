import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart,    setCart]    = useState({ items: [], totalPrice: 0 });
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user) { setCart({ items: [], totalPrice: 0 }); return; }
    try {
      const { data } = await api.get('/cart');
      setCart(data.cart);
    } catch { /* silent */ }
  }, [user]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addToCart = async (productId, quantity = 1) => {
    if (!user) { toast.error('Please login to add to cart'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/cart', { productId, quantity });
      setCart(data.cart);
      toast.success('Added to cart!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart');
    } finally { setLoading(false); }
  };

  const updateItem = async (itemId, quantity) => {
    try {
      const { data } = await api.put(`/cart/items/${itemId}`, { quantity });
      setCart(data.cart);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const removeItem = async (itemId) => {
    try {
      const { data } = await api.delete(`/cart/items/${itemId}`);
      setCart(data.cart);
      toast.success('Item removed');
    } catch { toast.error('Remove failed'); }
  };

  const clearCart = async () => {
    try {
      await api.delete('/cart');
      setCart({ items: [], totalPrice: 0 });
    } catch { /* silent */ }
  };

  const cartCount = cart.items?.reduce((acc, i) => acc + i.quantity, 0) || 0;

  return (
    <CartContext.Provider value={{ cart, cartCount, loading, addToCart, updateItem, removeItem, clearCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
