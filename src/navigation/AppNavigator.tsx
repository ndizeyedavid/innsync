import { Stack } from "expo-router";

export default function AppNavigator() {
  return (
    <Stack>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
    </Stack>
  );
}
