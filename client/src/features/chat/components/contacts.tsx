import { Card, CardHeader } from "@/components/ui/card";
import { useGetUsersQuery } from "@/store/api/messageApi";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useAppDispatch, useAppSelector } from "@/store";
import { userSlice } from "@/store/slices";
import { useSocketContext } from "@/contexts/socket-context";
import { useEffect, useState } from "react";
import { Circle, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import moment from "moment";

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

    // Listen for updated users from socket
    socket?.on("updatedUsers", (users) => {
      dispatch(userSlice.actions.setUsers(users));
    });

    return () => {
      socket?.off("getOnlineUsers");
      socket?.off("updatedUsers");
    };
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
              <img
                src="/user-placeholder.png"
                alt="user"
                className="h-10 w-10"
              />
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
          <div className="p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search contacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-background py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <Separator />
          <div className="p-3">
            <ScrollArea className="h-[calc(100vh-22rem)] lg:h-[calc(100vh-18rem)]">
              <div className="space-y-2">
                {/* Filter users based on search term */}
                {userList.length &&
                  userList
                    ?.filter((user) =>
                      user.name
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()),
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
                            ? "bg-blue-500/10"
                            : "hover:bg-gray-50 dark:hover:bg-blue-700/10",
                        )}
                      >
                        <div className="flex w-full justify-between px-2 py-1">
                          <div className="flex gap-3">
                            <div className="relative">
                              <img
                                src="user-placeholder.png"
                                alt="user"
                                className="h-14 w-14"
                              />
                              <p className="absolute bottom-1 right-1 text-xs text-gray-500">
                                {onlineUsers.includes(user._id) ? (
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
                            </div>

                            <div className="flex flex-col gap-1">
                              <p className="line-clamp-1 text-base font-medium leading-normal text-gray-900 dark:text-[#E1E1E1]">
                                {user.name}
                              </p>
                              <p className="leading-norma line-clamp-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                                {user.lastMessage?.text || "No messages yet"}
                              </p>
                            </div>
                          </div>

                          <div>
                            <div className="shrink-0 text-right">
                              <p className="text-xs font-normal leading-normal text-gray-500">
                                {user.lastMessageTime
                                  ? moment(user.lastMessageTime).format(
                                      "h:mm a",
                                    )
                                  : ""}
                              </p>

                              {user.unreadCount > 0 && (
                                <div className="mt-1 flex justify-end">
                                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-xs font-semibold text-white">
                                    {user.unreadCount}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </Card>
    </div>
  );
}
