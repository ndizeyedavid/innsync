import { Text, View } from "react-native";
import VibeButton from "../VibeButton";
import { vibeCards } from "../../constants/vibeCards";
import * as Haptics from "expo-haptics";

interface VibeDetailsProps {
  selectedVibeIndices: number[];
  setSelectedVibeIndices: (indices: number[]) => void;
}

export default function VibeDetails({
  selectedVibeIndices,
  setSelectedVibeIndices,
}: VibeDetailsProps) {
  const handleVibeSelection = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
    if (selectedVibeIndices.includes(index)) {
      setSelectedVibeIndices(
        selectedVibeIndices.filter((i) => i !== index),
      );
    } else {
      setSelectedVibeIndices([...selectedVibeIndices, index]);
    }
  };

  return (
    <View className="mb-24">
      <View className="mt-6">
        <View>
          <Text className="text-[15px] text-gray-500">
            Select at least one
          </Text>
        </View>

        {/* container */}
        <View className="flex-row flex-wrap gap-5 pt-5">
          {vibeCards.map((data, index) => (
            <VibeButton
              key={index}
              icon={data.icon}
              title={data.title}
              description={data.description}
              checked={selectedVibeIndices.includes(index)}
              onPress={() => handleVibeSelection(index)}
            />
          ))}
        </View>
      </View>
    </View>
  );
}
