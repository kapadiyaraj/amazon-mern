import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import { Spinner } from '../../components/common/Spinner';
import { FiUpload, FiX, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './Admin.css';

const CATEGORIES = ['Electronics', 'Fashion', 'Home & Kitchen', 'Books', 'Sports', 'Mobiles', 'Grocery', 'Toys', 'Other'];

const EMPTY_FORM = {
  name: '', description: '', price: '', originalPrice: '',
  category: 'Electronics', brand: '', stock: '', isFeatured: false, tags: '',
};

export default function AdminProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form,     setForm]     = useState(EMPTY_FORM);
  const [images,   setImages]   = useState([]);      // existing images from DB
  const [newFiles, setNewFiles] = useState([]);      // files to upload
  const [previews, setPreviews] = useState([]);      // local blob URLs
  const [loading,  setLoading]  = useState(isEdit);
  const [saving,   setSaving]   = useState(false);
  const [uploading,setUploading]= useState(false);

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/products/${id}`)
      .then(r => {
        const p = r.data.product;
        setForm({
          name: p.name, description: p.description, price: p.price,
          originalPrice: p.originalPrice || '', category: p.category,
          brand: p.brand || '', stock: p.stock, isFeatured: p.isFeatured,
          tags: p.tags?.join(', ') || '',
        });
        setImages(p.images || []);
      })
      .catch(() => { toast.error('Product not found'); navigate('/admin/products'); })
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFiles = (e) => {
    const files = Array.from(e.target.files);
    setNewFiles(prev => [...prev, ...files]);
    const blobUrls = files.map(f => URL.createObjectURL(f));
    setPreviews(prev => [...prev, ...blobUrls]);
  };

  const removeExistingImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };
  const removeNewFile = (index) => {
    URL.revokeObjectURL(previews[index]);
    setNewFiles(prev  => prev.filter((_, i) => i !== index));
    setPreviews(prev  => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async () => {
    const uploaded = [];
    for (const file of newFiles) {
      const formData = new FormData();
      formData.append('image', file);
      const { data } = await api.post('/upload/product', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      uploaded.push({ url: data.url, public_id: data.public_id });
    }
    return uploaded;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let allImages = [...images];
      if (newFiles.length > 0) {
        setUploading(true);
        const uploaded = await uploadImages();
        allImages = [...allImages, ...uploaded];
        setUploading(false);
      }

      const payload = {
        ...form,
        price:         Number(form.price),
        originalPrice: Number(form.originalPrice) || 0,
        stock:         Number(form.stock),
        images:        allImages,
        tags:          form.tags.split(',').map(t => t.trim()).filter(Boolean),
      };

      if (isEdit) {
        await api.put(`/products/${id}`, payload);
        toast.success('Product updated!');
      } else {
        await api.post('/products', payload);
        toast.success('Product created!');
      }
      navigate('/admin/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
      setUploading(false);
    } finally { setSaving(false); }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
        <button className="btn btn-outline btn-sm" onClick={() => navigate('/admin/products')}>
          <FiArrowLeft /> Back
        </button>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>
            {isEdit ? `Editing: ${form.name}` : 'Fill in the details below to create a new product'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
          {/* Main Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Basic Info */}
            <div className="card" style={{ padding: 28 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Basic Information</h3>
              <div className="form-group">
                <label>Product Name *</label>
                <input name="name" className="form-control" placeholder="e.g. Apple iPhone 15 Pro Max"
                  value={form.name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Description *</label>
                <textarea name="description" className="form-control" rows={5}
                  placeholder="Describe the product in detail…"
                  value={form.description} onChange={handleChange} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label>Brand</label>
                  <input name="brand" className="form-control" placeholder="e.g. Apple"
                    value={form.brand} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Category *</label>
                  <select name="category" className="form-control" value={form.category} onChange={handleChange} required>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Tags (comma separated)</label>
                <input name="tags" className="form-control" placeholder="e.g. smartphone, apple, 5g"
                  value={form.tags} onChange={handleChange} />
              </div>
            </div>

            {/* Image Upload */}
            <div className="card" style={{ padding: 28 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Product Images</h3>
              <label style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                border: '2px dashed var(--border)', borderRadius: 8, padding: 32, cursor: 'pointer',
                background: '#fafafa', transition: 'border-color 0.2s', marginBottom: 16,
              }}>
                <input type="file" accept="image/*" multiple onChange={handleFiles} style={{ display: 'none' }} />
                <FiUpload size={28} style={{ color: 'var(--text-secondary)', marginBottom: 8 }} />
                <p style={{ fontWeight: 600, marginBottom: 4 }}>Click to upload images</p>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>JPG, PNG, WEBP — max 5MB each</p>
              </label>

              {/* Existing images */}
              {(images.length > 0 || previews.length > 0) && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                  {images.map((img, i) => (
                    <div key={i} style={{ position: 'relative' }}>
                      <img src={img.url} alt="" style={{ width: 80, height: 80, objectFit: 'contain', background: '#f8f8f8', borderRadius: 8, padding: 6, border: '1px solid var(--border)' }} />
                      <button type="button" onClick={() => removeExistingImage(i)}
                        style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', background: 'var(--error)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FiX size={10} />
                      </button>
                    </div>
                  ))}
                  {previews.map((src, i) => (
                    <div key={`new-${i}`} style={{ position: 'relative' }}>
                      <img src={src} alt="" style={{ width: 80, height: 80, objectFit: 'contain', background: '#f8f8f8', borderRadius: 8, padding: 6, border: '2px solid var(--amazon-orange)' }} />
                      <button type="button" onClick={() => removeNewFile(i)}
                        style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', background: 'var(--error)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FiX size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Pricing */}
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Pricing</h3>
              <div className="form-group">
                <label>Selling Price (₹) *</label>
                <input name="price" type="number" min="0" className="form-control" placeholder="0"
                  value={form.price} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Original / MRP (₹)</label>
                <input name="originalPrice" type="number" min="0" className="form-control" placeholder="0"
                  value={form.originalPrice} onChange={handleChange} />
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Shows discount badge if higher than selling price</p>
              </div>
            </div>

            {/* Inventory */}
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Inventory</h3>
              <div className="form-group">
                <label>Stock Quantity *</label>
                <input name="stock" type="number" min="0" className="form-control" placeholder="0"
                  value={form.stock} onChange={handleChange} required />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginTop: 4 }}>
                <input type="checkbox" name="isFeatured" checked={form.isFeatured} onChange={handleChange}
                  style={{ width: 16, height: 16 }} />
                <div>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>Featured Product</span>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>Show on homepage highlights</p>
                </div>
              </label>
            </div>

            {/* Actions */}
            <div className="card" style={{ padding: 24 }}>
              <button type="submit" className="btn btn-primary btn-full" disabled={saving} style={{ marginBottom: 10 }}>
                {uploading ? '⬆ Uploading images…' : saving ? 'Saving…' : isEdit ? '✓ Update Product' : '+ Create Product'}
              </button>
              <button type="button" className="btn btn-outline btn-full" onClick={() => navigate('/admin/products')}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
