import { Text, View } from "react-native";

interface ITabHeader {
  alt: string;
  title: string;
  description?: string;
  descriptionStyle?: string;
}

export default function TabHeader({
  alt,
  title,
  description,
  descriptionStyle,
}: ITabHeader) {
  return (
    <View>
      <Text className="uppercase text-[12px] text-[#9C988E]">{alt}</Text>
      <Text className="text-[32px] font-semibold">{title}</Text>
      <Text
        className={`${descriptionStyle != null ? descriptionStyle : "text-[32px] font-semibold"}`}
      >
        {description}
      </Text>
    </View>
  );
}
