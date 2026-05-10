import { useAppSelector } from "@/store";

export function useAuth() {
  const { userInfo } = useAppSelector((state) => state.auth);

  return {
    userInfo,
    isAuthenticated: !!userInfo,
    userId: userInfo?.id,
  };
}
