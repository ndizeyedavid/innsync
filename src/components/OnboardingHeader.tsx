import { Text, View } from "react-native";

interface IOnboarding {
  step: number;
  title: string;
  description: string;
}

export default function OnboardingHeader({
  step,
  title,
  description,
}: IOnboarding) {
  return (
    <View>
      <Text className="text-[12px] text-[#9C988E]">STEP {step} OF 4</Text>
      <Text className="text-[40px] ">{title}.</Text>
      <Text className="text-[#9C988E] text-[14px]">{description}</Text>
    </View>
  );
}
