import React, { useState } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
// @ts-ignore
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import TabHeader from "../../components/TabHeader";
import ScreenLayout from "../../layout/ScreenLayout";
import * as Haptics from "expo-haptics";

const licenses = [
  {
    name: "React Native",
    version: "0.74",
    license: "MIT",
    description: "A framework for building native apps using React",
  },
  {
    name: "Expo",
    version: "51",
    license: "MIT",
    description: "Open-source platform for making universal apps",
  },
  {
    name: "TypeScript",
    version: "5.4",
    license: "Apache-2.0",
    description: "A typed superset of JavaScript",
  },
  {
    name: "Zustand",
    version: "4.5",
    license: "MIT",
    description: "A small, fast, and scalable state-management solution",
  },
  {
    name: "@expo/vector-icons",
    version: "14.0",
    license: "MIT",
    description: "Expo Vector Icons library",
  },
  {
    name: "Taro",
    version: "3.6",
    license: "MIT",
    description: "Open-source cross-platform framework",
  },
  {
    name: "Expo Haptics",
    version: "~12.0",
    license: "MIT",
    description: "Haptic feedback module for Expo",
  },
];

export default function LicensesScreen() {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (name: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedId(expandedId === name ? null : name);
  };

  return (
    <ScreenLayout>
      <TouchableOpacity
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.back();
        }}
        className="mb-4"
      >
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>

      <TabHeader alt="LEGAL" title="Open Source Licenses" />

      <ScrollView className="mt-4 flex-1" showsVerticalScrollIndicator={false}>
        <View className="bg-white border border-[#EFEDE7] rounded-2xl p-4 mb-4">
          <Text className="text-sm text-[#6E6B63] leading-relaxed">
            This app uses the following open-source software packages. We thank the authors and contributors!
          </Text>
        </View>

        {licenses.map((license, index) => (
          <View
            key={license.name}
            className="bg-white border border-[#EFEDE7] rounded-2xl overflow-hidden mb-3"
          >
            <TouchableOpacity
              onPress={() => toggleExpand(license.name)}
              activeOpacity={0.8}
              className="p-4 flex-row items-center justify-between"
            >
              <View className="flex-1">
                <View className="flex-row items-center gap-2 mb-1">
                  <Text className="text-base font-semibold">
                    {license.name}
                  </Text>
                  <Text className="text-sm text-[#9C988E]">
                    v{license.version}
                  </Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Text className="text-xs font-medium text-[#3F6B4F] bg-[#E8F5E9] px-2 py-1 rounded">
                    {license.license}
                  </Text>
                  <Text className="text-xs text-[#9C988E]">
                    {license.description}
                  </Text>
                </View>
              </View>
              <Ionicons
                name={
                  expandedId === license.name
                    ? "chevron-up"
                    : "chevron-down"
                }
                size={20}
                color="#9C988E"
              />
            </TouchableOpacity>
            {expandedId === license.name && (
              <View className="px-4 pb-4 border-t border-[#EFEDE7]">
                <View className="pt-3">
                  <Text className="text-xs text-[#6E6B63] leading-relaxed">
                    Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
                  </Text>
                  <Text className="text-xs text-[#6E6B63] leading-relaxed mt-2">
                    The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
                  </Text>
                  <Text className="text-xs text-[#6E6B63] leading-relaxed mt-2">
                    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
                  </Text>
                </View>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </ScreenLayout>
  );
}
