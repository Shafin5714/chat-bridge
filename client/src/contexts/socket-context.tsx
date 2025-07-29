import { Socket, io } from "socket.io-client";
import {
  createContext,
  ReactNode,
  useContext,
  useState,
  useEffect,
} from "react";
import { useAppSelector } from "@/store";
import { BACKEND_URL } from "@/constants";

type Props = {
  children: ReactNode;
};

const SocketContext = createContext<{
  socket: Socket | null;
}>({
  socket: null,
});

import { useRef } from "react";

export const SocketProvider = ({ children }: Props) => {
  const socketRef = useRef<Socket | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const { userInfo } = useAppSelector((store) => store.auth);

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
  }, [userInfo]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = () => useContext(SocketContext);
