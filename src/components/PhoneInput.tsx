import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  Keyboard,
} from "react-native";
import { COUNTRIES, Country } from "../constants/countries";
// @ts-ignore
import Ionicons from "@expo/vector-icons/Ionicons";

interface IPhoneInput {
  value: string;
  onChangeText: (text: string) => void;
}

export default function PhoneInput({ value, onChangeText }: IPhoneInput) {
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    COUNTRIES[142],
  );
  const [showCountryModal, setShowCountryModal] = useState(false);

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setShowCountryModal(false);
    Keyboard.dismiss();
  };

  const renderCountryItem = ({ item }: { item: Country }) => (
    <TouchableOpacity
      className="flex-row items-center py-3 px-4"
      onPress={() => handleCountrySelect(item)}
    >
      <Text className="text-2xl mr-3">{item.flag}</Text>
      <View className="flex-1">
        <Text className="text-base text-gray-800">{item.name}</Text>
        <Text className="text-sm text-gray-500">{item.dialCode}</Text>
      </View>
      {selectedCountry.code === item.code && (
        <Ionicons
          name="checkmark"
          size={20}
          color="#0a0a08"
          // className="relative left-96"
        />
      )}
    </TouchableOpacity>
  );

  return (
    <View className="gap-2">
      <Text className="text-[15px] text-[#9C988E]">PHONE NUMBER</Text>
      <View className="relative flex-row items-center w-full">
        <TouchableOpacity
          className="absolute left-[13px] z-10 flex-row items-center"
          onPress={() => setShowCountryModal(true)}
        >
          <Text className="text-lg mr-1">{selectedCountry.flag}</Text>
          <Ionicons
            name="chevron-down"
            size={16}
            color="#9C988E"
            // className="relative left-6"
          />
          <Text
            className="absolute left-[45px] z-10 text-gray-600 text-base"
            onPress={() => setShowCountryModal(true)}
          >
            {selectedCountry.dialCode}
          </Text>
        </TouchableOpacity>

        <TextInput
          className="rounded-[7px] border border-[#E8E5DD] bg-white py-[18px] px-[100px] w-full"
          placeholder="Enter phone number"
          placeholderTextColor="#9C988E"
          value={value}
          onChangeText={onChangeText}
          keyboardType="phone-pad"
          maxLength={15}
        />
      </View>

      <Modal
        visible={showCountryModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCountryModal(false)}
      >
        <View className="flex-1 bg-white">
          <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
            <TouchableOpacity onPress={() => setShowCountryModal(false)}>
              <Text className="text-blue-600 text-base">Cancel</Text>
            </TouchableOpacity>
            <Text className="text-lg font-semibold">Select Country</Text>
            <View className="w-12" />
          </View>

          <FlatList
            data={COUNTRIES}
            renderItem={renderCountryItem}
            keyExtractor={(item) => item.code}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </Modal>
    </View>
  );
}
