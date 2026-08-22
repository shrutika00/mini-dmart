const API_URL = '/api';

// Helper to make fetch requests with auth headers
const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers
  };

  const response = await fetch(`${API_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
};

export const api = {
  // Auth API
  auth: {
    register: (userData) => request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    }),
    login: (credentials) => request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    }),
    getMe: () => request('/auth/me')
  },

  // Products API
  products: {
    getAll: (params = {}) => {
      const queryParams = new URLSearchParams();
      if (params.search) queryParams.append('search', params.search);
      if (params.category) queryParams.append('category', params.category);
      if (params.adminMode) queryParams.append('adminMode', params.adminMode);
      
      const queryStr = queryParams.toString();
      return request(`/products${queryStr ? `?${queryStr}` : ''}`);
    },
    getById: (id) => request(`/products/${id}`),
    create: (productData) => request('/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    }),
    update: (id, productData) => request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData)
    }),
    delete: (id) => request(`/products/${id}`, {
      method: 'DELETE'
    })
  },

  // Categories API
  categories: {
    getAll: () => request('/categories'),
    create: (categoryData) => request('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData)
    }),
    update: (id, categoryData) => request(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData)
    }),
    delete: (id) => request(`/categories/${id}`, {
      method: 'DELETE'
    })
  },

  // Cart API
  cart: {
    get: () => request('/cart'),
    add: (productId, quantity) => request('/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity })
    }),
    updateQty: (productId, quantity) => request(`/cart/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity })
    }),
    remove: (productId) => request(`/cart/${productId}`, {
      method: 'DELETE'
    })
  },

  // Orders API
  orders: {
    create: (orderData) => request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    }),
    getAll: () => request('/orders'),
    getById: (id) => request(`/orders/${id}`),
    updateStatus: (id, status) => request(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    }),
    cancel: (id) => request(`/orders/${id}/cancel`, {
      method: 'DELETE'
    })
  },

  // Returns API
  returns: {
    create: (returnData) => request('/returns', {
      method: 'POST',
      body: JSON.stringify(returnData)
    }),
    getAll: () => request('/returns'),
    updateStatus: (id, status) => request(`/returns/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    })
  },

  // Users / Admin Stats API
  users: {
    getAll: () => request('/users'),
    getStats: () => request('/users/stats')
  }
};
