import { Navigate } from "react-router";
import PrivateLayout from "@/components/layout/private-layout";
import { useAuth } from "@/features/auth/hooks";

export const PrivateRoute = () => {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? <PrivateLayout /> : <Navigate to="/login" />;
};
