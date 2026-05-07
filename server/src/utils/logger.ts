/**
 * Simple logger utility that respects environment.
 * In production, only errors are logged.
 * In development, all logs are shown.
 */

const isDev = process.env.NODE_ENV !== "production";

export const logger = {
  info: (...args: unknown[]) => isDev && console.log("[INFO]", ...args),
  error: (...args: unknown[]) => console.error("[ERROR]", ...args),
  debug: (...args: unknown[]) => isDev && console.log("[DEBUG]", ...args),
  warn: (...args: unknown[]) => console.warn("[WARN]", ...args),
};

export default logger;
