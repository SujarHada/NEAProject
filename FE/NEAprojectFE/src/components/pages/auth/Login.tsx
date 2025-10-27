import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import api from "../../../utils/api";
import useAuthStore from "../../../store/useAuthStore";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    setLoading(true);
    const fetchUser = async () => {
      try {
        const data = await useAuthStore.getState().getUser();
        if (data) {
          navigate("/", { replace: true });
        }
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post('/api/auth/login/', {
        email,
        password
      })

      const { access, user } = res.data;
      useAuthStore.getState().setAuth(access, user);
      navigate("/", { replace: true });
    } catch (err: any) {
      setError("Invalid credentials");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-overlay h-screen w-full fixed top-0 left-0 flex items-center justify-center bg-black z-50">
        <div className='border-4 animate-spin rounded-full h-24 z-[9999] w-24 border-t-white' ></div>
      </div>
    )
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300">
      <form
        onSubmit={handleLogin}
        className="bg-white/90 backdrop-blur-md p-10 rounded-2xl shadow-xl w-96 flex flex-col gap-6"
      >
        <h2 className="text-3xl font-bold text-center text-blue-900 mb-4">Welcome Back</h2>

        <input
          type="email"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-blue-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-300 p-3 rounded-lg outline-none transition-all duration-200"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-blue-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-300 p-3 rounded-lg outline-none transition-all duration-200"
        />

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold p-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

      </form>
    </div>
  );
};

export default Login;
