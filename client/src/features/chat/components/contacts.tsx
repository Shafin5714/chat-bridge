import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { useGetUsersQuery } from "@/store/api/messageApi";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useAppDispatch, useAppSelector } from "@/store";
import { userSlice } from "@/store/slices";
import { useSocketContext } from "@/contexts/socket-context";
import { useEffect } from "react";

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
  const { userList, selectedUser } = useAppSelector((state) => state.user);

  useEffect(() => {
    socket?.on("getOnlineUsers", (data) => {
      console.log(data);
    });
  }, [socket]);

  return (
    <div>
      <Card
        className={`h-full w-full lg:w-80 ${
          mobileView === "contacts" ? "block" : "hidden"
        } lg:block`}
      >
        <CardHeader>
          <h2 className="text-xl font-bold">Contacts</h2>
        </CardHeader>
        <Separator className="mb-4" />
        <CardContent>
          <ScrollArea className="h-[calc(100vh-20rem)] lg:h-[calc(100vh-16rem)]">
            <div className="space-y-4">
              {userList.map((user) => (
                <div
                  key={user._id}
                  onClick={() =>
                    dispatch(userSlice.actions.setSelectedUser(user))
                  }
                  className={`${selectedUser?._id === user._id ? "bg-slate-800 text-white" : ""} flex cursor-pointer items-center space-x-4 rounded-lg bg-secondary p-2 transition-colors duration-200 hover:bg-slate-800 hover:text-white`}
                >
                  <Avatar>
                    <AvatarImage
                      src="https://picsum.photos/id/175/50/50"
                      className="rounded-full"
                    />
                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-gray-500">{"Online"}</p>
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
