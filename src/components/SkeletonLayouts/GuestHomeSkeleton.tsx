import { View } from "react-native";
import SkeletonBase from "../SkeletonBase";

export default function GuestHomeSkeleton() {
  return (
    <View className="pb-8">
      {/* Search bar */}
      <SkeletonBase height={48} borderRadius={24} className="mb-4" />

      {/* User greeting line */}
      <SkeletonBase width={160} height={14} borderRadius={6} className="mb-1" />
      <SkeletonBase width={100} height={12} borderRadius={6} className="mb-6" />

      {/* Amenities chips row */}
      <View className="flex-row gap-3 mb-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <View key={i} className="items-center gap-1">
            <SkeletonBase width={44} height={44} borderRadius={22} />
            <SkeletonBase width={40} height={10} borderRadius={4} />
          </View>
        ))}
      </View>

      {/* Hotel cards */}
      {[1, 2, 3].map((i) => (
        <View key={i} className="rounded-2xl overflow-hidden mb-5">
          <SkeletonBase height={160} borderRadius={0} />
          <View className="p-4 bg-white gap-2">
            <SkeletonBase width="70%" height={18} borderRadius={6} />
            <SkeletonBase width="50%" height={14} borderRadius={6} />
            <View className="flex-row gap-2 mt-1">
              <SkeletonBase width={60} height={24} borderRadius={12} />
              <SkeletonBase width={80} height={24} borderRadius={12} />
              <SkeletonBase width={50} height={24} borderRadius={12} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}
