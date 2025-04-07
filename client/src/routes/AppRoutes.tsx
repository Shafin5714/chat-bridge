import { Route, Routes } from "react-router";

// import { Error404 } from '@/components';

import { Chat } from "@/features/chat";
import { Register } from "@/features/auth";

import { PrivateRoute } from "./PrivateRoute";
import { PublicRoute } from "./PublicRoute";
import Error404 from "@/components/error404";
import { Login } from "@/features/auth/pages/login";

export const AppRoutes = () => {
  return (
    <>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
        </Route>

        <Route element={<PrivateRoute />}>
          <Route index element={<Chat />} />
        </Route>

        <Route path="*" element={<Error404 />} />
      </Routes>
    </>
  );
};
