import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { Spinner } from '../../components/common/Spinner';
import { Pagination } from '../../components/common/Spinner';
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './Admin.css';

export default function AdminProducts() {
  const [products,   setProducts]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [page,       setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleting,   setDeleting]   = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/products', { params: { keyword: search, page, limit: 10 } });
      setProducts(data.products);
      setTotalPages(data.totalPages);
    } catch { toast.error('Failed to load products'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      fetchProducts();
    } catch { toast.error('Delete failed'); }
    finally { setDeleting(null); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>Products</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>Manage your product catalogue</p>
        </div>
        <Link to="/admin/products/new" className="btn btn-primary">
          <FiPlus /> Add Product
        </Link>
      </div>

      <div className="admin-table-wrap">
        <div className="admin-table-header">
          <span className="admin-table-title">{products.length} Products</span>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8 }}>
            <div style={{ position: 'relative' }}>
              <FiSearch style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input
                type="text"
                className="form-control"
                placeholder="Search products…"
                style={{ paddingLeft: 34, width: 240 }}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-dark btn-sm">Search</button>
          </form>
        </div>

        {loading ? <Spinner /> : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Rating</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <img
                          src={product.images?.[0]?.url || 'https://via.placeholder.com/48'}
                          alt={product.name}
                          style={{ width: 48, height: 48, objectFit: 'contain', background: '#f8f8f8', borderRadius: 6, padding: 4, flexShrink: 0 }}
                        />
                        <div>
                          <div style={{ fontWeight: 500, fontSize: 14, maxWidth: 240 }}>{product.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{product._id.slice(-8)}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="badge badge-info">{product.category}</span></td>
                    <td>
                      <div style={{ fontWeight: 600 }}>₹{product.price.toLocaleString('en-IN')}</div>
                      {product.originalPrice > product.price && (
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', textDecoration: 'line-through' }}>₹{product.originalPrice.toLocaleString('en-IN')}</div>
                      )}
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: product.stock === 0 ? 'var(--error)' : product.stock < 10 ? '#f57f17' : 'var(--success)' }}>
                        {product.stock === 0 ? 'Out of Stock' : product.stock}
                      </span>
                    </td>
                    <td>⭐ {product.rating.toFixed(1)} ({product.numReviews})</td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <Link to={`/admin/products/${product._id}/edit`} className="btn btn-outline btn-sm">
                          <FiEdit2 size={14} />
                        </Link>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(product._id, product.name)}
                          disabled={deleting === product._id}
                        >
                          {deleting === product._id ? '…' : <FiTrash2 size={14} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {products.length === 0 && (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>No products found</div>
            )}
          </div>
        )}
      </div>

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
