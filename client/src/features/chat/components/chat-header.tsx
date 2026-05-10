import { CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Users, User as UserIcon, Circle, ChevronLeft, Image } from "lucide-react";
import { cn } from "@/lib/utils";
import ChatSearch from "./chat-search";

type ChatHeaderProps = {
  conversationType?: "group" | "dm";
  headerName: string;
  headerAvatar?: string;
  isOnline: boolean;
  memberCount: number;
  showSearch: boolean;
  setShowSearch: (show: boolean) => void;
  conversationId?: string;
  onJumpToMessage: (messageId: string) => void;
  setMobileView: React.Dispatch<
    React.SetStateAction<"contacts" | "chat" | "media">
  >;
};

export default function ChatHeader({
  conversationType,
  headerName,
  headerAvatar,
  isOnline,
  memberCount,
  showSearch,
  setShowSearch,
  conversationId,
  onJumpToMessage,
  setMobileView,
}: ChatHeaderProps) {
  return (
    <CardHeader className="relative h-16 px-4 py-3 shrink-0">
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileView("contacts")}
            className="lg:hidden -ml-2 text-gray-500"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <div className="relative">
            <Avatar className="h-10 w-10">
              <AvatarImage src={headerAvatar} />
              <AvatarFallback>
                {conversationType === "group" ? (
                  <Users className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <UserIcon className="h-6 w-6 text-muted-foreground" />
                )}
              </AvatarFallback>
            </Avatar>
            {conversationType === "dm" && (
              <p className="absolute bottom-[1px] right-1 text-xs text-gray-500">
                {isOnline ? (
                  <Circle fill="green" size={12} strokeWidth={0} />
                ) : (
                  <Circle
                    className="rounded-full bg-red-600"
                    size={10}
                    strokeWidth={0}
                  />
                )}
              </p>
            )}
          </div>
          <div>
            <h2 className="text-lg font-semibold leading-tight text-gray-900 dark:text-[#E1E1E1]">
              {headerName}
            </h2>
            <p
              className={cn(
                "text-sm font-normal",
                conversationType === "group"
                  ? "text-gray-500"
                  : isOnline
                    ? "text-green-500"
                    : "text-red-600",
              )}
            >
              {conversationType === "group"
                ? `${memberCount} members`
                : isOnline
                  ? "Online"
                  : "Offline"}
            </p>
          </div>
        </div>

        <div className="flex">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSearch(!showSearch)}
            className="text-gray-500"
          >
            <Search className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileView("media")}
            className="lg:hidden text-gray-500"
          >
            <Image className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {showSearch && conversationId && (
        <ChatSearch
          conversationId={conversationId}
          onJumpToMessage={onJumpToMessage}
        />
      )}
    </CardHeader>
  );
}
