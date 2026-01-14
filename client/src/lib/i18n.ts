import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import enTranslations from "../locales/en.json";
import arTranslations from "../locales/ar.json";

// Language resources
const resources = {
  en: {
    translation: enTranslations,
  },
  ar: {
    translation: arTranslations,
  },
};

// Configure i18n
i18n
  .use(LanguageDetector) // Detects user language from browser
  .use(initReactI18next) // Passes i18n down to react-i18next
  .init({
    resources,
    fallbackLng: "en", // Default language
    supportedLngs: ["en", "ar"], // Supported languages
    
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    
    detection: {
      // Order and from where user language should be detected
      order: ["localStorage", "navigator", "htmlTag"],
      // Keys or params to lookup language from
      lookupLocalStorage: "i18nextLng",
      // Cache user language on
      caches: ["localStorage"],
    },
  });

// Helper to get direction (RTL/LTR) based on current language
export const getDirection = (lng?: string): "rtl" | "ltr" => {
  const currentLang = lng || i18n.language;
  return currentLang === "ar" ? "rtl" : "ltr";
};

// Update HTML dir attribute when language changes
i18n.on("languageChanged", (lng) => {
  const dir = getDirection(lng);
  document.documentElement.dir = dir;
  document.documentElement.lang = lng;
});

// Set initial direction
const initialDir = getDirection();
document.documentElement.dir = initialDir;
document.documentElement.lang = i18n.language;

export default i18n;
