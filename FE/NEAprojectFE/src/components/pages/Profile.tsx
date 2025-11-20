import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import useAuthStore from "../../store/useAuthStore";
import api from "../../utils/api";
import { useNavigate } from "react-router";
import { LogOut } from "lucide-react";
import axios from "axios";

const changePasswordSchema = z
  .object({
    old_password: z.string().min(8, "Please enter a valid password"),
    new_password: z.string().min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Please confirm your new password"),
  })
  .refine((data) => data.new_password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const createUserSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  email: z.email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["admin", "viewer"]),
});

type ChangePasswordForm = z.infer<typeof changePasswordSchema>;
type CreateUserForm = z.infer<typeof createUserSchema>;

const Profile = () => {
  const { t, i18n } = useTranslation();
  const { user, clearAuth } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"password" | "createUser">("password");
  const navigate = useNavigate()
  const logout = () => {
    clearAuth()
    navigate('/login')
  }

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("lang", lang);
  };

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
  } = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
  });

  const {
    register: registerUser,
    handleSubmit: handleUserSubmit,
    formState: { errors: userErrors },
    reset: resetUser,
  } = useForm<CreateUserForm>({
    resolver: zodResolver(createUserSchema),
  });

  const onChangePassword = async (data: ChangePasswordForm) => {
    const { confirmPassword, ...setData } = data;
    try {
      const res = await api.post("/api/auth/change-password/", setData);
      if(res.status === 200){
        logout()
        navigate('/login')
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response) {
          alert(err.response.data.error)
        } else if (err.request) {
          console.error("Network Error: Server not reachable")
        } else {
          console.error("Axios Error:", err.message)
        }
      } else {
        console.error("Unexpected Error:", err)
      }
    }
  };

  const onCreateUser = async (data: CreateUserForm) => {
    try {
      await api.post("/api/auth/signup/", {
        name: data.name,
        email: data.email,
        password: data.password,
        password_confirm: data.password,
        role: data.role,
      });
      resetUser();
    } catch (err) {
      console.error(err);
    }
  };

   return (
    <div className="relative h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#0b132b] via-[#1c2541] to-[#3a506b] text-gray-100 overflow-hidden p-4 sm:p-10">
      {/* 🌐 Language Switcher */}
      <div className="absolute top-4 sm:top-6 right-4 sm:right-8 flex items-center bg-white/10 border border-white/20 rounded-full px-2 sm:px-3 py-1 z-50">
        <button
          onClick={() => changeLanguage("en")}
          className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium transition ${
            i18n.language === "en"
              ? "bg-blue-600 text-white shadow-md"
              : "text-gray-300 hover:text-white"
          }`}
        >
          🇬🇧 EN
        </button>
        <button
          onClick={() => changeLanguage("np")}
          className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium transition ${
            i18n.language === "np"
              ? "bg-green-600 text-white shadow-md"
              : "text-gray-300 hover:text-white"
          }`}
        >
          🇳🇵 NP
        </button>
      </div>

      {/* 🧑‍💼 Main Card */}
      <div className="w-full relative h-full max-w-xl overflow-auto sm:max-w-2xl bg-white/10 border border-white/20 rounded-2xl sm:rounded-3xl shadow-2xl sm:p-10 text-center" style={{ scrollbarWidth: "none" }}>
        <h1 className="text-xl sm:text-4xl font-bold text-blue-300 mb-6">
          {t("profile.title")}
        </h1>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-8">
          <button
            onClick={() => setActiveTab("password")}
            className={`px-4 sm:px-6 py-2 rounded-lg sm:text-base font-semibold transition ${
              activeTab === "password"
                ? "bg-blue-600 text-white"
                : "bg-gray-800 hover:bg-gray-700 text-gray-300"
            }`}
          >
            {t("profile.changePassword")}
          </button>

          {/* {user?.role === "admin" && (
            <button
              onClick={() => setActiveTab("createUser")}
              className={`px-4 sm:px-6 py-2 rounded-lg sm:text-base font-semibold transition ${
                activeTab === "createUser"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 hover:bg-gray-700 text-gray-300"
              }`}
            >
              {t("profile.createUser")}
            </button>
          )} */}
        </div>

        {/* Tab Content */}
        <div className="mt-4 sm:mt-4">
          {activeTab === "password" && (
            <form
              onSubmit={handlePasswordSubmit(onChangePassword)}
              className="space-y-4 sm:space-y-5 max-w-sm sm:max-w-md mx-auto"
            >
              <input
                {...registerPassword("old_password")}
                type="password"
                placeholder={t("profile.currentPassword")}
                className="w-full bg-gray-900/80 border border-gray-700 rounded-md px-3 sm:px-4 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              {passwordErrors.old_password && (
                <p className="text-red-400 text-sm">{passwordErrors.old_password.message}</p>
              )}

              <input
                {...registerPassword("new_password")}
                type="password"
                placeholder={t("profile.newPassword")}
                className="w-full bg-gray-900/80 border border-gray-700 rounded-md px-3 sm:px-4 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              {passwordErrors.new_password && (
                <p className="text-red-400 text-sm">{passwordErrors.new_password.message}</p>
              )}

              <input
                {...registerPassword("confirmPassword")}
                type="password"
                placeholder={t("profile.confirmPassword")}
                className="w-full bg-gray-900/80 border border-gray-700 rounded-md px-3 sm:px-4 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              {passwordErrors.confirmPassword && (
                <p className="text-red-400 text-sm">{passwordErrors.confirmPassword.message}</p>
              )}

              <button type="submit" className="w-full mt-3 sm:mt-4 bg-blue-600 hover:bg-blue-700 transition text-white font-semibold py-2 rounded-md">
                {t("profile.updatePassword")}
              </button>
            </form>
          )}
{/* 
          {activeTab === "createUser" && user?.role === "admin" && (
            <form
              onSubmit={handleUserSubmit(onCreateUser)}
              className="space-y-4 sm:space-y-5 max-w-sm sm:max-w-md mx-auto"
            >
              <input
                {...registerUser("name")}
                type="text"
                placeholder={t("profile.name")}
                className="w-full bg-gray-900/80 border border-gray-700 rounded-md px-3 sm:px-4 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              {userErrors.name && <p className="text-red-400 text-sm">{userErrors.name.message}</p>}

              <input
                {...registerUser("email")}
                type="email"
                placeholder={t("profile.email")}
                className="w-full bg-gray-900/80 border border-gray-700 rounded-md px-3 sm:px-4 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              {userErrors.email && <p className="text-red-400 text-sm">{userErrors.email.message}</p>}

              <input
                {...registerUser("password")}
                type="password"
                placeholder={t("profile.password")}
                className="w-full bg-gray-900/80 border border-gray-700 rounded-md px-3 sm:px-4 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              {userErrors.password && (
                <p className="text-red-400 text-sm">{userErrors.password.message}</p>
              )}

              <select
                {...registerUser("role")}
                className="w-full bg-gray-900/80 border border-gray-700 rounded-md px-3 sm:px-4 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="viewer">{t("profile.viewer")}</option>
                <option value="admin">{t("profile.admin")}</option>
              </select>

              <button type="submit" className="w-full mt-3 sm:mt-4 bg-green-600 hover:bg-green-700 transition text-white font-semibold py-2 rounded-md">
                {t("profile.createAccount")}
              </button>
            </form>
          )} */}
        </div>

        <button
          onClick={logout}
          className="absolute top-4 left-4 sm:top-9 sm:left-6 flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 
             bg-red-600/80 hover:bg-red-700 text-white font-medium text-sm sm:text-base 
             rounded-full shadow-md transition-all duration-100 hover:shadow-red-400/30
             border border-white/10"
        >
          <LogOut size={16} />
          <span className="hidden md:inline">{t("profile.logout")}</span>
        </button>
      </div>
    </div>
  );
};

export default Profile;
