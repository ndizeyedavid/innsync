import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import CustomTabBar from "../../components/CustomTabBar";

export default function TabsLayout() {
  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
        }}
        tabBar={(props) => <CustomTabBar />}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="amenities" />
        <Tabs.Screen name="map" />
        <Tabs.Screen name="itinerary" />
        <Tabs.Screen name="orders" />
      </Tabs>
      <StatusBar style="dark" />
    </>
  );
}
