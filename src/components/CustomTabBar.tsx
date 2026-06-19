import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
} from "react-native";
import { useRouter, usePathname } from "expo-router";
// @ts-ignore
import Ionicons from "@expo/vector-icons/Ionicons";
// @ts-ignore
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import * as Haptics from "expo-haptics";
import Svg, { Path, Defs, Mask } from "react-native-svg";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const TAB_BAR_HEIGHT = 83;
const CENTER_BUTTON_SIZE = 70;
const NOTCH_RADIUS = CENTER_BUTTON_SIZE / 2 + 7;

export default function CustomTabBar() {
  const router = useRouter();
  const pathname = usePathname();

  const focusedColor = "#4ab3de";
  const inactiveColor = "#9CA3AF";

  const tabs = [
    { name: "Home", route: "/", icon: "home", type: "material" },
    { name: "Amenities", route: "/amenities", icon: "bed", type: "ion" },
    {
      name: "Itinerary",
      route: "/itinerary",
      icon: "calendar-clear",
      type: "ion",
    },
    { name: "Orders", route: "/orders", icon: "receipt", type: "ion" },
  ];

  const isActive = (route: string) => {
    if (route === "/") return pathname === "/";
    return pathname.startsWith(route);
  };

  const handlePress = (route: string, isCenter = false) => {
    Haptics.impactAsync(
      isCenter
        ? Haptics.ImpactFeedbackStyle.Medium
        : Haptics.ImpactFeedbackStyle.Light,
    );
    if (isCenter) {
      router.push("/map");
    } else {
      router.push(route);
    }
  };

  const getNotchPath = () => {
    const width = SCREEN_WIDTH * 0.94;
    const height = TAB_BAR_HEIGHT;
    const centerX = width / 2;
    const topY = 0;

    return `M 0 20
      Q 0 0 20 0
      L ${centerX - NOTCH_RADIUS} 0
      Q ${centerX - NOTCH_RADIUS} ${NOTCH_RADIUS} ${centerX} ${NOTCH_RADIUS}
      Q ${centerX + NOTCH_RADIUS} ${NOTCH_RADIUS} ${centerX + NOTCH_RADIUS} 0
      L ${width - 20} 0
      Q ${width} 0 ${width} 20
      L ${width} ${height}
      L 0 ${height}
      Z`;
  };

  return (
    <View style={styles.container}>
      {/* Tab bar with notch */}
      <View style={styles.tabBarContainer}>
        <Svg
          height={TAB_BAR_HEIGHT}
          width={SCREEN_WIDTH * 0.94}
          style={styles.svgBackground}
        >
          <Defs>
            <Mask id="notch-mask">
              <Path d={getNotchPath()} fill="white" />
            </Mask>
          </Defs>
          <Path
            d={getNotchPath()}
            fill="white"
            stroke="#E8ECEF"
            strokeWidth={2}
          />
        </Svg>

        <View style={styles.tabsWrapper}>
          {/* Left tabs */}
          <View style={styles.tabsContainer}>
            {tabs.slice(0, 2).map((tab, index) => {
              const active = isActive(tab.route);
              return (
                <TouchableOpacity
                  key={tab.name}
                  style={styles.tabButton}
                  onPress={() => handlePress(tab.route)}
                >
                  {tab.type === "material" ? (
                    <MaterialCommunityIcons
                      name={active ? tab.icon : `${tab.icon}-outline`}
                      size={28}
                      color={active ? focusedColor : inactiveColor}
                    />
                  ) : (
                    <Ionicons
                      name={active ? tab.icon : `${tab.icon}-outline`}
                      size={28}
                      color={active ? focusedColor : inactiveColor}
                    />
                  )}
                  <Text
                    style={[
                      styles.tabLabel,
                      { color: active ? focusedColor : inactiveColor },
                    ]}
                  >
                    {tab.name}
                  </Text>
                  {active && <View style={styles.activeDot} />}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Center notch gap */}
          <View style={styles.centerGap} />

          {/* Right tabs */}
          <View style={styles.tabsContainer}>
            {tabs.slice(2).map((tab, index) => {
              const active = isActive(tab.route);
              return (
                <TouchableOpacity
                  key={tab.name}
                  style={styles.tabButton}
                  onPress={() => handlePress(tab.route)}
                >
                  <Ionicons
                    name={active ? tab.icon : `${tab.icon}-outline`}
                    size={28}
                    color={active ? focusedColor : inactiveColor}
                  />
                  <Text
                    style={[
                      styles.tabLabel,
                      { color: active ? focusedColor : inactiveColor },
                    ]}
                  >
                    {tab.name}
                  </Text>
                  {active && <View style={styles.activeDot} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>

      {/* Center teardrop button */}
      <TouchableOpacity
        style={styles.centerButton}
        onPress={() => handlePress("/map", true)}
      >
        <View
          style={[
            styles.centerButtonInner,
            { backgroundColor: pathname === "/map" ? focusedColor : "#283D5A" },
          ]}
        >
          <Ionicons name="map" size={32} color="white" />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 100,
  },
  tabBarContainer: {
    width: "94%",
    height: TAB_BAR_HEIGHT,
  },
  svgBackground: {
    position: "absolute",
  },
  tabsWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    paddingTop: 15,
  },
  tabsContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 10,
  },
  tabButton: {
    alignItems: "center",
    flex: 1,
    position: "relative",
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  activeDot: {
    width: 8,
    height: 8,
    backgroundColor: "#4ab3de",
    borderRadius: 4,
    position: "absolute",
    bottom: -12,
  },
  centerGap: {
    width: CENTER_BUTTON_SIZE + 10,
  },
  centerButton: {
    position: "absolute",
    top: -30,
    alignSelf: "center",
    zIndex: 101,
  },
  centerButtonInner: {
    width: CENTER_BUTTON_SIZE,
    height: CENTER_BUTTON_SIZE,
    borderRadius: CENTER_BUTTON_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 12,
    transform: [{ translateY: -5 }],
  },
});
