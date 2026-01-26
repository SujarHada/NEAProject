import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./en/translation.json";
import np from "./np/translation.json";

i18n.use(initReactI18next).init({
	resources: {
		en: { translation: en },
		np: { translation: np },
	},
	fallbackLng: "en",
	debug: false,
	interpolation: { escapeValue: false },
	lng: localStorage.getItem("lang") || undefined,
});

export default i18n;
