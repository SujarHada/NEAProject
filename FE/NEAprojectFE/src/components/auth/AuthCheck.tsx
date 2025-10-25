import { useEffect, useState, type JSX } from "react";
import { useNavigate } from "react-router";
import useAuthStore from "../../store/useAuthStore";
import api from "../../utils/api";
import type { meResponse } from "../../interfaces/interfaces";
import { FaSpinner } from "react-icons/fa";

const AuthCheck = ({ children }: { children: JSX.Element }) => {
  const navigate = useNavigate();
  const { accessToken, setUser, clearAuth } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      if (!accessToken) {
        navigate("/login");
        return;
      }

      try {
        const res = await api.get<meResponse>("/api/auth/me/");
        setUser(res.data);
        setLoading(false);
      } catch (err) {
        clearAuth();
        navigate("/login");
      }
    };

    verifyToken();
  }, [accessToken, navigate, setUser, clearAuth]);

  if (loading)
    return (
      <div className="h-screen bg-[#1E2939] text-white flex justify-center items-center text-lg font-semibold">
        <FaSpinner size={16}/>
      </div>
    );

  return children;
};

export default AuthCheck;
