// src/components/pages/CreateAccount.tsx
import { useState } from "react";
// import useAuthStore from "../../store/useAuthStore";
import axios from "axios";

const CreateAccount = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "viewer">("viewer");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
//   const accessToken = useAuthStore((state) => state.accessToken);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await axios.post(
        "http://localhost:8000/api/users/create/", // your BE endpoint
        { name, email, password, role },
        {
          headers: {
            // Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      setMessage("User created successfully ✅");
      setName("");
      setEmail("");
      setPassword("");
      setRole("viewer");
    } catch (err: any) {
      console.error(err);
      setMessage("Failed to create user ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300">
      <form
        onSubmit={handleSubmit}
        className="bg-white/90 backdrop-blur-md p-10 rounded-2xl shadow-xl w-96 flex flex-col gap-6"
      >
        <h2 className="text-3xl font-bold text-center text-blue-900 mb-4">
          Create Account
        </h2>

        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border border-blue-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-300 p-3 rounded-lg outline-none transition-all duration-200"
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-blue-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-300 p-3 rounded-lg outline-none transition-all duration-200"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-blue-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-300 p-3 rounded-lg outline-none transition-all duration-200"
          required
        />

        <select
          value={role}
          onChange={(e) => setRole(e.target.value as "admin" | "viewer")}
          className="border border-blue-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-300 p-3 rounded-lg outline-none transition-all duration-200"
          required
        >
          <option value="admin">Admin</option>
          <option value="viewer">Viewer</option>
        </select>

        {message && (
          <p
            className={`text-center ${
              message.includes("success") ? "text-green-600" : "text-red-500"
            }`}
          >
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold p-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
        >
          {loading ? "Creating..." : "Create Account"}
        </button>
      </form>
    </div>
  );
};

export default CreateAccount;
