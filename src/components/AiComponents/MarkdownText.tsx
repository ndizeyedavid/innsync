import { Text, View } from "react-native";

interface MarkdownTextProps {
  text: string;
  textClassName?: string;
}

interface Token {
  type: "text" | "bold" | "italic" | "boldItalic";
  content: string;
}

function parseInline(content: string): Token[] {
  const tokens: Token[] = [];
  const regex = /(\*\*\*[\s\S]*?\*\*\*|\*\*[\s\S]*?\*\*|\*[\s\S]*?\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({
        type: "text",
        content: content.slice(lastIndex, match.index),
      });
    }
    const inner = match[0].slice(match[0].startsWith("***") ? 3 : match[0].startsWith("**") ? 2 : 1);
    const innerEnd = match[0].endsWith("***") ? -3 : match[0].endsWith("**") ? -2 : -1;
    const text = inner.slice(0, innerEnd);

    if (match[0].startsWith("***")) {
      tokens.push({ type: "boldItalic", content: text });
    } else if (match[0].startsWith("**")) {
      tokens.push({ type: "bold", content: text });
    } else {
      tokens.push({ type: "italic", content: text });
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    tokens.push({ type: "text", content: content.slice(lastIndex) });
  }

  return tokens;
}

function renderInlineTokens(
  tokens: Token[],
  baseClass: string,
  isDark?: boolean,
) {
  return tokens.map((t, i) => {
    const cls = `${baseClass} ${
      t.type === "bold"
        ? "font-bold"
        : t.type === "italic"
          ? "italic"
          : t.type === "boldItalic"
            ? "font-bold italic"
            : ""
    }`;
    return (
      <Text key={i} className={cls}>
        {t.content}
      </Text>
    );
  });
}

export default function MarkdownText({
  text,
  textClassName = "text-[15px] leading-5 text-gray-800",
}: MarkdownTextProps) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  const isDark = textClassName?.includes("text-white");

  let listCounter: number | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Empty line
    if (!trimmed) {
      elements.push(<View key={`spacing-${i}`} className="h-2" />);
      listCounter = null;
      continue;
    }

    // Headers
    if (trimmed.startsWith("### ")) {
      elements.push(
        <Text
          key={`h3-${i}`}
          className={`font-bold text-[16px] ${isDark ? "text-white" : "text-navy"} mt-1`}
        >
          {trimmed.slice(4)}
        </Text>,
      );
      listCounter = null;
      continue;
    }
    if (trimmed.startsWith("## ")) {
      elements.push(
        <Text
          key={`h2-${i}`}
          className={`font-bold text-[18px] ${isDark ? "text-white" : "text-navy"} mt-2`}
        >
          {trimmed.slice(3)}
        </Text>,
      );
      listCounter = null;
      continue;
    }
    if (trimmed.startsWith("# ")) {
      elements.push(
        <Text
          key={`h1-${i}`}
          className={`font-bold text-[20px] ${isDark ? "text-white" : "text-navy"} mt-2`}
        >
          {trimmed.slice(2)}
        </Text>,
      );
      listCounter = null;
      continue;
    }

    // Bullet points
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      const content = trimmed.slice(2);
      const tokens = parseInline(content);
      elements.push(
        <View key={`bullet-${i}`} className="flex-row gap-2 ml-1">
          <Text className={textClassName}>•</Text>
          <Text className={`flex-1 ${textClassName}`}>
            {renderInlineTokens(tokens, textClassName, isDark)}
          </Text>
        </View>,
      );
      listCounter = null;
      continue;
    }

    // Numbered list
    const numberedMatch = trimmed.match(/^(\d+)\.\s(.+)/);
    if (numberedMatch) {
      listCounter = parseInt(numberedMatch[1]);
      const content = numberedMatch[2];
      const tokens = parseInline(content);
      elements.push(
        <View key={`ol-${i}`} className="flex-row gap-2 ml-1">
          <Text className={textClassName}>{listCounter}.</Text>
          <Text className={`flex-1 ${textClassName}`}>
            {renderInlineTokens(tokens, textClassName, isDark)}
          </Text>
        </View>,
      );
      continue;
    }

    // Regular paragraph with inline formatting
    const tokens = parseInline(trimmed);
    elements.push(
      <Text key={`p-${i}`} className={textClassName}>
        {renderInlineTokens(tokens, textClassName, isDark)}
      </Text>,
    );
    listCounter = null;
  }

  return <View>{elements}</View>;
}
