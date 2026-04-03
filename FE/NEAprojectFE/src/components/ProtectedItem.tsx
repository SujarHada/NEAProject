import useAuthStore, { type AuthState } from "app/store/useAuthStore";

export const ProtectedItem = ({ children }: { children: React.ReactNode }) => {
  const user = useAuthStore((state: AuthState) => state.user);

  if (user?.role === "viewer") return null;

  return <>{children}</>;
};