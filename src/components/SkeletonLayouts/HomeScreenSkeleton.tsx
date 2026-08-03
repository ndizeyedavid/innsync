import { View } from "react-native";
import SkeletonBase from "../SkeletonBase";

export default function HomeScreenSkeleton() {
  return (
    <View className="pb-8">
      {/* Header row: greeting + notification icon */}
      <View className="flex-row justify-between items-start mb-4">
        <View className="gap-1">
          <SkeletonBase width={120} height={14} borderRadius={6} />
          <SkeletonBase width={180} height={22} borderRadius={6} />
          <SkeletonBase width={100} height={12} borderRadius={6} />
        </View>
        <SkeletonBase width={47} height={47} borderRadius={24} />
      </View>

      {/* Notification banner */}
      <SkeletonBase height={60} borderRadius={12} className="mb-5" />

      {/* Digital Key card */}
      <View className="bg-gray-100 rounded-2xl p-5 mb-5 gap-3">
        <View className="flex-row justify-between">
          <View className="gap-1">
            <SkeletonBase width={80} height={12} borderRadius={4} />
            <SkeletonBase width={140} height={20} borderRadius={6} />
          </View>
          <SkeletonBase width={48} height={48} borderRadius={24} />
        </View>
        <SkeletonBase width="60%" height={12} borderRadius={4} />
      </View>

      {/* Quick actions section title */}
      <SkeletonBase width={140} height={20} borderRadius={6} className="mb-3" />

      {/* Quick actions 2x2 grid */}
      <View className="flex-row flex-wrap gap-3">
        {[1, 2, 3, 4].map((i) => (
          <View
            key={i}
            className="w-[48%] bg-gray-100 rounded-2xl p-4 gap-2"
          >
            <SkeletonBase width={40} height={40} borderRadius={12} />
            <SkeletonBase width="70%" height={16} borderRadius={6} />
            <SkeletonBase width="50%" height={12} borderRadius={4} />
          </View>
        ))}
      </View>
    </View>
  );
}
