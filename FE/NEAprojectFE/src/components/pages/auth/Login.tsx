import { useState } from "react";
import { useNavigate } from "react-router";
import api from "../../../utils/api";
import useAuthStore from "../../../store/useAuthStore";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

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
