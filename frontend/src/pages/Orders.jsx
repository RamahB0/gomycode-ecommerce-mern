import { useEffect, useState } from 'react';
import api from '../api';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/orders')
      .then(({ data }) => setOrders(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="page">Loading orders...</p>;

  return (
    <div className="page">
      <h1>My Orders</h1>
      {orders.length === 0 && <p>You haven't placed any orders yet.</p>}
      {orders.map((order) => (
        <div key={order._id} className="order-card">
          <p>
            <strong>Order:</strong> {order._id}
          </p>
          <p>
            <strong>Status:</strong> {order.status}
          </p>
          <p>
            <strong>Placed:</strong> {new Date(order.createdAt).toLocaleString()}
          </p>
          <ul>
            {order.items.map((item, idx) => (
              <li key={idx}>
                {item.name} x {item.quantity} = ${(item.price * item.quantity).toFixed(2)}
              </li>
            ))}
          </ul>
          <p>
            <strong>Total: ${order.itemsTotal.toFixed(2)}</strong>
          </p>
        </div>
      ))}
    </div>
  );
}
