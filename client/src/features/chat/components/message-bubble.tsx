import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User as UserIcon } from "lucide-react";
import moment from "moment";
import { cn } from "@/lib/utils";
import type { Message } from "@/types";

type SenderInfo = {
  id: string;
  name: string;
  profilePic?: string;
};

type MessageBubbleProps = {
  message: Message;
  isMe: boolean;
  isGroup: boolean;
  sender: SenderInfo;
};

export default function MessageBubble({
  message,
  isMe,
  isGroup,
  sender,
}: MessageBubbleProps) {
  return (
    <div
      id={`msg-${message._id}`}
      className={cn(
        "flex rounded-lg transition-colors duration-500",
        isMe ? "justify-end" : "justify-start",
      )}
    >
      {/* Group chat: show sender avatar on left */}
      {isGroup && !isMe && (
        <div className="mr-2 mt-1 flex-shrink-0">
          <Avatar className="h-7 w-7">
            <AvatarImage src={sender.profilePic} />
            <AvatarFallback>
              <UserIcon className="h-4 w-4 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
        </div>
      )}
      <div
        className={`max-w-[70%] rounded-lg p-3 ${
          isMe
            ? "bg-blue-500 text-white"
            : "bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
        }`}
      >
        {/* Group chat: show sender name */}
        {isGroup && !isMe && (
          <p className="mb-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
            {sender.name}
          </p>
        )}
        {message.image && (
          <img
            src={message.image || "/placeholder.svg"}
            alt="Shared"
            className="mb-2 max-w-sm rounded-lg"
          />
        )}
        <p className="text-[1rem]">{message.text}</p>
        <p
          className={cn(
            "mt-1 text-xs",
            isMe ? "text-gray-200" : "text-gray-600 dark:text-gray-400",
          )}
        >
          {moment(message.createdAt).fromNow()}
        </p>
      </div>
    </div>
  );
}
