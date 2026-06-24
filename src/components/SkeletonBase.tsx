import { useEffect, useRef } from "react";
import { View, Animated } from "react-native";

interface SkeletonBaseProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  className?: string;
  style?: any;
}

export default function SkeletonBase({
  width,
  height = 20,
  borderRadius = 8,
  className,
  style,
}: SkeletonBaseProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <Animated.View
      className={`bg-gray-200 ${className || ""}`}
      style={[
        { width: width || "100%", height, borderRadius },
        { opacity },
        style,
      ]}
    />
  );
}
