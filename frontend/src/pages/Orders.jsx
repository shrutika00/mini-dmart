import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await api.orders.getAll();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (error) {
      setErrorMsg('Failed to load orders history');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order? This will revert the item stocks.')) {
      try {
        const data = await api.orders.cancel(orderId);
        if (data.success) {
          alert('Order cancelled successfully.');
          // Refresh order list
          fetchOrders();
        }
      } catch (error) {
        alert(error.message || 'Failed to cancel order');
      }
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'PLACED': return 'badge-info';
      case 'CONFIRMED': return 'badge-info';
      case 'PREPARING': return 'badge-warning';
      case 'READY_FOR_PICKUP': return 'badge-warning';
      case 'OUT_FOR_DELIVERY': return 'badge-warning';
      case 'DELIVERED': return 'badge'; // Default green badge
      case 'CANCELLED': return 'badge-danger';
      default: return 'badge-info';
    }
  };

  if (loading) return <div className="loading-spinner">Loading order history...</div>;
  if (errorMsg) return <div className="alert alert-danger text-center">{errorMsg}</div>;

  return (
    <div>
      <h2 className="mb-4">My Orders</h2>

      {orders.length === 0 ? (
        <div className="card empty-state">
          <h3>No orders placed yet</h3>
          <p className="mb-4">You haven't placed any orders with Mini D-Mart. Start adding products to your cart!</p>
          <Link to="/" className="btn btn-primary">Browse Products</Link>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date Placed</th>
                <th>Fulfillment</th>
                <th>Total Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>
                    <Link to={`/orders/${order._id}`} style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>
                      #{order._id.substring(order._id.length - 8).toUpperCase()}
                    </Link>
                  </td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>{order.fulfillmentType}</td>
                  <td style={{ fontWeight: 'bold' }}>₹{order.totalAmount}</td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Link to={`/orders/${order._id}`} className="btn btn-outline" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}>
                        View Details
                      </Link>
                      
                      {['PLACED', 'CONFIRMED'].includes(order.status) && (
                        <button
                          onClick={() => handleCancelOrder(order._id)}
                          className="btn btn-danger"
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Orders;
