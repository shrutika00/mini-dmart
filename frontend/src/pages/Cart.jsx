import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Cart = () => {
  const { cart, loading, updateQty, removeFromCart } = useCart();
  const navigate = useNavigate();

  const handleQtyChange = async (productId, currentQty, amount, stockLimit) => {
    const targetQty = currentQty + amount;
    if (targetQty <= 0) {
      // If quantity reaches 0, remove the item
      await removeFromCart(productId);
      return;
    }

    if (targetQty > stockLimit) {
      alert(`Cannot add more. Only ${stockLimit} units available in stock.`);
      return;
    }

    const res = await updateQty(productId, targetQty);
    if (!res.success) {
      alert(res.message);
    }
  };

  const handleRemove = async (productId) => {
    if (window.confirm('Are you sure you want to remove this item from your cart?')) {
      await removeFromCart(productId);
    }
  };

  if (loading && !cart) {
    return <div className="loading-spinner">Loading your cart...</div>;
  }

  const items = cart?.items || [];
  
  // Calculate total cart price
  const cartTotal = items.reduce((total, item) => {
    if (item.product) {
      return total + item.product.price * item.quantity;
    }
    return total;
  }, 0);

  return (
    <div>
      <h2 className="mb-4">Shopping Cart</h2>

      {items.length === 0 ? (
        <div className="card empty-state">
          <h3>Your cart is empty</h3>
          <p className="mb-4">Looks like you haven't added anything to your cart yet.</p>
          <Link to="/" className="btn btn-primary">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          {/* Cart Items List */}
          <div className="card" style={{ padding: 0 }}>
            {items.map((item) => {
              const prod = item.product;
              if (!prod) return null; // Handle if product was deleted

              return (
                <div key={item._id || prod._id} className="cart-item">
                  <img 
                    src={prod.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100&q=80'} 
                    alt={prod.name} 
                    className="cart-item-image"
                  />
                  
                  <div className="cart-item-info">
                    <Link to={`/products/${prod._id}`} style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--primary-color)' }}>
                      {prod.name}
                    </Link>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      Price: ₹{prod.price}
                    </div>
                    <div style={{ color: prod.stock > 0 ? 'var(--secondary-color)' : 'var(--danger-color)', fontSize: '0.8rem', fontWeight: 'bold' }}>
                      {prod.stock > 0 ? `${prod.stock} left in stock` : 'Out of Stock'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                    <div className="quantity-control">
                      <button 
                        onClick={() => handleQtyChange(prod._id, item.quantity, -1, prod.stock)}
                        className="qty-btn"
                      >
                        -
                      </button>
                      <span style={{ fontWeight: 'bold', minWidth: '20px', textAlign: 'center' }}>
                        {item.quantity}
                      </span>
                      <button 
                        onClick={() => handleQtyChange(prod._id, item.quantity, 1, prod.stock)}
                        className="qty-btn"
                        disabled={item.quantity >= prod.stock}
                      >
                        +
                      </button>
                    </div>

                    <div style={{ fontWeight: 'bold', color: 'var(--text-color)' }}>
                      Total: ₹{prod.price * item.quantity}
                    </div>

                    <button 
                      onClick={() => handleRemove(prod._id)}
                      style={{ background: 'none', border: 'none', color: 'var(--danger-color)', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline' }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cart Summary Card */}
          <div>
            <div className="card">
              <h3 className="mb-3">Order Summary</h3>
              
              <div className="d-flex justify-between mb-3" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                <span>Subtotal ({items.reduce((acc, i) => acc + i.quantity, 0)} items):</span>
                <strong style={{ fontSize: '1.2rem', color: 'var(--secondary-color)' }}>₹{cartTotal}</strong>
              </div>

              <div className="mb-4" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Fulfillment details, pickup date, or delivery address will be selected on the next screen.
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="btn btn-secondary"
                style={{ width: '100%', padding: '0.8rem', fontSize: '1rem' }}
                disabled={items.some(item => !item.product || item.quantity > item.product.stock)}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
