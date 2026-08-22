import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const StaffDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [returns, setReturns] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'inventory' | 'returns'
  const [fulfillmentFilter, setFulfillmentFilter] = useState('All'); // 'All' | 'Store Pickup' | 'Home Delivery'

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Staff can view all orders, returns, and products
      const ordersData = await api.orders.getAll();
      const returnsData = await api.returns.getAll();
      const productsData = await api.products.getAll({ adminMode: 'true' }); // get all including inactive

      if (ordersData.success) setOrders(ordersData.orders);
      if (returnsData.success) setReturns(returnsData.returnRequests);
      if (productsData.success) setProducts(productsData.products);
    } catch (error) {
      console.error('Error loading staff dashboard data:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const data = await api.orders.updateStatus(orderId, newStatus);
      if (data.success) {
        alert('Order status updated successfully.');
        fetchDashboardData(); // reload
      }
    } catch (error) {
      alert(error.message || 'Failed to update order status');
    }
  };

  const handleReturnAction = async (requestId, newStatus) => {
    try {
      const data = await api.returns.updateStatus(requestId, newStatus);
      if (data.success) {
        alert(`Return request ${newStatus} successfully.`);
        fetchDashboardData(); // reload
      }
    } catch (error) {
      alert(error.message || 'Failed to update return request');
    }
  };

  const filteredOrders = orders.filter(order => {
    if (fulfillmentFilter === 'All') return true;
    return order.fulfillmentType === fulfillmentFilter;
  });

  const getStatusOptions = (order) => {
    // Return options suitable for the fulfillment type
    const common = ['PLACED', 'CONFIRMED', 'PREPARING', 'CANCELLED', 'DELIVERED'];
    if (order.fulfillmentType === 'Store Pickup') {
      return [...common, 'READY_FOR_PICKUP'];
    } else {
      return [...common, 'OUT_FOR_DELIVERY'];
    }
  };

  if (loading) return <div className="loading-spinner">Loading Staff Dashboard...</div>;

  return (
    <div>
      <h2 className="mb-4">Staff Dashboard</h2>

      {/* Tabs */}
      <div className="tabs-container">
        <button
          className={`tab ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
          style={{ background: 'none', border: 'none', fontSize: '1rem' }}
        >
          📦 Orders Management ({orders.length})
        </button>
        <button
          className={`tab ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventory')}
          style={{ background: 'none', border: 'none', fontSize: '1rem' }}
        >
          🍎 Inventory Preview ({products.length})
        </button>
        <button
          className={`tab ${activeTab === 'returns' ? 'active' : ''}`}
          onClick={() => setActiveTab('returns')}
          style={{ background: 'none', border: 'none', fontSize: '1rem' }}
        >
          🔄 Return/Exchange Requests ({returns.length})
        </button>
      </div>

      {/* Tab 1: Orders Management */}
      {activeTab === 'orders' && (
        <div>
          <div className="d-flex align-center gap-2 mb-3">
            <label htmlFor="fulfillmentFilter" style={{ fontWeight: 'bold' }}>Fulfillment Type: </label>
            <select
              id="fulfillmentFilter"
              className="form-control"
              style={{ width: '200px', display: 'inline-block' }}
              value={fulfillmentFilter}
              onChange={(e) => setFulfillmentFilter(e.target.value)}
            >
              <option value="All">All Orders</option>
              <option value="Store Pickup">Store Pickup Only</option>
              <option value="Home Delivery">Home Delivery Only</option>
            </select>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="card text-center mt-4">
              <h4>No orders found</h4>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Fulfillment</th>
                    <th>Current Status</th>
                    <th>Update Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order._id}>
                      <td>#{order._id.substring(order._id.length - 8).toUpperCase()}</td>
                      <td>
                        <strong>{order.user?.name}</strong> <br />
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{order.user?.email}</span>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.9rem' }}>
                          {order.items.map((item, index) => (
                            <div key={index}>
                              • {item.product?.name || 'Deleted Product'} (x{item.quantity})
                            </div>
                          ))}
                        </div>
                      </td>
                      <td style={{ fontWeight: 'bold' }}>₹{order.totalAmount}</td>
                      <td>
                        {order.fulfillmentType} <br />
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {order.fulfillmentType === 'Home Delivery' 
                            ? order.deliveryAddress 
                            : `${new Date(order.pickupDate).toLocaleDateString()} @ ${order.pickupTime}`}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-info">{order.status}</span>
                      </td>
                      <td>
                        <select
                          className="form-control"
                          style={{ width: '160px', padding: '0.3rem' }}
                          value={order.status}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        >
                          {getStatusOptions(order).map(status => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Inventory Preview */}
      {activeTab === 'inventory' && (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock Available</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map((prod) => (
                <tr key={prod._id}>
                  <td>
                    <div className="d-flex align-center gap-2">
                      <img 
                        src={prod.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=50&q=80'} 
                        alt={prod.name} 
                        style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                      />
                      <span style={{ fontWeight: 'bold' }}>{prod.name}</span>
                    </div>
                  </td>
                  <td>{prod.category?.name || 'Uncategorized'}</td>
                  <td>₹{prod.price}</td>
                  <td style={{ fontWeight: 'bold', color: prod.stock > 10 ? 'var(--text-color)' : prod.stock > 0 ? 'var(--warning-color)' : 'var(--danger-color)' }}>
                    {prod.stock} units
                  </td>
                  <td>
                    <span className={`badge ${prod.isActive ? '' : 'badge-danger'}`}>
                      {prod.isActive ? 'Active' : 'Deactivated'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Returns Management */}
      {activeTab === 'returns' && (
        <div>
          {returns.length === 0 ? (
            <div className="card text-center mt-4">
              <h4>No return or exchange requests found</h4>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Req Date</th>
                    <th>Customer</th>
                    <th>Order ID</th>
                    <th>Type</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {returns.map((req) => (
                    <tr key={req._id}>
                      <td>{new Date(req.createdAt).toLocaleDateString()}</td>
                      <td>
                        <strong>{req.user?.name}</strong> <br />
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{req.user?.email}</span>
                      </td>
                      <td>#{req.order?._id.substring(req.order._id.length - 8).toUpperCase()}</td>
                      <td>
                        <span className="badge badge-info" style={{ textTransform: 'capitalize' }}>
                          {req.type}
                        </span>
                      </td>
                      <td>"{req.reason}"</td>
                      <td>
                        <span className={`badge ${req.status === 'approved' ? 'badge-info' : req.status === 'rejected' ? 'badge-danger' : req.status === 'completed' ? '' : 'badge-warning'}`} style={{ textTransform: 'uppercase' }}>
                          {req.status}
                        </span>
                      </td>
                      <td>
                        {req.status === 'pending' ? (
                          <div style={{ display: 'flex', gap: '0.3rem' }}>
                            <button
                              onClick={() => handleReturnAction(req._id, 'approved')}
                              className="btn btn-secondary"
                              style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReturnAction(req._id, 'rejected')}
                              className="btn btn-danger"
                              style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                            >
                              Reject
                            </button>
                          </div>
                        ) : req.status === 'approved' ? (
                          <button
                            onClick={() => handleReturnAction(req._id, 'completed')}
                            className="btn btn-primary"
                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', width: '100%' }}
                          >
                            Mark Completed
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No actions</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StaffDashboard;
