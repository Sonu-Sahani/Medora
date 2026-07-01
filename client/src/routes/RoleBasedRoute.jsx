import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

// Usage: <RoleBasedRoute allowedRoles={['doctor']}>...</RoleBasedRoute>
const RoleBasedRoute = ({ allowedRoles, children }) => {
  const { role } = useAuth();

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default RoleBasedRoute;