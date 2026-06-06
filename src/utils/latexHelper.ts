export function fixLatex(text: string): string {
  if (!text) return text;

  // Fix squashed markdown tables that use inline "||" or "| |" instead of actual newlines
  let fixed = text;
  if (fixed.includes('|')) {
    // 1. Replace double-pipe separators "||" with newline and pipe "|\n|"
    fixed = fixed.replace(/\|\|/g, '|\n|');
    // 2. Transition between separator row and regular row, e.g. ":--- | | Text"
    fixed = fixed.replace(/(:?-+[:-]*[ \t]*\|)[ \t]*\|/g, '$1\n|');
  }
  
  // 0. Replace \[ \] with $$ $$ and \( \) with $ $
  fixed = fixed.replace(/\\\[/g, '$$$$').replace(/\\\]/g, '$$$$');
  fixed = fixed.replace(/\\\(/g, '$').replace(/\\\)/g, '$');
  
  // 1. Replace /ce or \/ce with \ce globally
  fixed = fixed.replace(/\\?\/ce/g, '\\ce');
  
  // 2. Fix missing braces in \ce commands, e.g., \ceH2SO4 -> \ce{H2SO4}
  // This regex matches \ce followed by optional spaces, then alphanumeric characters and underscores
  fixed = fixed.replace(/\\ce\s*([A-Za-z0-9_]+)/g, '\\ce{$1}');
  
  // 3. Tokenize into math blocks and text blocks to wrap \ce{...} in $...$
  // Math blocks are enclosed in $$...$$ or $...$
  const tokens = fixed.split(/(\$\$.*?\$\$|\$.*?\$)/gs);
  
  for (let i = 0; i < tokens.length; i++) {
    if (i % 2 === 0) {
      // Text block: wrap \ce{...} in $...$
      // We use a regex that matches \ce{ followed by anything until the first }
      tokens[i] = tokens[i].replace(/\\ce\{([^{}]+)\}/g, '$\\ce{$1}$');
    }
  }
  
  return tokens.join('');
}
