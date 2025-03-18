import { ModeToggle } from "./mode-toggle";
import { Outlet } from "react-router";

export default function PrivateLayout() {
  return (
    <div className="h-screen">
      <div className="container">
        <ModeToggle />
      </div>
      <Outlet />
    </div>
  );
}
