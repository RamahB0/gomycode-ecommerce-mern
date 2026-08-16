import { Link } from 'react-router-dom';

export default function ProductCard({ product }) {
  return (
    <div className="product-card">
      <Link to={`/products/${product._id}`}>
        <img src={product.imageUrl || 'https://placehold.co/400x300?text=No+Image'} alt={product.name} />
        <h3>{product.name}</h3>
      </Link>
      <p className="price">${product.price.toFixed(2)}</p>
      <p className="category">{product.category}</p>
    </div>
  );
}
