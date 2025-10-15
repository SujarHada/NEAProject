import { useTranslation } from "react-i18next"

const Profile = () => {
  const { t, i18n } = useTranslation()

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang)
    localStorage.setItem("lang", lang)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f172a] text-gray-100">
      <div className="w-full max-w-sm text-center p-6">
        <h1 className="text-2xl font-semibold mb-6 text-blue-400">
          {t("profilePageTitle", { defaultValue: "Profile Page" })}
        </h1>

        <div className="space-y-4">
          <p className="text-gray-300">
            {t("language", { defaultValue: "Language:" })}
          </p>

          <div className="flex justify-center gap-3">
            <button
              onClick={() => changeLanguage("en")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                i18n.language === "en"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 hover:bg-gray-700 text-gray-300"
              }`}
            >
              🇬🇧 English
            </button>

            <button
              onClick={() => changeLanguage("np")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                i18n.language === "np"
                  ? "bg-green-600 text-white"
                  : "bg-gray-800 hover:bg-gray-700 text-gray-300"
              }`}
            >
              🇳🇵 नेपाली
            </button>
          </div>

          <p className="text-sm text-gray-400 mt-4">
            {t("currentLanguage", { defaultValue: "Current Language:" })}{" "}
            <span className="font-semibold text-blue-400 uppercase">
              {i18n.language}
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Profile
