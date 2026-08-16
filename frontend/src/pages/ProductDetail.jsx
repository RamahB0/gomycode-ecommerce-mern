import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/products/${id}`).then(({ data }) => setProduct(data));
  }, [id]);

  async function handleAddToCart() {
    if (!user) {
      navigate('/login');
      return;
    }
    await addToCart(id, Number(quantity));
    setMessage('Added to cart!');
    setTimeout(() => setMessage(''), 2000);
  }

  if (!product) return <p className="page">Loading...</p>;

  return (
    <div className="page product-detail">
      <img src={product.imageUrl || 'https://placehold.co/500x400?text=No+Image'} alt={product.name} />
      <div>
        <h1>{product.name}</h1>
        <p className="category">{product.category}</p>
        <p className="price">${product.price.toFixed(2)}</p>
        <p>{product.description}</p>
        <p>{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</p>

        <div className="add-to-cart">
          <input
            type="number"
            min="1"
            max={product.stock}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
          <button onClick={handleAddToCart} disabled={product.stock === 0}>
            Add to Cart
          </button>
        </div>
        {message && <p className="success">{message}</p>}
      </div>
    </div>
  );
}
