import { Navigate, Outlet } from "react-router";

// import { useAuthContext } from '@/providers';

export const PrivateRoute = () => {
  // const { isLoggedIn } = useAuthContext();
  const isLoggedIn = true;

  return isLoggedIn ? <Outlet /> : <Navigate to="/login" />;
};
