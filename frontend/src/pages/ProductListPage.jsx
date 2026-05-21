import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import ProductCard from '../components/common/ProductCard';
import { Spinner } from '../components/common/Spinner';
import { Pagination } from '../components/common/Spinner';
import { FiFilter, FiX } from 'react-icons/fi';

export default function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products,    setProducts]    = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [totalPages,  setTotalPages]  = useState(1);
  const [total,       setTotal]       = useState(0);
  const [showFilter,  setShowFilter]  = useState(false);

  const keyword  = searchParams.get('keyword')  || '';
  const category = searchParams.get('category') || '';
  const sort     = searchParams.get('sort')     || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const page     = Number(searchParams.get('page') || 1);

  const updateParam = (key, val) => {
    const p = new URLSearchParams(searchParams);
    if (val) p.set(key, val); else p.delete(key);
    p.delete('page');
    setSearchParams(p);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [prodRes, catRes] = await Promise.all([
          api.get('/products', { params: { keyword, category, sort, minPrice, maxPrice, page, limit: 12 } }),
          api.get('/products/categories'),
        ]);
        setProducts(prodRes.data.products);
        setTotalPages(prodRes.data.totalPages);
        setTotal(prodRes.data.total);
        setCategories(catRes.data.categories);
      } catch { /* silent */ }
      finally { setLoading(false); }
    };
    fetchData();
  }, [keyword, category, sort, minPrice, maxPrice, page]);

  return (
    <div className="container" style={{ paddingTop: 24, paddingBottom: 40 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>
          {keyword ? `Results for "${keyword}"` : category || 'All Products'}
          <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--text-secondary)', marginLeft: 8 }}>({total} items)</span>
        </h1>
        <button className="btn btn-outline btn-sm" onClick={() => setShowFilter(!showFilter)}>
          {showFilter ? <FiX /> : <FiFilter />} Filters
        </button>
      </div>

      <div style={{ display: 'flex', gap: 24 }}>
        {/* Sidebar Filters */}
        <aside style={{ width: 220, flexShrink: 0, display: showFilter ? 'block' : 'none' }}>
          <div className="card" style={{ padding: 20 }}>
            <div style={{ marginBottom: 20 }}>
              <h4 style={{ marginBottom: 12, fontSize: 14 }}>Category</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ fontSize: 13, cursor: 'pointer' }}>
                  <input type="radio" name="cat" value="" checked={!category} onChange={() => updateParam('category', '')} /> All
                </label>
                {categories.map(c => (
                  <label key={c} style={{ fontSize: 13, cursor: 'pointer' }}>
                    <input type="radio" name="cat" value={c} checked={category === c} onChange={() => updateParam('category', c)} /> {c}
                  </label>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <h4 style={{ marginBottom: 12, fontSize: 14 }}>Price Range (₹)</h4>
              <div style={{ display: 'flex', gap: 8 }}>
                <input type="number" placeholder="Min" className="form-control" style={{ padding: '6px 8px', fontSize: 13 }}
                  value={minPrice} onChange={e => updateParam('minPrice', e.target.value)} />
                <input type="number" placeholder="Max" className="form-control" style={{ padding: '6px 8px', fontSize: 13 }}
                  value={maxPrice} onChange={e => updateParam('maxPrice', e.target.value)} />
              </div>
            </div>
            <div>
              <h4 style={{ marginBottom: 12, fontSize: 14 }}>Sort By</h4>
              <select className="form-control" style={{ fontSize: 13 }} value={sort} onChange={e => updateParam('sort', e.target.value)}>
                <option value="">Relevance</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
                <option value="newest">Newest First</option>
              </select>
            </div>
            {(category || minPrice || maxPrice || sort) && (
              <button className="btn btn-outline btn-sm btn-full" style={{ marginTop: 16 }}
                onClick={() => setSearchParams({})}>Clear Filters</button>
            )}
          </div>
        </aside>

        {/* Product Grid */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {loading ? <Spinner /> : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60 }}>
              <p style={{ fontSize: 18, color: 'var(--text-secondary)' }}>😕 No products found</p>
              <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setSearchParams({})}>Clear Filters</button>
            </div>
          ) : (
            <>
              <div className="grid-4">
                {products.map(p => <ProductCard key={p._id} product={p} />)}
              </div>
              <Pagination currentPage={page} totalPages={totalPages}
                onPageChange={p => { const s = new URLSearchParams(searchParams); s.set('page', p); setSearchParams(s); }} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
