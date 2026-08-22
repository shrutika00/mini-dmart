import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleAddToCart = async (e) => {
    e.preventDefault(); // Prevent navigating if wrapped in a link
    if (!user) {
      setErrorMsg('Please login to add items to cart');
      return;
    }

    setLoading(true);
    setMessage('');
    setErrorMsg('');

    const res = await addToCart(product._id, 1);
    
    if (res.success) {
      setMessage('Added to cart!');
      setTimeout(() => setMessage(''), 2000);
    } else {
      setErrorMsg(res.message || 'Failed to add');
      setTimeout(() => setErrorMsg(''), 3000);
    }
    setLoading(false);
  };

  const isCustomer = !user || user.role === 'customer';

  return (
    <div className="card product-card">
      <Link to={`/products/${product._id}`}>
        <div className="product-image-container">
          <img 
            src={product.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80'} 
            alt={product.name} 
            className="product-image"
          />
        </div>
      </Link>

      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <span className="badge badge-info" style={{ alignSelf: 'flex-start', marginBottom: '0.5rem', textTransform: 'uppercase', fontSize: '0.75rem' }}>
          {product.category?.name || 'Grocery'}
        </span>
        
        <Link to={`/products/${product._id}`}>
          <h3 className="product-title">{product.name}</h3>
        </Link>
        
        <p className="product-desc">
          {product.description.length > 80 
            ? `${product.description.substring(0, 80)}...` 
            : product.description}
        </p>

        <div className="product-meta">
          <div>
            <span className="product-price">₹{product.price}</span>
            <div style={{ fontSize: '0.8rem', color: product.stock > 0 ? 'var(--secondary-color)' : 'var(--danger-color)', fontWeight: 'bold' }}>
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
            </div>
          </div>

          {isCustomer && (
            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0 || loading}
              className="btn btn-primary"
              style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
            >
              {loading ? 'Adding...' : 'Add to Cart'}
            </button>
          )}
        </div>

        {message && <div style={{ color: 'var(--secondary-color)', fontSize: '0.85rem', marginTop: '0.5rem', fontWeight: 'bold', textAlign: 'center' }}>{message}</div>}
        {errorMsg && <div style={{ color: 'var(--danger-color)', fontSize: '0.85rem', marginTop: '0.5rem', fontWeight: 'bold', textAlign: 'center' }}>{errorMsg}</div>}
      </div>
    </div>
  );
};

export default ProductCard;
