import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  // Don't show navbar on auth landing page if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="navbar">
      <Link to={user.role === 'admin' ? '/admin' : user.role === 'staff' ? '/staff' : '/home'} className="navbar-brand">
        🛒 Mini D-Mart
      </Link>

      <ul className="navbar-links">
        {user.role === 'customer' && (
          <>
            <li>
              <Link to="/home" className="navbar-link">Shop</Link>
            </li>
            <li>
              <Link to="/orders" className="navbar-link">My Orders</Link>
            </li>
            <li>
              <Link to="/returns" className="navbar-link">Returns</Link>
            </li>
            <li>
              <Link to="/cart" className="navbar-link">
                Cart <span className="badge">{cartCount}</span>
              </Link>
            </li>
          </>
        )}

        {user.role === 'staff' && (
          <>
            <li>
              <Link to="/staff" className="navbar-link">Staff Dashboard</Link>
            </li>
          </>
        )}

        {user.role === 'admin' && (
          <>
            <li>
              <Link to="/admin" className="navbar-link">Admin Dashboard</Link>
            </li>
          </>
        )}

        <div className="navbar-user-info">
          <span>Hello, <strong>{user.name}</strong> ({user.role})</span>
          <button onClick={handleLogout} className="btn btn-danger" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
            Logout
          </button>
        </div>
      </ul>
    </nav>
  );
};

export default Navbar;
