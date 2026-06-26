import { CalendarDays, Home } from 'lucide-react-native';
import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#121A2B',
          borderTopColor: '#243149',
        },
        tabBarActiveTintColor: '#2DD4BF',
        tabBarInactiveTintColor: '#8B97AC',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'I dag',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="week"
        options={{
          title: '7 dager',
          tabBarIcon: ({ color, size }) => (
            <CalendarDays color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
