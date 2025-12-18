/**
 * Simple logger utility that respects environment.
 * In production, only errors are logged.
 * In development, all logs are shown.
 */

const isDev = process.env.NODE_ENV !== "production";

export const logger = {
  info: (...args) => isDev && console.log("[INFO]", ...args),
  error: (...args) => console.error("[ERROR]", ...args),
  debug: (...args) => isDev && console.log("[DEBUG]", ...args),
  warn: (...args) => console.warn("[WARN]", ...args),
};

export default logger;
