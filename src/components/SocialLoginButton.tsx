import { Image, Text, TouchableOpacity } from "react-native";

interface ISocialLoginButton {
  buttonLogo: any;
  buttonText: string;
}

export default function SocialLoginButton({
  buttonLogo,
  buttonText,
}: ISocialLoginButton) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      className="flex-row items-center justify-center border px-[43px] py-[13px] rounded-[7px] border-[#E8E5DD] bg-white gap-2"
    >
      <Image source={buttonLogo} className="size-[24px]" />

      <Text>{buttonText}</Text>
    </TouchableOpacity>
  );
}
