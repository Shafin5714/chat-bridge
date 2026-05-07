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
import { Users, User as UserIcon, Check, Loader2 } from "lucide-react";
import { useCreateGroupMutation } from "@/store/api/conversationApi";
import { useGetConversationsQuery } from "@/store/api/conversationApi";
import { useAppSelector } from "@/store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { User } from "@/types";

type Props = {
  allUsers: User[];
};

export default function CreateGroupModal({ allUsers }: Props) {
  const [open, setOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [createGroup, { isLoading }] = useCreateGroupMutation();
  const { userInfo } = useAppSelector((state) => state.auth);

  const filteredUsers = allUsers.filter(
    (user) =>
      user._id !== userInfo?.id &&
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleMember = (userId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreate = async () => {
    if (!groupName.trim()) {
      toast.error("Please enter a group name");
      return;
    }
    if (selectedMembers.length < 1) {
      toast.error("Select at least 1 member");
      return;
    }

    try {
      await createGroup({
        name: groupName.trim(),
        memberIds: selectedMembers,
      }).unwrap();

      toast.success("Group created!");
      setOpen(false);
      setGroupName("");
      setSelectedMembers([]);
      setSearchTerm("");
    } catch {
      toast.error("Failed to create group");
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
          <Users className="h-4 w-4" />
          New Group
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md dark:border-gray-700 dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold dark:text-gray-100">
            Create Group Chat
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Group name..."
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="dark:border-gray-700 dark:bg-gray-800"
          />

          <div>
            <p className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
              Add Members ({selectedMembers.length} selected)
            </p>
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-2 dark:border-gray-700 dark:bg-gray-800"
            />
            <ScrollArea className="h-48">
              <div className="space-y-1">
                {filteredUsers.map((user) => {
                  const isSelected = selectedMembers.includes(user._id);
                  return (
                    <div
                      key={user._id}
                      onClick={() => toggleMember(user._id)}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors",
                        isSelected
                          ? "bg-blue-500/10 dark:bg-blue-600/20"
                          : "hover:bg-gray-100 dark:hover:bg-gray-800"
                      )}
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={user.profilePic} />
                        <AvatarFallback>
                          <UserIcon className="h-4 w-4 text-muted-foreground" />
                        </AvatarFallback>
                      </Avatar>
                      <span className="flex-1 text-sm font-medium dark:text-gray-200">
                        {user.name}
                      </span>
                      {isSelected && (
                        <Check className="h-4 w-4 text-blue-500" />
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          <Button
            onClick={handleCreate}
            disabled={isLoading || !groupName.trim() || selectedMembers.length < 1}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Create Group"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
