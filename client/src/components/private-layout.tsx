import { ModeToggle } from "./mode-toggle";
import { Outlet } from "react-router";
import { Button } from "./ui/button";
import { LogOut, User, MessageSquare } from "lucide-react";

export default function PrivateLayout() {
  return (
    <div className="h-screen">
      <div className="px-5 py-2 h-14 flex justify-between items-center">
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
          <Button variant="destructive">
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
