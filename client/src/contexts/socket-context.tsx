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

export const SocketProvider = ({ children }: Props) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { userInfo } = useAppSelector((store) => store.auth);

  useEffect(() => {
    if (userInfo) {
      const socket = io(BACKEND_URL);

      setSocket(socket);
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
    return () => {
      socket?.close();
      setSocket(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInfo]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = () => useContext(SocketContext);
