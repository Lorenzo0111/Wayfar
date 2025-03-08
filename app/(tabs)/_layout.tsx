import { useTheme } from "@/theme/ThemeProvider";
import { Tabs } from "expo-router";
import { Globe as Globe2, List, Map } from "lucide-react-native";

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.secondary,
        tabBarStyle: {
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          backgroundColor: colors.card,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarStyle: {
            paddingTop: 10,
            backgroundColor: colors.card,
          },
          title: "World Map",
          tabBarIcon: ({ size, color }) => <Globe2 size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="regions"
        options={{
          tabBarStyle: {
            paddingTop: 10,
            backgroundColor: colors.card,
          },
          title: "Regions",
          tabBarIcon: ({ size, color }) => <Map size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="trips"
        options={{
          tabBarStyle: {
            paddingTop: 10,
            backgroundColor: colors.card,
          },
          title: "Trips",
          tabBarIcon: ({ size, color }) => <List size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
