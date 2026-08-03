import { View, ScrollView } from "react-native";
import SkeletonBase from "../SkeletonBase";

export default function OrdersScreenSkeleton() {
  return (
    <View className="pb-8">
      {/* Header */}
      <View className="flex-row justify-between items-start mb-4">
        <View className="gap-1">
          <SkeletonBase width={80} height={12} borderRadius={6} />
          <SkeletonBase width={160} height={22} borderRadius={6} />
          <SkeletonBase width={200} height={14} borderRadius={6} />
        </View>
        <SkeletonBase width={47} height={47} borderRadius={24} />
      </View>

      {/* Search bar */}
      <SkeletonBase height={54} borderRadius={7} className="mb-4" />

      {/* Section title */}
      <SkeletonBase width={100} height={16} borderRadius={4} className="mb-2" />

      {/* Active orders horizontal scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="flex-row mb-6"
        contentContainerStyle={{ gap: 12 }}
      >
        {[1, 2].map((i) => (
          <View key={i} className="w-[200] gap-2 p-4 bg-gray-100 rounded-2xl">
            <SkeletonBase width="60%" height={12} borderRadius={4} />
            <SkeletonBase width="80%" height={16} borderRadius={6} />
            <SkeletonBase width={100} height={30} borderRadius={8} />
          </View>
        ))}
      </ScrollView>

      {/* Repeat last order */}
      <SkeletonBase height={60} borderRadius={12} className="mb-4" />

      {/* Category chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="flex-row mb-5"
        contentContainerStyle={{ gap: 8 }}
      >
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <SkeletonBase
            key={i}
            width={80}
            height={34}
            borderRadius={20}
          />
        ))}
      </ScrollView>

      {/* Menu items list */}
      <View className="gap-5">
        {[1, 2, 3].map((i) => (
          <View key={i} className="flex-row gap-3">
            <SkeletonBase width={100} height={100} borderRadius={12} />
            <View className="flex-1 gap-2 justify-center">
              <SkeletonBase width="70%" height={18} borderRadius={6} />
              <SkeletonBase width="90%" height={12} borderRadius={4} />
              <View className="flex-row justify-between items-center">
                <SkeletonBase width={60} height={16} borderRadius={6} />
                <SkeletonBase width={40} height={12} borderRadius={4} />
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
