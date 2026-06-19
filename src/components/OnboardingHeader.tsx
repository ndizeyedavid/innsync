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
      <Text className="text-[12px] text-gray-500">STEP {step} OF 4</Text>
      <Text className="text-[40px] text-navy">{title}.</Text>
      <Text className="text-gray-500 text-[14px]">{description}</Text>
    </View>
  );
}
