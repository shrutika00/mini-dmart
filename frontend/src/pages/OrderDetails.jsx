import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Return request states
  const [returnType, setReturnType] = useState('return');
  const [returnReason, setReturnReason] = useState('');
  const [existingReturn, setExistingReturn] = useState(null);
  const [returnLoading, setReturnLoading] = useState(false);
  const [returnSuccess, setReturnSuccess] = useState('');
  const [returnError, setReturnError] = useState('');

  useEffect(() => {
    fetchOrderDetails();
    fetchReturnRequests();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      const data = await api.orders.getById(id);
      if (data.success) {
        setOrder(data.order);
      }
    } catch (error) {
      setErrorMsg('Failed to load order details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReturnRequests = async () => {
    try {
      const data = await api.returns.getAll();
      if (data.success) {
        // Find if there's an existing return request for this order
        const found = data.returnRequests.find(req => req.order._id === id);
        if (found) {
          setExistingReturn(found);
        }
      }
    } catch (error) {
      console.error('Error loading returns:', error.message);
    }
  };

  const handleCancelOrder = async () => {
    if (window.confirm('Are you sure you want to cancel this order? This will revert the item stocks.')) {
      try {
        const data = await api.orders.cancel(id);
        if (data.success) {
          alert('Order cancelled successfully.');
          fetchOrderDetails();
        }
      } catch (error) {
        alert(error.message || 'Failed to cancel order');
      }
    }
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    if (!returnReason.trim()) {
      setReturnError('Please enter a reason for the return/exchange.');
      return;
    }

    setReturnLoading(true);
    setReturnSuccess('');
    setReturnError('');

    try {
      const data = await api.returns.create({
        orderId: id,
        type: returnType,
        reason: returnReason
      });
      if (data.success) {
        setReturnSuccess('Return request submitted successfully!');
        setReturnReason('');
        // Refresh return state
        fetchReturnRequests();
      }
    } catch (error) {
      setReturnError(error.message || 'Failed to submit return request');
    } finally {
      setReturnLoading(false);
    }
  };

  // Check if order is eligible for return (status is DELIVERED and within 7 days)
  const isEligibleForReturn = () => {
    if (!order || order.status !== 'DELIVERED') return false;

    const orderDate = new Date(order.createdAt);
    const today = new Date();
    const diffTime = Math.abs(today - orderDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays <= 7;
  };

  if (loading) return <div className="loading-spinner">Loading order details...</div>;
  if (errorMsg || !order) return <div className="alert alert-danger text-center">{errorMsg || 'Order not found'}</div>;

  return (
    <div>
      <Link to="/orders" style={{ color: 'var(--primary-color)', display: 'inline-block', marginBottom: '1.5rem', fontWeight: 'bold' }}>
        ← Back to My Orders
      </Link>

      <div className="card mb-4">
        <div className="d-flex justify-between align-center mb-3" style={{ flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <div>
            <h2>Order Details</h2>
            <div style={{ color: 'var(--text-muted)' }}>Order ID: #{order._id}</div>
          </div>
          <div>
            <span className="badge badge-info" style={{ fontSize: '1rem', padding: '0.4rem 0.8rem' }}>
              Status: {order.status}
            </span>
          </div>
        </div>

        <div className="grid" style={{ gridTemplateColumns: '1fr', gap: '1.5rem', marginBottom: '2rem' }}>
          <div>
            <h4>Fulfillment Details</h4>
            <div className="mt-2">
              <strong>Fulfillment Type: </strong> {order.fulfillmentType}
            </div>
            {order.fulfillmentType === 'Home Delivery' ? (
              <div className="mt-1">
                <strong>Delivery Address: </strong> {order.deliveryAddress}
              </div>
            ) : (
              <div className="mt-1">
                <strong>Pickup Details: </strong> {new Date(order.pickupDate).toLocaleDateString()} at {order.pickupTime}
              </div>
            )}
            <div className="mt-1">
              <strong>Placed On: </strong> {new Date(order.createdAt).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Order Items Table */}
        <h4 className="mb-2">Items Ordered</h4>
        <div className="table-container mb-4" style={{ boxShadow: 'none', border: '1px solid var(--border-color)' }}>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item._id}>
                  <td>
                    <div className="d-flex align-center gap-2">
                      <img 
                        src={item.product?.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=50&q=80'} 
                        alt={item.product?.name} 
                        style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                      />
                      <span>{item.product?.name || 'Deleted Product'}</span>
                    </div>
                  </td>
                  <td>₹{item.price}</td>
                  <td>{item.quantity}</td>
                  <td style={{ fontWeight: 'bold' }}>₹{item.price * item.quantity}</td>
                </tr>
              ))}
              <tr>
                <td colSpan="3" style={{ textAlign: 'right', fontWeight: 'bold' }}>Grand Total:</td>
                <td style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--secondary-color)' }}>₹{order.totalAmount}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Cancel Button */}
        {['PLACED', 'CONFIRMED'].includes(order.status) && (
          <button onClick={handleCancelOrder} className="btn btn-danger">
            Cancel Order
          </button>
        )}
      </div>

      {/* Return/Exchange Section */}
      {existingReturn ? (
        <div className="card">
          <h3 className="mb-2">Return/Exchange Request Status</h3>
          <div className="mt-2">
            <strong>Request Type: </strong> <span style={{ textTransform: 'capitalize' }}>{existingReturn.type}</span>
          </div>
          <div className="mt-1">
            <strong>Reason provided: </strong> "{existingReturn.reason}"
          </div>
          <div className="mt-1">
            <strong>Status: </strong> 
            <span className={`badge ${existingReturn.status === 'approved' ? 'badge-info' : existingReturn.status === 'rejected' ? 'badge-danger' : 'badge-warning'}`} style={{ marginLeft: '0.5rem', textTransform: 'uppercase' }}>
              {existingReturn.status}
            </span>
          </div>
          <div className="mt-1" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Requested on: {new Date(existingReturn.createdAt).toLocaleDateString()}
          </div>
        </div>
      ) : isEligibleForReturn() ? (
        <div className="card">
          <h3 className="mb-3">Request Return or Exchange</h3>
          <p className="mb-3" style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            You are eligible to request a return or exchange for this order (delivered within 7 days). Please fill out the reason below.
          </p>

          {returnSuccess && <div className="alert alert-success">{returnSuccess}</div>}
          {returnError && <div className="alert alert-danger">{returnError}</div>}

          <form onSubmit={handleReturnSubmit}>
            <div className="form-group">
              <label htmlFor="returnType">Request Type</label>
              <select
                id="returnType"
                className="form-control"
                style={{ width: '250px' }}
                value={returnType}
                onChange={(e) => setReturnType(e.target.value)}
              >
                <option value="return">Return for Refund</option>
                <option value="exchange">Exchange Item</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="returnReason">Reason for Return/Exchange</label>
              <textarea
                id="returnReason"
                className="form-control"
                rows="3"
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                placeholder="Please describe why you want to return or exchange these items..."
                required
              ></textarea>
            </div>

            <button type="submit" disabled={returnLoading} className="btn btn-secondary">
              {returnLoading ? 'Submitting Request...' : 'Submit Request'}
            </button>
          </form>
        </div>
      ) : order.status === 'DELIVERED' ? (
        <div className="alert alert-danger text-center">
          This order was delivered more than 7 days ago and is no longer eligible for returns or exchanges.
        </div>
      ) : null}
    </div>
  );
};

export default OrderDetails;
