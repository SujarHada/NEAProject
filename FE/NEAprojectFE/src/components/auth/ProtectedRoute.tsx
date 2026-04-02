import { Navigate, Outlet } from "react-router";
import useAuthStore, { type AuthState } from "app/store/useAuthStore";

interface ProtectedRouteProps {
	allowedRoles: string[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
	const userRole = useAuthStore((state: AuthState) => state.user?.role) || "";

	return allowedRoles.includes(userRole) ? (
		<Outlet />
	) : (
		<Navigate to="/home" replace />
	);
};

export default ProtectedRoute;
