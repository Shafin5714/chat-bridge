import { Navigate } from "react-router";
import PrivateLayout from "@/components/PrivateLayout";

// import { useAuthContext } from '@/providers';

export const PrivateRoute = () => {
  // const { isLoggedIn } = useAuthContext();
  const isLoggedIn = true;

  return isLoggedIn ? <PrivateLayout /> : <Navigate to="/login" />;
};
