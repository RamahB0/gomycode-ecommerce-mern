import { useEffect, useState } from 'react';
import api from '../api';
import ProductCard from '../components/ProductCard';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');

    const params = {};
    if (keyword) params.keyword = keyword;
    if (category) params.category = category;

    api
      .get('/products', { params, signal: controller.signal })
      .then(({ data }) => setProducts(data))
      .catch((err) => {
        if (err.name !== 'CanceledError') setError('Could not load products. Is the API running?');
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [keyword, category]);

  const categories = [...new Set(products.map((p) => p.category))];

  return (
    <div className="page">
      <h1>Product Catalog</h1>
      <div className="filters">
        <input
          type="text"
          placeholder="Search products..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {loading && <p>Loading products...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && products.length === 0 && <p>No products found.</p>}

      <div className="product-grid">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
}
