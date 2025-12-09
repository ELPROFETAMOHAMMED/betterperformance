import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Redact common sensitive patterns from a text blob so it can be displayed/shared safely.
 * This is intentionally conservative: it replaces emails, obvious api keys/tokens and basic
 * key-like assignments (api_key=..., secret: ...).
 */
export function redactSensitive(text: string) {
  if (!text) return text;
  // redact emails
  let out = text.replace(
    /([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+)\.[a-zA-Z]{2,}/g,
    "[REDACTED_EMAIL]"
  );

  // redact common key patterns (very generic)
  out = out.replace(
    /(api[_-]?key|secret|token|password)\s*[:=]\s*['\"]?([A-Za-z0-9-_=+.\/]{8,})['\"]?/gi,
    "$1: [REDACTED]"
  );

  // redact AWS-like keys and long base64-looking strings
  out = out.replace(/\b(AKIA[0-9A-Z]{16})\b/g, "[REDACTED_KEY]");
  out = out.replace(/\b([A-Za-z0-9-_]{32,})\b/g, (m) => {
    // only redact very long tokens to avoid wiping normal words
    return m.length > 40 ? "[REDACTED]" : m;
  });

  return out;
}



