import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import Loader from "../components/common/Loader.jsx";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, initialCheckDone, loading } = useAuth();

  if (!initialCheckDone || loading) {
    return <Loader fullScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;