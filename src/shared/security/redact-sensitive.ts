export function redactSensitive(text: string) {
  if (!text) {
    return text;
  }

  let redactedText = text.replace(
    /([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+)\.[a-zA-Z]{2,}/g,
    "[REDACTED_EMAIL]"
  );

  redactedText = redactedText.replace(
    /(api[_-]?key|secret|token|password)\s*[:=]\s*['\"]?([A-Za-z0-9-_=+.\/]{8,})['\"]?/gi,
    "$1: [REDACTED]"
  );

  redactedText = redactedText.replace(/\b(AKIA[0-9A-Z]{16})\b/g, "[REDACTED_KEY]");
  redactedText = redactedText.replace(/\b([A-Za-z0-9-_]{32,})\b/g, (value) => {
    return value.length > 40 ? "[REDACTED]" : value;
  });

  return redactedText;
}
