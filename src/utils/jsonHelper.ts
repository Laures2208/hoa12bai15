export function parseAIJSON(jsonStr: string) {
  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    console.warn("JSON.parse failed, attempting to sanitize JSON string...", e);
    // Remove markdown code blocks if present
    let cleaned = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    try {
      return JSON.parse(cleaned);
    } catch (e2) {
      console.warn("Sanitized JSON parse failed, attempting to escape backslashes...", e2);
      
      // Fix \u not followed by 4 hex digits (e.g. \uparrow, \underline)
      cleaned = cleaned.replace(/(?<!\\)\\u(?![0-9a-fA-F]{4})/g, '\\\\u');
      
      // Fix backslashes not followed by valid escape characters
      // Valid JSON escape characters: ", \, /, b, f, n, r, t, u
      cleaned = cleaned.replace(/(?<!\\)\\(?!["\\/bfnrtu])/g, '\\\\');
      
      // Fix common LaTeX commands that start with valid JSON escape characters
      // We use (?![a-zA-Z]) to ensure we match the exact command and not a prefix of a regular word
      cleaned = cleaned.replace(/(?<!\\)\\f(?=(?:rac|box|color|ootnotesize|ramebox|all|lat|orall)(?![a-zA-Z]))/g, '\\\\f');
      cleaned = cleaned.replace(/(?<!\\)\\b(?=(?:egin|f|oldsymbol|ackground|matrix|mod|oxtimes|ar|eta|ot|reak|ullet|ig[a-zA-Z]*|inomial|ackslash)(?![a-zA-Z]))/g, '\\\\b');
      cleaned = cleaned.replace(/(?<!\\)\\r(?=(?:ight[a-zA-Z]*|m|eq|angle|brace|brack|oot|ho|e)(?![a-zA-Z]))/g, '\\\\r');
      cleaned = cleaned.replace(/(?<!\\)\\t(?=(?:ext[a-zA-Z]*|imes|heta|riangle|o|op|au|herefore|ilde|iny|oday|hick[a-zA-Z]*)(?![a-zA-Z]))/g, '\\\\t');
      cleaned = cleaned.replace(/(?<!\\)\\n(?=(?:ewcommand|eq|ot|ormal|abla|atural|u|i|dash|earrow|eg|mid|otin|warrow)(?![a-zA-Z]))/g, '\\\\n');
      
      try {
        return JSON.parse(cleaned);
      } catch (e3) {
        console.error("All JSON parsing attempts failed", e3);
        throw e3;
      }
    }
  }
}

export function removeUndefined(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(removeUndefined);
  }
  if (typeof obj === 'object') {
    // Check if it's a plain object. If not (e.g., Date, Firebase FieldValue), return as is.
    const isPlainObject = Object.prototype.toString.call(obj) === '[object Object]' &&
                          (Object.getPrototypeOf(obj) === null || Object.getPrototypeOf(obj) === Object.prototype);
    
    if (!isPlainObject) {
      return obj;
    }

    const newObj: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        if (obj[key] !== undefined) {
          newObj[key] = removeUndefined(obj[key]);
        }
      }
    }
    return newObj;
  }
  return obj;
}
