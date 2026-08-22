import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalProducts: 0, totalUsers: 0, totalOrders: 0, pendingReturns: 0 });
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [returns, setReturns] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics' | 'products' | 'categories' | 'users' | 'orders' | 'returns'

  // CRUD Form States - Categories
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [editCatId, setEditCatId] = useState(null);

  // CRUD Form States - Products
  const [prodName, setProdName] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodPrice, setProdPrice] = useState(0);
  const [prodCategory, setProdCategory] = useState('');
  const [prodImage, setProdImage] = useState('');
  const [prodStock, setProdStock] = useState(0);
  const [prodActive, setProdActive] = useState(true);
  const [editProdId, setEditProdId] = useState(null);
  
  // View switches
  const [showProductForm, setShowProductForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const statsRes = await api.users.getStats();
      const productsRes = await api.products.getAll({ adminMode: 'true' });
      const categoriesRes = await api.categories.getAll();
      const usersRes = await api.users.getAll();
      const ordersRes = await api.orders.getAll();
      const returnsRes = await api.returns.getAll();

      if (statsRes.success) setStats(statsRes.stats);
      if (productsRes.success) setProducts(productsRes.products);
      if (categoriesRes.success) setCategories(categoriesRes.categories);
      if (usersRes.success) setUsers(usersRes.users);
      if (ordersRes.success) setOrders(ordersRes.orders);
      if (returnsRes.success) setReturns(returnsRes.returnRequests);
    } catch (error) {
      console.error('Error fetching admin data:', error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- CATEGORIES CRUD ---
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      if (editCatId) {
        // Update
        const data = await api.categories.update(editCatId, { name: catName, description: catDesc });
        if (data.success) alert('Category updated!');
      } else {
        // Create
        const data = await api.categories.create({ name: catName, description: catDesc });
        if (data.success) alert('Category created!');
      }
      resetCategoryForm();
      loadAllData();
    } catch (error) {
      alert(error.message || 'Failed to submit category');
    }
  };

  const handleEditCategory = (cat) => {
    setEditCatId(cat._id);
    setCatName(cat.name);
    setCatDesc(cat.description || '');
    setShowCategoryForm(true);
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Are you sure you want to delete this category? Products using it might need re-assignment.')) {
      try {
        const data = await api.categories.delete(id);
        if (data.success) {
          alert('Category deleted successfully.');
          loadAllData();
        }
      } catch (error) {
        alert(error.message || 'Failed to delete category');
      }
    }
  };

  const resetCategoryForm = () => {
    setEditCatId(null);
    setCatName('');
    setCatDesc('');
    setShowCategoryForm(false);
  };

  // --- PRODUCTS CRUD ---
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (!prodCategory) {
      alert('Please select a category');
      return;
    }
    const productPayload = {
      name: prodName,
      description: prodDesc,
      price: parseFloat(prodPrice),
      category: prodCategory,
      image: prodImage,
      stock: parseInt(prodStock),
      isActive: prodActive
    };

    try {
      if (editProdId) {
        // Update
        const data = await api.products.update(editProdId, productPayload);
        if (data.success) alert('Product updated!');
      } else {
        // Create
        const data = await api.products.create(productPayload);
        if (data.success) alert('Product created!');
      }
      resetProductForm();
      loadAllData();
    } catch (error) {
      alert(error.message || 'Failed to submit product');
    }
  };

  const handleEditProduct = (prod) => {
    setEditProdId(prod._id);
    setProdName(prod.name);
    setProdDesc(prod.description);
    setProdPrice(prod.price);
    setProdCategory(prod.category?._id || '');
    setProdImage(prod.image || '');
    setProdStock(prod.stock);
    setProdActive(prod.isActive);
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to deactivate this product? Customers will not see it in catalog.')) {
      try {
        const data = await api.products.delete(id);
        if (data.success) {
          alert('Product deactivated successfully.');
          loadAllData();
        }
      } catch (error) {
        alert(error.message || 'Failed to deactivate product');
      }
    }
  };

  const resetProductForm = () => {
    setEditProdId(null);
    setProdName('');
    setProdDesc('');
    setProdPrice(0);
    setProdCategory('');
    setProdImage('');
    setProdStock(0);
    setProdActive(true);
    setShowProductForm(false);
  };

  // --- ORDERS / STATUS ---
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const data = await api.orders.updateStatus(orderId, newStatus);
      if (data.success) {
        alert('Order status updated.');
        loadAllData();
      }
    } catch (error) {
      alert(error.message || 'Failed to update order status');
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order? This will revert stocks.')) {
      try {
        const data = await api.orders.cancel(orderId);
        if (data.success) {
          alert('Order cancelled.');
          loadAllData();
        }
      } catch (error) {
        alert(error.message || 'Failed to cancel order');
      }
    }
  };

  // --- RETURNS ACTIONS ---
  const handleReturnAction = async (requestId, newStatus) => {
    try {
      const data = await api.returns.updateStatus(requestId, newStatus);
      if (data.success) {
        alert(`Return status updated to ${newStatus}.`);
        loadAllData();
      }
    } catch (error) {
      alert(error.message || 'Failed to update request');
    }
  };

  if (loading) return <div className="loading-spinner">Loading Admin Dashboard...</div>;

  return (
    <div>
      <h2 className="mb-4">Admin Dashboard</h2>

      {/* Tabs */}
      <div className="tabs-container">
        <button className={`tab ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')} style={{ background: 'none', border: 'none', fontSize: '1rem' }}>
          📊 Summary Stats
        </button>
        <button className={`tab ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')} style={{ background: 'none', border: 'none', fontSize: '1rem' }}>
          🍎 Products ({products.length})
        </button>
        <button className={`tab ${activeTab === 'categories' ? 'active' : ''}`} onClick={() => setActiveTab('categories')} style={{ background: 'none', border: 'none', fontSize: '1rem' }}>
          📁 Categories ({categories.length})
        </button>
        <button className={`tab ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')} style={{ background: 'none', border: 'none', fontSize: '1rem' }}>
          👥 Users ({users.length})
        </button>
        <button className={`tab ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')} style={{ background: 'none', border: 'none', fontSize: '1rem' }}>
          📦 Orders ({orders.length})
        </button>
        <button className={`tab ${activeTab === 'returns' ? 'active' : ''}`} onClick={() => setActiveTab('returns')} style={{ background: 'none', border: 'none', fontSize: '1rem' }}>
          🔄 Returns ({returns.length})
        </button>
      </div>

      {/* Tab: Summary Analytics */}
      {activeTab === 'analytics' && (
        <div>
          <div className="dashboard-grid">
            <div className="card stat-card">
              <h3>Total Products</h3>
              <div className="value">{stats.totalProducts}</div>
            </div>
            <div className="card stat-card">
              <h3>Total Registered Users</h3>
              <div className="value">{stats.totalUsers}</div>
            </div>
            <div className="card stat-card">
              <h3>Total Orders Logged</h3>
              <div className="value">{stats.totalOrders}</div>
            </div>
            <div className="card stat-card" style={{ borderLeft: '4px solid var(--warning-color)' }}>
              <h3>Pending Return Requests</h3>
              <div className="value" style={{ color: 'var(--warning-color)' }}>{stats.pendingReturns}</div>
            </div>
          </div>

          <div className="card">
            <h4>Quick Info Summary</h4>
            <p className="mt-2" style={{ color: 'var(--text-muted)' }}>
              Welcome back, Admin. You have full system-level CRUD controls over the Mini D-Mart application. 
              Click on the tabs above to manage inventory catalogs, category classification labels, registered employee/customer access, fulfillment statuses, and returned merchandise logs.
            </p>
          </div>
        </div>
      )}

      {/* Tab: Products Management */}
      {activeTab === 'products' && (
        <div>
          <div className="d-flex justify-between align-center mb-3">
            <h3>Manage Products</h3>
            <button onClick={() => { resetProductForm(); setShowProductForm(!showProductForm); }} className="btn btn-secondary">
              {showProductForm ? 'Cancel' : '+ Add Product'}
            </button>
          </div>

          {/* Product CRUD Form */}
          {showProductForm && (
            <div className="card mb-4" style={{ backgroundColor: '#fafafa' }}>
              <h4>{editProdId ? 'Edit Product' : 'Add New Product'}</h4>
              <form onSubmit={handleProductSubmit} className="mt-3">
                <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: 0 }}>
                  <div className="form-group">
                    <label>Product Name</label>
                    <input type="text" className="form-control" required value={prodName} onChange={(e) => setProdName(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <select className="form-control" required value={prodCategory} onChange={(e) => setProdCategory(e.target.value)}>
                      <option value="">-- Choose Category --</option>
                      {categories.map(c => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Price (₹)</label>
                    <input type="number" className="form-control" required value={prodPrice} onChange={(e) => setProdPrice(e.target.value)} min="0" step="any" />
                  </div>
                  <div className="form-group">
                    <label>Stock Count</label>
                    <input type="number" className="form-control" required value={prodStock} onChange={(e) => setProdStock(e.target.value)} min="0" />
                  </div>
                </div>

                <div className="form-group">
                  <label>Product Image Link (URL)</label>
                  <input type="text" className="form-control" value={prodImage} onChange={(e) => setProdImage(e.target.value)} placeholder="https://unsplash.com/... (optional)" />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea className="form-control" required value={prodDesc} onChange={(e) => setProdDesc(e.target.value)} rows="3"></textarea>
                </div>

                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input type="checkbox" id="prodActive" checked={prodActive} onChange={(e) => setProdActive(e.target.checked)} />
                  <label htmlFor="prodActive" style={{ margin: 0, cursor: 'pointer' }}>Make Active (visible to customers)</label>
                </div>

                <div className="d-flex gap-2 mt-3">
                  <button type="submit" className="btn btn-primary">Save Product</button>
                  <button type="button" onClick={resetProductForm} className="btn btn-outline">Cancel</button>
                </div>
              </form>
            </div>
          )}

          {/* Products List Table */}
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p._id}>
                    <td>
                      <div className="d-flex align-center gap-2">
                        <img src={p.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=50&q=80'} alt={p.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                        <strong style={{ color: p.isActive ? 'inherit' : 'var(--text-muted)' }}>{p.name}</strong>
                      </div>
                    </td>
                    <td>{p.category?.name || 'Uncategorized'}</td>
                    <td>₹{p.price}</td>
                    <td>{p.stock} units</td>
                    <td>
                      <span className={`badge ${p.isActive ? '' : 'badge-danger'}`}>{p.isActive ? 'Active' : 'Deactivated'}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => handleEditProduct(p)} className="btn btn-outline" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }}>Edit</button>
                        {p.isActive && (
                          <button onClick={() => handleDeleteProduct(p._id)} className="btn btn-danger" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }}>Deactivate</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Categories Management */}
      {activeTab === 'categories' && (
        <div>
          <div className="d-flex justify-between align-center mb-3">
            <h3>Manage Categories</h3>
            <button onClick={() => { resetCategoryForm(); setShowCategoryForm(!showCategoryForm); }} className="btn btn-secondary">
              {showCategoryForm ? 'Cancel' : '+ Add Category'}
            </button>
          </div>

          {/* Category Form */}
          {showCategoryForm && (
            <div className="card mb-4" style={{ backgroundColor: '#fafafa', maxWidth: '500px' }}>
              <h4>{editCatId ? 'Edit Category' : 'Create New Category'}</h4>
              <form onSubmit={handleCategorySubmit} className="mt-3">
                <div className="form-group">
                  <label>Category Name</label>
                  <input type="text" className="form-control" required value={catName} onChange={(e) => setCatName(e.target.value)} placeholder="e.g. Beverages" />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea className="form-control" value={catDesc} onChange={(e) => setCatDesc(e.target.value)} placeholder="Describe category..."></textarea>
                </div>
                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-primary">Save Category</button>
                  <button type="button" onClick={resetCategoryForm} className="btn btn-outline">Cancel</button>
                </div>
              </form>
            </div>
          )}

          {/* Category Table */}
          <div className="table-container" style={{ maxWidth: '700px' }}>
            <table>
              <thead>
                <tr>
                  <th>Category Name</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(c => (
                  <tr key={c._id}>
                    <td style={{ fontWeight: 'bold' }}>{c.name}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{c.description || 'No description'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => handleEditCategory(c)} className="btn btn-outline" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }}>Edit</button>
                        <button onClick={() => handleDeleteCategory(c._id)} className="btn btn-danger" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Users Directory */}
      {activeTab === 'users' && (
        <div className="table-container" style={{ maxWidth: '800px' }}>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Registered On</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td style={{ fontWeight: 'bold' }}>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`badge ${u.role === 'admin' ? 'badge-danger' : u.role === 'staff' ? 'badge-warning' : 'badge-info'}`} style={{ textTransform: 'uppercase' }}>
                      {u.role}
                    </span>
                  </td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: Orders Management */}
      {activeTab === 'orders' && (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Fulfillment</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o._id}>
                  <td>#{o._id.substring(o._id.length - 8).toUpperCase()}</td>
                  <td>
                    <strong>{o.user?.name}</strong> <br />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{o.user?.email}</span>
                  </td>
                  <td>
                    {o.fulfillmentType} <br />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {o.fulfillmentType === 'Home Delivery' 
                        ? o.deliveryAddress 
                        : `${new Date(o.pickupDate).toLocaleDateString()} @ ${o.pickupTime}`}
                    </span>
                  </td>
                  <td style={{ fontWeight: 'bold' }}>₹{o.totalAmount}</td>
                  <td>
                    <span className="badge badge-info">{o.status}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <select
                        className="form-control"
                        style={{ width: '150px', padding: '0.2rem' }}
                        value={o.status}
                        onChange={(e) => handleStatusChange(o._id, e.target.value)}
                      >
                        <option value="PLACED">PLACED</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="PREPARING">PREPARING</option>
                        <option value="READY_FOR_PICKUP">READY_FOR_PICKUP</option>
                        <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>

                      {['PLACED', 'CONFIRMED'].includes(o.status) && (
                        <button onClick={() => handleCancelOrder(o._id)} className="btn btn-danger" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}>
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

      {/* Tab: Returns Log */}
      {activeTab === 'returns' && (
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
              {returns.map(r => (
                <tr key={r._id}>
                  <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td>
                    <strong>{r.user?.name}</strong> <br />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{r.user?.email}</span>
                  </td>
                  <td>#{r.order?._id.substring(r.order._id.length - 8).toUpperCase()}</td>
                  <td style={{ textTransform: 'capitalize' }}>
                    <span className="badge badge-info">{r.type}</span>
                  </td>
                  <td>"{r.reason}"</td>
                  <td>
                    <span className={`badge ${r.status === 'approved' ? 'badge-info' : r.status === 'rejected' ? 'badge-danger' : r.status === 'completed' ? '' : 'badge-warning'}`} style={{ textTransform: 'uppercase' }}>
                      {r.status}
                    </span>
                  </td>
                  <td>
                    {r.status === 'pending' ? (
                      <div style={{ display: 'flex', gap: '0.3rem' }}>
                        <button onClick={() => handleReturnAction(r._id, 'approved')} className="btn btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>Approve</button>
                        <button onClick={() => handleReturnAction(r._id, 'rejected')} className="btn btn-danger" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>Reject</button>
                      </div>
                    ) : r.status === 'approved' ? (
                      <button onClick={() => handleReturnAction(r._id, 'completed')} className="btn btn-primary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>Mark Completed</button>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Resolved</span>
                    )}
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

export default AdminDashboard;
