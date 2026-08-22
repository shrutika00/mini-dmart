import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';

const Checkout = () => {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();

  const [fulfillmentType, setFulfillmentType] = useState('Store Pickup'); // Default
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('Morning (9 AM - 12 PM)'); // Default slot
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const items = cart?.items || [];
  if (items.length === 0) {
    return (
      <div className="card text-center" style={{ maxWidth: '600px', margin: '4rem auto' }}>
        <h3>Your cart is empty</h3>
        <p className="mb-4">Add products to your cart before proceeding to checkout.</p>
        <Link to="/" className="btn btn-primary">Go to Shop</Link>
      </div>
    );
  }

  const cartTotal = items.reduce((total, item) => {
    return total + (item.product ? item.product.price * item.quantity : 0);
  }, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const orderData = {
      fulfillmentType,
      deliveryAddress: fulfillmentType === 'Home Delivery' ? deliveryAddress : undefined,
      pickupDate: fulfillmentType === 'Store Pickup' ? pickupDate : undefined,
      pickupTime: fulfillmentType === 'Store Pickup' ? pickupTime : undefined
    };

    try {
      const data = await api.orders.create(orderData);
      if (data.success) {
        // Clear local cart context state
        clearCart();
        alert('Order placed successfully!');
        navigate('/orders');
      }
    } catch (error) {
      setErrorMsg(error.message || 'Failed to place order. Please review stock availability.');
    } finally {
      setLoading(false);
    }
  };

  // Get tomorrow's date for minimum date selection limit
  const getTomorrowString = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <div>
      <h2 className="mb-4">Checkout</h2>
      
      {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

      <div className="checkout-flex">
        {/* Fulfillment form */}
        <div className="card">
          <h3 className="mb-3">Fulfillment Method</h3>

          <div className="tabs-container">
            <button
              type="button"
              className={`tab ${fulfillmentType === 'Store Pickup' ? 'active' : ''}`}
              onClick={() => setFulfillmentType('Store Pickup')}
              style={{ background: 'none', border: 'none', fontSize: '1rem' }}
            >
              🏪 Store Pickup
            </button>
            <button
              type="button"
              className={`tab ${fulfillmentType === 'Home Delivery' ? 'active' : ''}`}
              onClick={() => setFulfillmentType('Home Delivery')}
              style={{ background: 'none', border: 'none', fontSize: '1rem' }}
            >
              🚚 Home Delivery
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {fulfillmentType === 'Store Pickup' ? (
              <div>
                <p className="mb-3" style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  Save delivery charges! Choose your convenient date and time to collect the package from the nearest Mini D-Mart store.
                </p>

                <div className="form-group">
                  <label htmlFor="pickupDate">Select Pickup Date</label>
                  <input
                    type="date"
                    id="pickupDate"
                    className="form-control"
                    required
                    min={getTomorrowString()}
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="pickupTime">Select Pickup Time Slot</label>
                  <select
                    id="pickupTime"
                    className="form-control"
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    required
                  >
                    <option value="Morning (9 AM - 12 PM)">Morning (9 AM - 12 PM)</option>
                    <option value="Afternoon (12 PM - 3 PM)">Afternoon (12 PM - 3 PM)</option>
                    <option value="Evening (3 PM - 6 PM)">Evening (3 PM - 6 PM)</option>
                    <option value="Night (6 PM - 9 PM)">Night (6 PM - 9 PM)</option>
                  </select>
                </div>
              </div>
            ) : (
              <div>
                <p className="mb-3" style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  Enter your complete shipping address below. Delivery takes 1-2 business days.
                </p>

                <div className="form-group">
                  <label htmlFor="deliveryAddress">Complete Delivery Address</label>
                  <textarea
                    id="deliveryAddress"
                    className="form-control"
                    rows="4"
                    required
                    placeholder="Flat No, Building, Street Name, Pincode"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                  ></textarea>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-secondary mt-3"
              style={{ width: '100%', padding: '0.8rem', fontSize: '1rem' }}
              disabled={loading}
            >
              {loading ? 'Placing Order...' : 'Place Order'}
            </button>
          </form>
        </div>

        {/* Checkout Summary List */}
        <div>
          <div className="card">
            <h3 className="mb-3">Order Items</h3>
            
            <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '1rem' }}>
              {items.map((item) => (
                <div key={item._id} className="d-flex justify-between align-center mb-2" style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                  <div>
                    <div style={{ fontWeight: '500' }}>{item.product?.name}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      ₹{item.product?.price} x {item.quantity}
                    </div>
                  </div>
                  <strong style={{ color: 'var(--text-color)' }}>
                    ₹{(item.product ? item.product.price : 0) * item.quantity}
                  </strong>
                </div>
              ))}
            </div>

            <div className="d-flex justify-between" style={{ borderTop: '2px solid var(--border-color)', paddingTop: '1rem', marginTop: '1rem' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Grand Total:</span>
              <strong style={{ fontSize: '1.3rem', color: 'var(--secondary-color)' }}>₹{cartTotal}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
