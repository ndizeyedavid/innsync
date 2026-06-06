import { Tabs } from "expo-router";
// @ts-ignore
import Ionicons from "@expo/vector-icons/Ionicons";
// @ts-ignore
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import * as Haptic from "expo-haptics";

export default function TabsLayout() {
  const tabOptions = [
    {
      name: "amenities",
      title: "Amenities",
      icon: "bed",
    },
    {
      name: "itinerary",
      title: "Itinerary",
      icon: "calendar-clear",
    },
    {
      name: "orders",
      title: "Orders",
      icon: "receipt",
    },
    {
      name: "profile",
      title: "Profile",
      icon: "person",
    },
  ];

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,

          tabBarActiveTintColor: "#323232",

          tabBarStyle: styles.tabStyle,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, focused }) => (
              <View className="relative items-center justify-center">
                <MaterialCommunityIcons
                  name={focused ? "home" : "home-outline"}
                  size={28}
                  color={color}
                />

                {focused && (
                  <View className="size-[8px] bg-black rounded-full absolute bottom-[-27px]" />
                )}
              </View>
            ),
          }}
          listeners={({ navigation, route }) => ({
            tabPress: (e) => {
              Haptic.impactAsync(Haptic.ImpactFeedbackStyle.Light);
            },
          })}
        />
        {tabOptions.map((tab, index) => (
          <Tabs.Screen
            key={index}
            name={tab.name}
            options={{
              title: tab.title,

              tabBarIcon: ({ color, focused }) => (
                <View className="relative items-center justify-center">
                  <Ionicons
                    name={focused ? tab.icon : `${tab.icon}-outline`}
                    size={28}
                    color={color}
                  />

                  {focused && (
                    <View className="size-[8px] bg-black rounded-full absolute bottom-[-27px]" />
                  )}
                </View>
              ),
            }}
            listeners={({ navigation, route }) => ({
              tabPress: (e) => {
                Haptic.impactAsync(Haptic.ImpactFeedbackStyle.Heavy);
              },
            })}
          />
        ))}
      </Tabs>
      <StatusBar style="dark" />
    </>
  );
}

const styles = StyleSheet.create({
  tabStyle: {
    height: 87,
    width: "94%",
    margin: "auto",
    // paddingBottom: 8,
    paddingTop: 15,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#EFEDE7",
    borderRadius: 20,
    backgroundColor: "white",
  },
});
