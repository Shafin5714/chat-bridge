import { Button } from "@/components/ui/button";
import { MessageSquare, Share2, Users } from "lucide-react";

type Props = {
  mobileView: "contacts" | "chat" | "media";
  setMobileView: React.Dispatch<
    React.SetStateAction<"contacts" | "chat" | "media">
  >;
};

export default function MobileNavigation({ mobileView, setMobileView }: Props) {
  return (
    <div className="flex justify-center rounded-sm bg-white lg:hidden">
      <Button
        variant={mobileView === "contacts" ? "default" : "ghost"}
        className="flex-1 hover:bg-black hover:text-white"
        onClick={() => setMobileView("contacts")}
      >
        <Users className="mr-2 h-5 w-5" />
        Contacts
      </Button>
      <Button
        variant={mobileView === "chat" ? "default" : "ghost"}
        className="flex-1 hover:bg-black hover:text-white"
        onClick={() => setMobileView("chat")}
      >
        <MessageSquare className="mr-2 h-5 w-5" />
        Chat
      </Button>
      <Button
        variant={mobileView === "media" ? "default" : "ghost"}
        className="flex-1 hover:bg-black hover:text-white"
        onClick={() => setMobileView("media")}
      >
        <Share2 className="mr-2 h-5 w-5" />
        Media
      </Button>
    </div>
  );
}
