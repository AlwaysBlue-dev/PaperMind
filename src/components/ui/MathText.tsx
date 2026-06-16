"use client";

import katex from "katex";
import { splitLatex } from "@/lib/math/split-latex";

import "katex/dist/katex.min.css";

type MathTextProps = {
  text: string;
  className?: string;
  as?: "span" | "p" | "div";
};

function renderLatex(latex: string, display: boolean): string {
  try {
    return katex.renderToString(latex.trim(), {
      throwOnError: false,
      displayMode: display,
      strict: "ignore",
    });
  } catch {
    return display ? `$$${latex}$$` : `$${latex}$`;
  }
}

export function MathText({
  text,
  className = "",
  as: Tag = "span",
}: MathTextProps) {
  const parts = splitLatex(text);

  return (
    <Tag className={`math-text ${className}`.trim()}>
      {parts.map((part, index) => {
        if (part.type === "text") {
          return <span key={index}>{part.content}</span>;
        }

        if (part.display) {
          return (
            <span
              key={index}
              className="math-text-block my-2 block overflow-x-auto"
              dangerouslySetInnerHTML={{
                __html: renderLatex(part.content, true),
              }}
            />
          );
        }

        return (
          <span
            key={index}
            className="math-text-inline"
            dangerouslySetInnerHTML={{
              __html: renderLatex(part.content, false),
            }}
          />
        );
      })}
    </Tag>
  );
}
