export type Token = { type: string; value: string };

// Minimal PowerShell-ish tokenizer using regex alternation. Kept small to avoid
// adding big dependencies. Returns tokens per line.
export function tokenizeLine(line: string): Token[] {
  // Use numbered capture groups to keep compatibility with older TS targets.
  const regex =
    /(#[\s\S]*$)|('(?:[^']*)')|("(?:[^"\\]|\\.)*")|(\$[a-zA-Z_][\w:\-]*)|([A-Za-z]+-[A-Za-z0-9]+)|(\b\d+(?:\.\d+)?\b)|\b(function|if|else|elseif|foreach|for|while|switch|param|return|begin|process|end|break|continue|throw|try|catch|finally|class|using|import-module)\b|(\b(?:true|false)\b)|([+\-*/=<>!%]+)|([\[\]{}();,:.])/gm;

  const tokens: Token[] = [];
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(line)) !== null) {
    const idx = m.index;
    if (idx > lastIndex) {
      tokens.push({ type: "text", value: line.slice(lastIndex, idx) });
    }
    // Groups by index:
    // 1: comment
    // 2: single-quoted string
    // 3: double-quoted string
    // 4: variable
    // 5: cmdlet
    // 6: number
    // 7: keyword
    // 8: boolean
    // 9: operator
    // 10: punctuation
    if (m[1]) tokens.push({ type: "comment", value: m[1] });
    else if (m[2]) tokens.push({ type: "string", value: m[2] });
    else if (m[3]) tokens.push({ type: "string", value: m[3] });
    else if (m[4]) tokens.push({ type: "variable", value: m[4] });
    else if (m[5]) tokens.push({ type: "cmdlet", value: m[5] });
    else if (m[6]) tokens.push({ type: "number", value: m[6] });
    else if (m[7]) tokens.push({ type: "keyword", value: m[7] });
    else if (m[8]) tokens.push({ type: "boolean", value: m[8] });
    else if (m[9]) tokens.push({ type: "operator", value: m[9] });
    else if (m[10]) tokens.push({ type: "punct", value: m[10] });
    else tokens.push({ type: "text", value: m[0] });
    lastIndex = idx + m[0].length;
  }
  if (lastIndex < line.length)
    tokens.push({ type: "text", value: line.slice(lastIndex) });
  return tokens;
}

export function tokenClass(type: string) {
  switch (type) {
    case "comment":
      return "text-green-500/80";
    case "string":
      return "text-yellow-300";
    case "variable":
      return "text-cyan-300";
    case "cmdlet":
      return "text-violet-300 font-medium";
    case "number":
      return "text-amber-300";
    case "keyword":
      return "text-rose-400 font-semibold";
    case "boolean":
      return "text-indigo-300 font-medium";
    case "operator":
    case "punct":
      return "text-foreground";
    default:
      return "text-foreground";
  }
}

export function highlightCode(code: string) {
  const lines = code ? code.split(/\r\n|\r|\n/) : [""];
  const highlighted = lines.map((l) => tokenizeLine(l));
  return { lines, highlighted };
}



