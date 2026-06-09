import i18next from "i18next";
import Backend from "i18next-fs-backend";
import middleware from "i18next-http-middleware";
import path from "path";

i18next
  .use(Backend) // Use the file system backend to load translation files
  .use(middleware.LanguageDetector) // Detect language from headers
  .init({
    backend: {
      loadPath: path.resolve(__dirname, "../../../locales/{{lng}}.json"), // Path to translation files
    },
    fallbackLng: "en", // Default language if none is detected
    preload: ["en", "ar"], // Preload supported languages
    detection: {
      order: ["header", "querystring", "cookie"], // Order to detect language
      caches: ["cookie"], // Cache user language in a cookie
    },
    debug: false, // Set to true to debug translations
  });

export default i18next;
export const i18nMiddleware = middleware.handle(i18next);
