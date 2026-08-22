import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import ProductCard from '../components/ProductCard';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchQuery]);

  const fetchCategories = async () => {
    try {
      const data = await api.categories.getAll();
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Error loading categories:', error.message);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await api.products.getAll({
        search: searchQuery,
        category: selectedCategory
      });
      if (data.success) {
        setProducts(data.products);
      }
    } catch (error) {
      setErrorMsg('Failed to load products');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="catalog-header">
        <div className="search-bar-container">
          <input
            type="text"
            className="form-control"
            placeholder="Search groceries (e.g. Milk, Banana, Detergent)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-container">
          <button
            onClick={() => setSelectedCategory('')}
            className={`filter-chip ${selectedCategory === '' ? 'active' : ''}`}
          >
            All Products
          </button>
          {categories.map((category) => (
            <button
              key={category._id}
              onClick={() => setSelectedCategory(category._id)}
              className={`filter-chip ${selectedCategory === category._id ? 'active' : ''}`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      <h2 className="mb-4">
        {selectedCategory 
          ? `${categories.find(c => c._id === selectedCategory)?.name || 'Category'} List` 
          : 'Our Grocery Products'}
      </h2>

      {loading ? (
        <div className="loading-spinner">Fetching fresh stock...</div>
      ) : errorMsg ? (
        <div className="alert alert-danger text-center">{errorMsg}</div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <h3>No products found</h3>
          <p>We couldn't find any products matching your selection. Try adjusting your filters or search.</p>
        </div>
      ) : (
        <div className="grid">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
