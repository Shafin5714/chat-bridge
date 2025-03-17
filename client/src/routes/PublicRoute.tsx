import { Navigate, Outlet } from "react-router";

// import { useAuthContext } from '@/providers';

export const PublicRoute = () => {
  // const { isLoggedIn } = useAuthContext();
  const isLoggedIn = false;

  return isLoggedIn ? <Navigate to="/" /> : <Outlet />;
};
