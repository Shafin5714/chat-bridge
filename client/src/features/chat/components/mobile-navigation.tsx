import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MessageSquare, Share2, Users } from "lucide-react";

type Props = {
  mobileView: "contacts" | "chat" | "media";
  setMobileView: React.Dispatch<
    React.SetStateAction<"contacts" | "chat" | "media">
  >;
};

export default function MobileNavigation({ mobileView, setMobileView }: Props) {
  return (
    <div className="flex justify-center rounded-sm lg:hidden">
      <Button
        className={cn(
          "flex-1 rounded-none rounded-l-md hover:bg-blue-500 hover:text-white",
          mobileView === "contacts"
            ? "bg-blue-500 text-white"
            : "bg-white text-black",
        )}
        onClick={() => setMobileView("contacts")}
      >
        <Users className="mr-2 h-5 w-5" />
        Contacts
      </Button>
      <Button
        className={cn(
          "flex-1 rounded-none hover:bg-blue-500 hover:text-white",
          mobileView === "chat"
            ? "bg-blue-500 text-white"
            : "bg-white text-black",
        )}
        onClick={() => setMobileView("chat")}
      >
        <MessageSquare className="mr-2 h-5 w-5" />
        Chat
      </Button>
      <Button
        className={cn(
          "flex-1 rounded-none rounded-r-md hover:bg-blue-500 hover:text-white",
          mobileView === "media"
            ? "bg-blue-500 text-white"
            : "bg-white text-black",
        )}
        onClick={() => setMobileView("media")}
      >
        <Share2 className="mr-2 h-5 w-5" />
        Media
      </Button>
    </div>
  );
}
