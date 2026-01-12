import { Navigate, Outlet,useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

export const PrivateRoute = () => {
  const user = useSelector((state) => state.auth.user);
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export const PublicRoute = () => {
  const user = useSelector((state) => state.auth.user);
  const {path}=useLocation();
  if (user) return <Navigate to="/" replace />;
  return <Outlet />;
};

export const RoleBasedRoute = ({ allowedRoles, children }) => {
  const role = useSelector((state) => state.auth.role);
  return allowedRoles.includes(role)
    ? children
    : <Navigate to="/unauthorized" replace />;
};
  

