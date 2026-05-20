import { Text, View } from "react-native";
import VibeButton from "../VibeButton";
import { useState } from "react";
import { vibeCards } from "../../constants/vibeCards";
import * as Haptics from "expo-haptics";

export default function VibeDetails() {
  const [selectedVibes, setSelectedVibes] = useState<number[]>([]);

  const handleVibeSelection = (id: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
    if (selectedVibes.includes(id)) {
      setSelectedVibes((prevSelectedVibes) =>
        prevSelectedVibes.filter((vibe) => vibe !== id),
      );
    } else {
      setSelectedVibes((prevSelectedVibes) => [...prevSelectedVibes, id]);
    }
  };

  return (
    <View className="mb-24">
      <View className="mt-6">
        <View>
          <Text className="text-[15px] text-[#9C988E]">
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
              checked={selectedVibes.includes(index)}
              onPress={() => handleVibeSelection(index)}
            />
          ))}
        </View>
      </View>
    </View>
  );
}
