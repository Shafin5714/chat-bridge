import { ModeToggle } from "./mode-toggle";
import { Outlet } from "react-router";
import { Button } from "./ui/button";
import { LogOut, User, MessageSquare } from "lucide-react";
import { useLogoutMutation } from "@/store/api/authApi";

export default function PrivateLayout() {
  // api
  const [logout] = useLogoutMutation();

  const handleLogout = async () => {
    await logout().unwrap();
  };

  return (
    <div className="h-screen">
      <div className="flex h-14 items-center justify-between px-5 py-2">
        <Button variant="ghost" className="text-lg">
          <MessageSquare />
          Chat Bridge
        </Button>
        <div className="flex items-center gap-4">
          <ModeToggle />
          <Button variant="outline">
            <User />
            Profile
          </Button>
          <Button variant="destructive" onClick={handleLogout}>
            <LogOut />
            Logout
          </Button>
        </div>
      </div>
      <div className="h-[calc(100vh-3.5rem)] bg-red-500">
        <Outlet />
      </div>
    </div>
  );
}
