import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar } from "@radix-ui/react-avatar";
import { useGetUsersQuery } from "@/store/api/messageApi";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useAppDispatch, useAppSelector } from "@/store";
import { userSlice } from "@/store/slices";
import { useSocketContext } from "@/contexts/socket-context";
import { useEffect, useState } from "react";
import { Circle, User, Search } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  mobileView: string;
};

export default function Contacts({ mobileView }: Props) {
  // hooks
  const { socket } = useSocketContext();
  const dispatch = useAppDispatch();

  // api
  useGetUsersQuery();

  // state
  const [searchTerm, setSearchTerm] = useState("");
  const { userList, selectedUser, onlineUsers } = useAppSelector(
    (state) => state.user,
  );
  const userInfo = useAppSelector((state) => state.auth.userInfo);

  useEffect(() => {
    socket?.on("getOnlineUsers", (data) => {
      dispatch(userSlice.actions.setOnlineUsers(data));
    });
  }, [dispatch, socket]);

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
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600"></div>
              <div className="flex flex-col">
                <h1 className="text-base font-medium leading-normal text-gray-800">
                  {userInfo?.name}
                </h1>
                <p className="text-sm font-normal leading-normal text-gray-500">
                  {userInfo?.email}
                </p>
              </div>
            </div>
          </h2>
        </CardHeader>
        <Separator className="mb-4" />
        <CardContent>
          {/* Search Input */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-background py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <ScrollArea className="h-[calc(100vh-22rem)] lg:h-[calc(100vh-18rem)]">
            <div className="space-y-4">
              {/* Filter users based on search term */}
              {userList
                .filter((user) =>
                  user.name.toLowerCase().includes(searchTerm.toLowerCase()),
                )
                .map((user) => (
                  <div
                    key={user._id}
                    onClick={() =>
                      dispatch(userSlice.actions.setSelectedUser(user))
                    }
                    className={cn(
                      "flex cursor-pointer items-center space-x-4 rounded-lg p-2 transition-colors duration-200",
                      selectedUser?._id === user._id
                        ? "bg-slate-800 text-white"
                        : "bg-secondary",
                      "hover:bg-slate-800 hover:text-white",
                    )}
                  >
                    <Avatar
                      className={cn(
                        "rounded-full border-2 border-blue-500 p-2 hover:border-gray-400",
                      )}
                    >
                      <User size={32} strokeWidth={2} />
                    </Avatar>

                    <div className="flex items-center gap-1">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-gray-500">
                        {onlineUsers.includes(user._id) ? (
                          <Circle fill="green" size={12} strokeWidth={0} />
                        ) : (
                          <Circle fill="red" size={12} strokeWidth={0} />
                        )}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
