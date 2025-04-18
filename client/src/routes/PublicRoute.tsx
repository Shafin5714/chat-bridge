import { useAppSelector } from "@/store";
import { Navigate, Outlet } from "react-router";

export const PublicRoute = () => {
  const { userInfo } = useAppSelector((store) => store.auth);

  return userInfo ? <Navigate to="/" /> : <Outlet />;
};
