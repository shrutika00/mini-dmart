import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

const Returns = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchReturns();
  }, []);

  const fetchReturns = async () => {
    try {
      const data = await api.returns.getAll();
      if (data.success) {
        setReturns(data.returnRequests);
      }
    } catch (error) {
      setErrorMsg('Failed to load return requests');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'badge-warning';
      case 'approved': return 'badge-info';
      case 'rejected': return 'badge-danger';
      case 'completed': return 'badge'; // green badge
      default: return 'badge-warning';
    }
  };

  if (loading) return <div className="loading-spinner">Loading return requests...</div>;
  if (errorMsg) return <div className="alert alert-danger text-center">{errorMsg}</div>;

  return (
    <div>
      <h2 className="mb-4">My Returns & Exchanges</h2>

      {returns.length === 0 ? (
        <div className="card empty-state">
          <h3>No returns or exchanges requested</h3>
          <p className="mb-4">You haven't requested any returns or exchanges. Go to an eligible delivered order details screen if you need to request one.</p>
          <Link to="/orders" className="btn btn-primary">View My Orders</Link>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Request Date</th>
                <th>Order ID</th>
                <th>Request Type</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {returns.map((req) => (
                <tr key={req._id}>
                  <td>{new Date(req.createdAt).toLocaleDateString()}</td>
                  <td>
                    <Link to={`/orders/${req.order?._id}`} style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>
                      #{req.order?._id ? req.order._id.substring(req.order._id.length - 8).toUpperCase() : 'Deleted'}
                    </Link>
                  </td>
                  <td style={{ textTransform: 'capitalize' }}>
                    <span className="badge badge-info">{req.type}</span>
                  </td>
                  <td>{req.reason}</td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(req.status)}`} style={{ textTransform: 'uppercase' }}>
                      {req.status}
                    </span>
                  </td>
                  <td>
                    {req.order?._id && (
                      <Link to={`/orders/${req.order._id}`} className="btn btn-outline" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}>
                        View Order
                      </Link>
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

export default Returns;
