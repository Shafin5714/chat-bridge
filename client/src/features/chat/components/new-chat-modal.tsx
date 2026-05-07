import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquarePlus, User as UserIcon, Circle, Loader2 } from "lucide-react";
import {
  useGetOrCreateDMMutation,
  useGetConversationsQuery,
} from "@/store/api/conversationApi";
import { useAppDispatch, useAppSelector } from "@/store";
import { conversationSlice } from "@/store/slices";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { User } from "@/types";

type Props = {
  allUsers: User[];
};

export default function NewChatModal({ allUsers }: Props) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [getOrCreateDM, { isLoading }] = useGetOrCreateDMMutation();
  const { onlineUsers } = useAppSelector((state) => state.conversation);
  const { userInfo } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  const filteredUsers = allUsers.filter(
    (user) =>
      user._id !== userInfo?.id &&
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStartChat = async (userId: string) => {
    try {
      const result = await getOrCreateDM({ userId }).unwrap();
      dispatch(
        conversationSlice.actions.setSelectedConversation(result.data)
      );
      setOpen(false);
      setSearchTerm("");
    } catch {
      toast.error("Failed to start conversation");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-2 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
        >
          <MessageSquarePlus className="h-4 w-4" />
          New Chat
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md dark:border-gray-700 dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold dark:text-gray-100">
            Start a New Chat
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="dark:border-gray-700 dark:bg-gray-800"
            autoFocus
          />

          <ScrollArea className="h-64">
            <div className="space-y-1">
              {filteredUsers.length === 0 && (
                <p className="py-4 text-center text-sm text-gray-500">
                  No users found
                </p>
              )}
              {filteredUsers.map((user) => {
                const isOnline = onlineUsers.includes(user._id);
                return (
                  <div
                    key={user._id}
                    onClick={() => handleStartChat(user._id)}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-colors",
                      "hover:bg-gray-100 dark:hover:bg-gray-800",
                      isLoading && "pointer-events-none opacity-50"
                    )}
                  >
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.profilePic} />
                        <AvatarFallback>
                          <UserIcon className="h-5 w-5 text-muted-foreground" />
                        </AvatarFallback>
                      </Avatar>
                      <span className="absolute bottom-0 right-0">
                        <Circle
                          fill={isOnline ? "green" : "red"}
                          size={10}
                          strokeWidth={0}
                        />
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium dark:text-gray-200">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
