import { Socket, io } from "socket.io-client";
import {
  createContext,
  ReactNode,
  useContext,
  useState,
  useEffect,
} from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { userSlice } from "@/store/slices";
import { BACKEND_URL } from "@/constants";

type Props = {
  children: ReactNode;
};

// interface User {
//   _id: string;
//   name: string;
//   email: string;
//   lastMessage: {
//     text: string;
//     image: string;
//     senderId: string;
//   } | null;
//   lastMessageTime: string | null;
//   unreadCount: number;
// }

const SocketContext = createContext<{
  socket: Socket | null;
  // setUsers: (users: User[]) => void;
}>({
  socket: null,
  // setUsers: () => {},
});

import { useRef } from "react";

export const SocketProvider = ({ children }: Props) => {
  const socketRef = useRef<Socket | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const { userInfo } = useAppSelector((store) => store.auth);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (userInfo) {
      const newSocket = io(BACKEND_URL, {
        query: {
          userId: userInfo.id,
        },
        withCredentials: true,
      });
      socketRef.current = newSocket;
      setSocket(newSocket);

      // Listen for updated users from socket
      newSocket.on("updatedUsers", (users) => {
        dispatch(userSlice.actions.setUsers(users));
      });
    } else {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
      }
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
      }
    };
  }, [userInfo, dispatch]);

  // const setUsers = (users: User[]) => {
  //   dispatch(userSlice.actions.setUsers(users));
  // };

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = () => useContext(SocketContext);
