import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Guards routes that require a logged-in user (cart, checkout, orders),
// redirecting to /login otherwise.
export default function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
