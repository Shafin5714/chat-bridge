import { useState } from "react";
import { ModeToggle } from "./mode-toggle";
import { Outlet } from "react-router";
import { Button } from "./ui/button";
import { LogOut, User } from "lucide-react";
import { useLogoutMutation } from "@/store/api/authApi";
import { toast } from "sonner";
import { useAppSelector } from "@/store";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ProfileModal } from "@/features/chat/components/profile-modal";

export default function PrivateLayout() {
  const { userInfo } = useAppSelector((state) => state.auth);
  const [profileOpen, setProfileOpen] = useState(false);

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
          <img src="/logo.png" alt="Chat Bridge Icon" className="h-10 w-auto" />
        </Button>
        <div className="flex items-center gap-4">
          <ModeToggle />
          <Button
            variant="outline"
            className="gap-2 dark:border-gray-600"
            onClick={() => setProfileOpen(true)}
          >
            <Avatar className="h-6 w-6">
              <AvatarImage src={userInfo?.profilePic} />
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <span className="hidden sm:inline">Profile</span>
          </Button>
          <Button
            variant="destructive"
            onClick={handleLogout}
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
      <div className="h-[calc(100vh-3.5rem)]">
        <Outlet />
      </div>

      <ProfileModal open={profileOpen} onOpenChange={setProfileOpen} />
    </div>
  );
}
