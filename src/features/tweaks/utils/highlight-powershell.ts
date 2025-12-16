export function highlightPowerShell(code: string) {
  if (!code) return [];

  const lines = code.split("\n");
  
  return lines.map((line) => {
    // Basic syntax highlighting logic
    let type = "code";
    
    const trimmed = line.trim();
    if (trimmed.startsWith("#")) {
      type = "comment";
    } else if (trimmed.startsWith("$")) {
      type = "variable";
    } else if (/^(if|else|elseif|switch|function|filter|foreach|for|while|do|until|try|catch|finally|throw|trap|return|break|continue)\b/i.test(trimmed)) {
      type = "keyword";
    } else if (/\b(Get-|Set-|New-|Remove-|Add-|Clear-|Enable-|Disable-|Start-|Stop-|Restart-|Invoke-)\w+\b/i.test(trimmed)) {
      type = "cmdlet";
    } else if (/".*?"|'.*'/.test(line)) {
      // Very basic string detection (doesn't handle multiple strings well but better than nothing)
      // For a better implementation, we'd need to tokenize line parts
      // This will just mark the whole line as containing a string for now or we can return 'code' 
      // but let the UI handle simple partial coloring if we returned tokens.
      // Given constraints, let's keep line-based but with slightly more specific types for the *start* of lines
      // or simple overrides.
      // Actually, returning "string" for the whole line if it looks like a string assignment is safer.
      if (trimmed.startsWith("$") && (trimmed.includes('"') || trimmed.includes("'"))) {
         // Variable assignment with string
      } else if (trimmed.startsWith('"') || trimmed.startsWith("'")) {
         type = "string";
      }
    }

    return { type, content: line };
  });
}
