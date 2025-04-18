import { Navigate } from "react-router";
import PrivateLayout from "@/components/private-layout";
import { useAppSelector } from "@/store";

export const PrivateRoute = () => {
  const { userInfo } = useAppSelector((store) => store.auth);

  return userInfo ? <PrivateLayout /> : <Navigate to="/login" />;
};
