import { Card, CardHeader } from "@/components/ui/card";
import { useGetConversationsQuery } from "@/store/api/conversation-api";
import { conversationApi } from "@/store/api/conversation-api";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { useAppDispatch, useAppSelector } from "@/store";
import { conversationSlice } from "@/store/slices";
import { useSocketContext } from "@/providers/socket-provider";
import { useEffect, useState } from "react";
import { Circle, Search, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import moment from "moment";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User as UserIcon } from "lucide-react";
import CreateGroupModal from "./create-group-modal";
import NewChatModal from "./new-chat-modal";
import type { Conversation, User } from "@/types";

type Props = {
  mobileView: string;
  setMobileView: React.Dispatch<
    React.SetStateAction<"contacts" | "chat" | "media">
  >;
};

export default function Contacts({ mobileView, setMobileView }: Props) {
  const { socket } = useSocketContext();
  const dispatch = useAppDispatch();

  // api
  useGetConversationsQuery();

  // state
  const [searchTerm, setSearchTerm] = useState("");
  const { conversations, selectedConversation, onlineUsers } = useAppSelector(
    (state) => state.conversation,
  );
  const userInfo = useAppSelector((state) => state.auth.userInfo);

  useEffect(() => {
    socket?.on("getOnlineUsers", (data: string[]) => {
      dispatch(conversationSlice.actions.setOnlineUsers(data));
    });

    return () => {
      socket?.off("getOnlineUsers");
    };
  }, [dispatch, socket]);

  /**
   * For a DM conversation, get the other user (not the current user).
   */
  const getOtherUser = (conv: Conversation): User | undefined => {
    return conv.members.find((m) => m._id !== userInfo?.id);
  };

  /**
   * Get the display name for a conversation.
   */
  const getConversationName = (conv: Conversation): string => {
    if (conv.type === "group") return conv.name || "Unnamed Group";
    const other = getOtherUser(conv);
    return other?.name || "Unknown User";
  };

  /**
   * Get the avatar for a conversation.
   */
  const getConversationAvatar = (conv: Conversation): string | undefined => {
    if (conv.type === "group") return conv.avatar || undefined;
    const other = getOtherUser(conv);
    return other?.profilePic;
  };

  /**
   * Check if a DM partner is online.
   */
  const isDMOnline = (conv: Conversation): boolean => {
    if (conv.type !== "dm") return false;
    const other = getOtherUser(conv);
    return other ? onlineUsers.includes(other._id) : false;
  };

  /**
   * Get last message preview text.
   */
  const getLastMessageText = (conv: Conversation): string => {
    if (!conv.lastMessage) return "No messages yet";
    if (conv.lastMessage.image && !conv.lastMessage.text) return "📷 Image";
    return conv.lastMessage.text || "No messages yet";
  };

  // Fetch ALL registered users for New Chat and Create Group modals
  const { data: allUsersData } = conversationApi.useGetAllUsersQuery();
  const allUsers: User[] = allUsersData?.data || [];

  const filteredConversations = conversations.filter((conv) => {
    const name = getConversationName(conv);
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div>
      <Card
        className={`h-full w-full rounded-none rounded-l-lg lg:w-96 ${
          mobileView === "contacts" ? "block" : "hidden"
        } lg:block`}
      >
        <CardHeader className="h-16 px-4 py-2">
          <h2 className="text-xl font-bold">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={userInfo?.profilePic} />
                <AvatarFallback>
                  <UserIcon className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <h2 className="text-base font-medium leading-normal text-gray-800 dark:text-[#E1E1E1]">
                  {userInfo?.name}
                </h2>
                <p className="text-sm font-normal leading-normal text-gray-500">
                  {userInfo?.email}
                </p>
              </div>
            </div>
          </h2>
        </CardHeader>
        <Separator className="dark:bg-gray-700" />
        <div>
          {/* Search Input */}
          <div className="space-y-2 p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-50 pl-10 dark:border-gray-800 dark:bg-gray-900"
              />
            </div>
            <div className="flex gap-2">
              <NewChatModal allUsers={allUsers} />
              <CreateGroupModal allUsers={allUsers} />
            </div>
          </div>

          <Separator />
          <div className="p-3">
            <ScrollArea className="h-[calc(100vh-22rem)] lg:h-[calc(100vh-18rem)]">
              <div className="space-y-2">
                {filteredConversations.length > 0 &&
                  filteredConversations.map((conv) => {
                    const isOnline = isDMOnline(conv);
                    return (
                      <div
                        key={conv._id}
                        onClick={() => {
                          dispatch(
                            conversationSlice.actions.setSelectedConversation(conv)
                          );
                          setMobileView("chat");
                        }}
                        className={cn(
                          "flex cursor-pointer items-center space-x-4 rounded-lg border p-2 transition-colors duration-200",
                          selectedConversation?._id === conv._id
                            ? "border-blue-500/30 bg-blue-500/10"
                            : "border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-blue-700/10",
                        )}
                      >
                        <div className="flex w-full justify-between px-2 py-1">
                          <div className="flex gap-3">
                            <div className="relative">
                              <Avatar className="h-14 w-14">
                                <AvatarImage src={getConversationAvatar(conv)} />
                                <AvatarFallback>
                                  {conv.type === "group" ? (
                                    <Users className="h-7 w-7 text-muted-foreground" />
                                  ) : (
                                    <UserIcon className="h-8 w-8 text-muted-foreground" />
                                  )}
                                </AvatarFallback>
                              </Avatar>
                              {conv.type === "dm" && (
                                <p className="absolute bottom-1 right-1 text-xs text-gray-500">
                                  {isOnline ? (
                                    <Circle
                                      fill="green"
                                      size={12}
                                      strokeWidth={0}
                                    />
                                  ) : (
                                    <Circle
                                      fill="red"
                                      size={12}
                                      strokeWidth={0}
                                    />
                                  )}
                                </p>
                              )}
                            </div>

                            <div className="flex flex-col gap-1">
                              <p className="line-clamp-1 text-base font-medium leading-normal text-gray-900 dark:text-[#E1E1E1]">
                                {getConversationName(conv)}
                              </p>
                              <p className="leading-norma line-clamp-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                                {getLastMessageText(conv)}
                              </p>
                            </div>
                          </div>

                          <div>
                            <div className="shrink-0 text-right">
                              <p className="text-xs font-normal leading-normal text-gray-500">
                                {conv.lastMessage?.createdAt
                                  ? moment(conv.lastMessage.createdAt).format(
                                      "h:mm a",
                                    )
                                  : ""}
                              </p>
                              {conv.type === "group" && (
                                <p className="mt-1 text-xs text-gray-400">
                                  {conv.members.length} members
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </ScrollArea>
          </div>
        </div>
      </Card>
    </div>
  );
}
