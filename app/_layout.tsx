import { ThemeProvider, useTheme } from "@/theme/ThemeProvider";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

function RootLayoutContent() {
  const { isDark } = useTheme();

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style={isDark ? "light" : "dark"} />
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootLayoutContent />
    </ThemeProvider>
  );
}
