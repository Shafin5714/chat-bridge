import { ModeToggle } from "./mode-toggle";
import { Outlet } from "react-router";
import { Button } from "./ui/button";
import { LogOut, User } from "lucide-react";
import { useLogoutMutation } from "@/store/api/authApi";
import { toast } from "sonner";

export default function PrivateLayout() {
  // api
  const [logout] = useLogoutMutation();

  const handleLogout = async () => {
    const res = await logout().unwrap();
    if (res.success) {
      toast.success(res.message);
    }
  };

  return (
    <div className="h-screen">
      <div className="flex h-14 items-center justify-between px-5 py-2">
        <Button variant="ghost" className="gap-2 text-lg">
          <img src="/icon.png" alt="Chat Bridge Icon" className="h-6 w-auto" />
          Chat Bridge
        </Button>
        <div className="flex items-center gap-4">
          <ModeToggle />
          <Button variant="outline" className="dark:border-gray-600">
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
