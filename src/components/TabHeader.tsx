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
      <Text className="uppercase text-[12px] text-gray-500">{alt}</Text>
      <Text className="text-[32px] font-semibold text-navy">{title}</Text>
      <Text
        className={`${descriptionStyle != null ? descriptionStyle : "text-[32px] font-semibold text-navy"}`}
      >
        {description}
      </Text>
    </View>
  );
}
