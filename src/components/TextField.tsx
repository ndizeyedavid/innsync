// @ts-ignore
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  Text,
  TextInput,
  View,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";

interface ITextField {
  text: string;
  icon: string;
  placeholder: string;
  keyboardType?: any;
  autoCapitalize?: any;
  secureTextEntry?: boolean;
}

export default function TextField({
  text,
  icon,
  placeholder,
  keyboardType = "text",
  autoCapitalize = "none",
  secureTextEntry = false,
}: ITextField) {
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="gap-2">
        <Text className="text-[15px] text-[#9C988E]">{text}</Text>
        <View className="relative flex-row items-center w-full">
          <Ionicons
            name={icon}
            size={22}
            className="opacity-50 absolute z-10 left-[13px]"
          />
          <TextInput
            className="rounded-[7px] border border-[#E8E5DD] bg-white py-[18px] px-[44px] w-full"
            placeholder={placeholder}
            placeholderTextColor="#9C988E"
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            secureTextEntry={secureTextEntry}
          />
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}
