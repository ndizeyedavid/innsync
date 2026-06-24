import { useState, useEffect, useRef } from "react";
import { TouchableOpacity } from "react-native";

interface TypewriterTextProps {
  text: string;
  speed?: number;
  children: (displayedText: string, isComplete: boolean) => React.ReactNode;
}

export default function TypewriterText({
  text,
  speed = 15,
  children,
}: TypewriterTextProps) {
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    if (!text) {
      setCharIndex(0);
      return;
    }

    // Don't schedule if we're already done
    if (charIndex >= text.length) return;

    const timer = setTimeout(() => {
      setCharIndex((prev) => Math.min(prev + 1, text.length));
    }, speed);

    return () => clearTimeout(timer);
  }, [text, charIndex, speed]);

  const skip = () => setCharIndex(text.length);

  const isComplete = charIndex >= text.length;

  return (
    <TouchableOpacity onPress={skip} activeOpacity={0.9}>
      {children(text.slice(0, charIndex), isComplete)}
    </TouchableOpacity>
  );
}
