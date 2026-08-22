import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [qty, setQty] = useState(1);
  const [cartSuccess, setCartSuccess] = useState('');
  const [cartError, setCartError] = useState('');
  const [cartLoading, setCartLoading] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await api.products.getById(id);
        if (data.success) {
          setProduct(data.product);
        }
      } catch (error) {
        setErrorMsg('Failed to load product details');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      setCartError('Please login to add items to cart');
      return;
    }

    setCartLoading(true);
    setCartSuccess('');
    setCartError('');

    const res = await addToCart(product._id, qty);
    if (res.success) {
      setCartSuccess(`Added ${qty} item(s) to cart!`);
      setTimeout(() => setCartSuccess(''), 3000);
    } else {
      setCartError(res.message || 'Failed to add items to cart');
    }
    setCartLoading(false);
  };

  if (loading) return <div className="loading-spinner">Loading product...</div>;
  if (errorMsg || !product) return <div className="alert alert-danger text-center">{errorMsg || 'Product not found'}</div>;

  const isCustomer = !user || user.role === 'customer';

  return (
    <div>
      <Link to="/" style={{ color: 'var(--primary-color)', display: 'inline-block', marginBottom: '1.5rem', fontWeight: 'bold' }}>
        ← Back to Catalog
      </Link>

      <div className="card" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', padding: '2rem' }}>
        {/* Style grid responsive */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa', borderRadius: '8px', overflow: 'hidden', maxHeight: '400px' }}>
          <img 
            src={product.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80'} 
            alt={product.name} 
            style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain' }}
          />
        </div>

        <div>
          <span className="badge badge-info" style={{ textTransform: 'uppercase', marginBottom: '1rem' }}>
            {product.category?.name || 'Grocery'}
          </span>
          <h1 className="mb-3">{product.name}</h1>
          <h2 style={{ color: 'var(--secondary-color)', marginBottom: '1.5rem' }}>₹{product.price}</h2>
          
          <div className="mb-4">
            <h4>Description</h4>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>{product.description}</p>
          </div>

          <div className="mb-4" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <strong>Stock Status:</strong>
            <span style={{ color: product.stock > 0 ? 'var(--secondary-color)' : 'var(--danger-color)', fontWeight: 'bold' }}>
              {product.stock > 0 ? `${product.stock} units available` : 'Out of Stock'}
            </span>
          </div>

          {isCustomer && product.stock > 0 && (
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <label htmlFor="quantity" style={{ margin: 0, fontWeight: 'bold' }}>Quantity:</label>
                <select
                  id="quantity"
                  className="form-control"
                  style={{ width: '80px', padding: '0.4rem' }}
                  value={qty}
                  onChange={(e) => setQty(parseInt(e.target.value))}
                >
                  {[...Array(Math.min(10, product.stock)).keys()].map((n) => (
                    <option key={n + 1} value={n + 1}>
                      {n + 1}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={cartLoading}
                className="btn btn-primary"
                style={{ padding: '0.8rem 2rem', fontSize: '1rem' }}
              >
                {cartLoading ? 'Adding to Cart...' : 'Add to Cart'}
              </button>

              {cartSuccess && <div className="alert alert-success mt-3" style={{ maxWidth: '300px' }}>{cartSuccess}</div>}
              {cartError && <div className="alert alert-danger mt-3" style={{ maxWidth: '300px' }}>{cartError}</div>}
            </div>
          )}

          {isCustomer && product.stock <= 0 && (
            <div className="alert alert-danger mt-3" style={{ display: 'inline-block' }}>
              Temporarily Out of Stock. Please check back later.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// CSS trick for desktop
const cssCode = `
@media (min-width: 768px) {
  .product-detail-grid {
    grid-template-columns: 1fr 1fr !important;
  }
}
`;

export default ProductDetails;
