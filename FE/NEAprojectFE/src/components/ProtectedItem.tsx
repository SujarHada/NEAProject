import useAuthStore from "app/store/useAuthStore";

export const ProtectedItem = ({ children }: { children: React.ReactNode }) => {
  const user = useAuthStore((state) => state.user);

  if (user?.role !== "admin") return null;

  return <>{children}</>;
};