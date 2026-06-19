import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TAB_BAR_HEIGHT = 87;
const CENTER_BUTTON_SIZE = 70;

export default function CustomTabBar() {
  const router = useRouter();
  const pathname = usePathname();

  const focusedColor = '#4ab3de';
  const inactiveColor = '#9CA3AF';
  const activeTextColor = '#283D5A';

  const tabs = [
    { name: 'Home', route: '/', icon: 'home', type: 'material' },
    { name: 'Amenities', route: '/amenities', icon: 'bed', type: 'ion' },
    { name: 'Map', route: '/map', icon: 'map', type: 'ion', isCenter: true },
    { name: 'Itinerary', route: '/itinerary', icon: 'calendar-clear', type: 'ion' },
    { name: 'Orders', route: '/orders', icon: 'receipt', type: 'ion' },
  ];

  const isActive = (route: string) => {
    if (route === '/') return pathname === '/';
    return pathname.startsWith(route);
  };

  const handlePress = (route: string, isCenter = false) => {
    Haptics.impactAsync(isCenter ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light);
    router.push(route);
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
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
                {tab.type === 'material' ? (
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
                <Text style={[styles.tabLabel, { color: active ? focusedColor : inactiveColor }]}>
                  {tab.name}
                </Text>
                {active && <View style={styles.activeDot} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Center button placeholder */}
        <View style={styles.centerPlaceholder} />

        {/* Right tabs */}
        <View style={styles.tabsContainer}>
          {tabs.slice(3).map((tab, index) => {
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
                <Text style={[styles.tabLabel, { color: active ? focusedColor : inactiveColor }]}>
                  {tab.name}
                </Text>
                {active && <View style={styles.activeDot} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Center teardrop button */}
      <TouchableOpacity
        style={styles.centerButton}
        onPress={() => handlePress('/map', true)}
      >
        <View style={[styles.centerButtonInner, { backgroundColor: isActive('/map') ? focusedColor : '#283D5A' }]}>
          <Ionicons name="map" size={32} color="white" />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  tabBar: {
    width: '94%',
    height: TAB_BAR_HEIGHT,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#E8ECEF',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 15,
  },
  tabsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
  },
  tabButton: {
    alignItems: 'center',
    flex: 1,
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  activeDot: {
    width: 8,
    height: 8,
    backgroundColor: '#4ab3de',
    borderRadius: 4,
    position: 'absolute',
    bottom: -12,
  },
  centerPlaceholder: {
    width: CENTER_BUTTON_SIZE,
  },
  centerButton: {
    position: 'absolute',
    top: -25,
    alignSelf: 'center',
  },
  centerButtonInner: {
    width: CENTER_BUTTON_SIZE,
    height: CENTER_BUTTON_SIZE,
    borderRadius: CENTER_BUTTON_SIZE / 2,
    borderBottomWidth: 15,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
