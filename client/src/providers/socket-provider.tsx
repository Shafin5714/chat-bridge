import { Socket, io } from "socket.io-client";
import {
  createContext,
  ReactNode,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { conversationSlice } from "@/store/slices";
import { BACKEND_URL } from "@/config/env";
import type { Conversation } from "@/types";

type Props = {
  children: ReactNode;
};

const SocketContext = createContext<{
  socket: Socket | null;
}>({
  socket: null,
});

export const SocketProvider = ({ children }: Props) => {
  const socketRef = useRef<Socket | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const { userInfo } = useAppSelector((store) => store.auth);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (userInfo) {
      const newSocket = io(BACKEND_URL, {
        withCredentials: true,
      });
      socketRef.current = newSocket;
      setSocket(newSocket);

      // Listen for online users
      newSocket.on("getOnlineUsers", (data: string[]) => {
        dispatch(conversationSlice.actions.setOnlineUsers(data));
      });

      // Listen for conversation updates
      newSocket.on("conversationUpdated", (conversation: Conversation) => {
        dispatch(conversationSlice.actions.updateConversation(conversation));
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

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = () => useContext(SocketContext);
