import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useCart } from '../context/CartContext';

const initialAddress = { fullName: '', street: '', city: '', postalCode: '', country: '' };

export default function Checkout() {
  const { cart, total, refreshCart } = useCart();
  const [address, setAddress] = useState(initialAddress);
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [error, setError] = useState('');
  const [placedOrder, setPlacedOrder] = useState(null);
  const navigate = useNavigate();

  function handleChange(field) {
    return (e) => setAddress({ ...address, [field]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/orders', { shippingAddress: address, paymentMethod });
      setPlacedOrder(data);
      await refreshCart();
    } catch (err) {
      setError(err.response?.data?.message || 'Checkout failed.');
    }
  }

  if (placedOrder) {
    return (
      <div className="page">
        <h1>Order Confirmed!</h1>
        <p>
          Order <strong>{placedOrder._id}</strong> placed successfully. Total: $
          {placedOrder.itemsTotal.toFixed(2)}
        </p>
        <button onClick={() => navigate('/orders')}>View My Orders</button>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="page">
        <h1>Checkout</h1>
        <p>Your cart is empty.</p>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>Checkout</h1>
      <form onSubmit={handleSubmit} className="checkout-form">
        <h2>Shipping Address</h2>
        <input placeholder="Full name" value={address.fullName} onChange={handleChange('fullName')} required />
        <input placeholder="Street" value={address.street} onChange={handleChange('street')} required />
        <input placeholder="City" value={address.city} onChange={handleChange('city')} required />
        <input
          placeholder="Postal code"
          value={address.postalCode}
          onChange={handleChange('postalCode')}
          required
        />
        <input placeholder="Country" value={address.country} onChange={handleChange('country')} required />

        <h2>Payment Method</h2>
        <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
          <option>Cash on Delivery</option>
          <option>Credit Card</option>
          <option>PayPal</option>
        </select>

        <h2>Order Summary</h2>
        <ul>
          {cart.map((item) => (
            <li key={item.product._id}>
              {item.product.name} x {item.quantity} = $
              {(item.product.price * item.quantity).toFixed(2)}
            </li>
          ))}
        </ul>
        <p>
          <strong>Total: ${total.toFixed(2)}</strong>
        </p>

        {error && <p className="error">{error}</p>}
        <button type="submit">Place Order</button>
      </form>
    </div>
  );
}
