import { useAuth } from "@/features/auth/hooks";
import { Navigate, Outlet } from "react-router";

export const PublicRoute = () => {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? <Navigate to="/" /> : <Outlet />;
};
