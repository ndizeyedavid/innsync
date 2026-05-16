import { Text, View } from "react-native";

interface ITabHeader {
  alt: string;
  title: string;
  description: string;
}

export default function TabHeader({ alt, title, description }: ITabHeader) {
  return (
    <View>
      <Text className="uppercase text-[12px] text-[#9C988E]">{alt}</Text>
      <Text className="text-[32px]">{title}</Text>
      <Text className="text-[32px]">{description}</Text>
    </View>
  );
}
