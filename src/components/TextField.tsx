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
  width?: string;
  value?: any;
  onChangeText?: any;
}

export default function TextField({
  text,
  icon,
  placeholder,
  keyboardType = "text",
  autoCapitalize = "none",
  secureTextEntry = false,
  width = "full",
  value,
  onChangeText,
}: ITextField) {
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="gap-2 flex-1">
        <Text className="text-[15px] text-gray-500">{text}</Text>
        <View className="relative flex-row items-center w-full">
          <Ionicons
            name={icon}
            size={22}
            className="opacity-50 absolute z-10 left-[13px]"
          />
          <TextInput
            className={`rounded-md flex-1 border border-gray-200 bg-white py-[18px] px-[44px]`}
            placeholder={placeholder}
            placeholderTextColor="#9CA3AF"
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            secureTextEntry={secureTextEntry}
            value={value}
            onChangeText={onChangeText}
          />
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}
