import { ModeToggle } from "./mode-toggle";
import { Outlet } from "react-router";

export default function PrivateLayout() {
  return (
    <div className="h-screen">
      <div className="px-4 py-2 h-14">
        <ModeToggle />
      </div>
      <div className="h-[calc(100vh-3.5rem)] bg-red-500">
        <Outlet />
      </div>
    </div>
  );
}
