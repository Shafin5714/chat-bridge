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
    <div className="flex lg:hidden mb-4 border rounded-lg overflow-hidden">
      <Button
        variant={mobileView === "contacts" ? "default" : "ghost"}
        className="flex-1"
        onClick={() => setMobileView("contacts")}
      >
        <Users className="h-5 w-5 mr-2" />
        Contacts
      </Button>
      <Button
        variant={mobileView === "chat" ? "default" : "ghost"}
        className="flex-1"
        onClick={() => setMobileView("chat")}
      >
        <MessageSquare className="h-5 w-5 mr-2" />
        Chat
      </Button>
      <Button
        variant={mobileView === "media" ? "default" : "ghost"}
        className="flex-1"
        onClick={() => setMobileView("media")}
      >
        <Share2 className="h-5 w-5 mr-2" />
        Media
      </Button>
    </div>
  );
}
