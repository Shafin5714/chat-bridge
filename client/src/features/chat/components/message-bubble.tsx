import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User as UserIcon, FileIcon, Download } from "lucide-react";
import moment from "moment";
import { cn, downloadFile } from "@/lib/utils";
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
  onLoad?: () => void;
};

export default function MessageBubble({
  message,
  isMe,
  isGroup,
  sender,
  onLoad,
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
        
        {/* Legacy image support */}
        {message.image && !message.attachment && (
          <img
            src={message.image || "/placeholder.svg"}
            alt="Shared"
            className="mb-2 max-h-[350px] max-w-[280px] sm:max-w-[320px] rounded-lg object-contain bg-black/5 dark:bg-white/5"
            onLoad={onLoad}
          />
        )}

        {/* Multi-file attachment support */}
        {message.attachment && (
          <div className="mb-2">
            {message.attachment.type.startsWith("video") ? (
              <video
                controls
                src={message.attachment.url}
                className="max-w-xs md:max-w-sm rounded-lg"
                onLoadedData={onLoad}
              />
            ) : message.attachment.type.startsWith("audio") ? (
              <audio
                controls
                src={message.attachment.url}
                className="max-w-xs md:max-w-sm"
                onLoadedData={onLoad}
              />
            ) : message.attachment.type.startsWith("image") ? (
              <img
                src={message.attachment.url}
                alt="Shared"
                className="max-h-[350px] max-w-[280px] sm:max-w-[320px] rounded-lg object-contain bg-black/5 dark:bg-white/5"
                onLoad={onLoad}
              />
            ) : (
              <button
                onClick={() => downloadFile(message.attachment!.url, message.attachment!.name)}
                className={`flex w-full cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                  isMe
                    ? "border-blue-400 bg-blue-600 hover:bg-blue-700"
                    : "border-gray-300 bg-gray-100 hover:bg-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
                }`}
              >
                <div className={cn("rounded-md p-2", isMe ? "bg-blue-500" : "bg-white dark:bg-gray-800")}>
                  <FileIcon className="h-6 w-6" />
                </div>
                <div className="flex flex-col flex-1 text-left">
                  <span className="max-w-[150px] truncate text-sm font-medium">
                    {message.attachment.name}
                  </span>
                  <span className={cn("text-xs", isMe ? "text-blue-200" : "text-gray-500")}>
                    {(message.attachment.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
                <Download className={cn("h-4 w-4 shrink-0", isMe ? "text-blue-200" : "text-gray-500")} />
              </button>
            )}
          </div>
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
