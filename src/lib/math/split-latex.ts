export type TextPart = { type: "text"; content: string };
export type MathPart = { type: "math"; content: string; display: boolean };
export type LatexPart = TextPart | MathPart;

/** Split a string into plain text and $...$ / $$...$$ LaTeX segments. */
export function splitLatex(text: string): LatexPart[] {
  if (!text) return [{ type: "text", content: "" }];

  const parts: LatexPart[] = [];
  const regex = /\$\$([^$]+)\$\$|\$([^$]+)\$/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", content: text.slice(lastIndex, match.index) });
    }
    const latex = match[1] ?? match[2];
    parts.push({
      type: "math",
      content: latex,
      display: match[1] != null,
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push({ type: "text", content: text.slice(lastIndex) });
  }

  return parts.length > 0 ? parts : [{ type: "text", content: text }];
}
