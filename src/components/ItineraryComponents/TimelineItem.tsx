import React from "react";
import { View, StyleSheet, Text } from "react-native";

interface TimelineItemProps {
  startTime?: string;
  children: React.ReactNode;
  isFirst?: boolean;
  isLast?: boolean;
  isActive?: boolean;
}

export default function TimelineItem({
  children,
  startTime = "No Time",
  isFirst = false,
  isLast = false,
  isActive = false,
}: TimelineItemProps) {
  return (
    <View style={styles.rowContainer}>
      <Text className="absolute -right-7 top-1.5 w-full flex-1 text-gray-700">
        {startTime}
      </Text>

      <View style={styles.timelineColumn}>
        {!isLast && (
          <View style={[styles.verticalLine, isActive && styles.activeLine]} />
        )}

        <View
          style={[
            styles.bulletDot,
            isActive ? styles.activeDot : styles.inactiveDot,
            isFirst && styles.firstDotAdjust,
          ]}
        >
          <View className="size-[9px] bg-navy rounded-full" />
        </View>
      </View>

      <View style={styles.cardContentColumn}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  rowContainer: {
    flexDirection: "row",
    width: "100%",
    position: "relative",
    marginBottom: 20,
  },
  timelineColumn: {
    width: 30,
    alignItems: "center",
    position: "relative",
  },
  verticalLine: {
    position: "absolute",
    top: 12,
    bottom: -28,
    width: 2,
    backgroundColor: "#E8E5DD",
  },
  activeLine: {
    backgroundColor: "#3A8AC3",
  },
  bulletDot: {
    width: 17,
    height: 17,
    padding: 1,
    borderRadius: 50,
    borderWidth: 2,
    marginTop: 8,
    backgroundColor: "white",
    zIndex: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  inactiveDot: {
    borderColor: "#9C988E",
  },
  activeDot: {
    borderColor: "#3A8AC3",
    backgroundColor: "#3A8AC3",
  },
  firstDotAdjust: {
    marginTop: 12,
  },
  cardContentColumn: {
    flex: 1,
    paddingLeft: 4,
    paddingTop: 30,
  },
});
