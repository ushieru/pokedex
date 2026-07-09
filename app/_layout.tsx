import { Stack } from "expo-router";
import "../global.css";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Pokédex" }} />
      <Stack.Screen name="detail" options={{ title: "Pokédex Details" }} />
    </Stack>
  );
}
