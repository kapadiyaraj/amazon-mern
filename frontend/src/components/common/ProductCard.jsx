import { Link } from 'react-router-dom';
import { FiShoppingCart } from 'react-icons/fi';
import StarRating from './StarRating';
import { useCart } from '../../context/CartContext';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const { addToCart, loading } = useCart();

  const discount = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="product-card card">
      <Link to={`/products/${product._id}`}>
        <div className="product-card__img">
          <img
            src={product.images?.[0]?.url || 'https://via.placeholder.com/300x300?text=No+Image'}
            alt={product.name}
            loading="lazy"
          />
          {discount > 0 && <span className="discount-ribbon">{discount}% off</span>}
          {product.stock === 0 && <div className="out-of-stock">Out of Stock</div>}
        </div>
      </Link>
      <div className="product-card__body">
        <span className="product-card__category">{product.category}</span>
        <Link to={`/products/${product._id}`}>
          <h3 className="product-card__name">{product.name}</h3>
        </Link>
        <div style={{ marginBottom: 8 }}>
          <StarRating rating={product.rating} count={product.numReviews} size={14} />
        </div>
        <div className="product-card__price-row">
          <span className="price">₹{product.price.toLocaleString('en-IN')}</span>
          {product.originalPrice > product.price && (
            <span className="price-original">₹{product.originalPrice.toLocaleString('en-IN')}</span>
          )}
        </div>
        <button
          className="btn btn-primary btn-full btn-sm"
          onClick={() => addToCart(product._id)}
          disabled={loading || product.stock === 0}
          style={{ marginTop: 12 }}
        >
          <FiShoppingCart /> {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}
