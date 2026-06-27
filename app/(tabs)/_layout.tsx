import { Tabs } from 'expo-router';
import { Calendar, Cloud, PlaneTakeoff } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0B1220',
          borderTopColor: '#243149',
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: '#2DD4BF',
        tabBarInactiveTintColor: '#8B97AC',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'I dag',
          tabBarIcon: ({ color, size }) => (
            <Cloud color={color} size={size} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="week"
        options={{
          title: '7 dager',
          tabBarIcon: ({ color, size }) => (
            <Calendar color={color} size={size} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="flights"
        options={{
          title: 'Avganger',
          tabBarIcon: ({ color, size }) => (
            <PlaneTakeoff color={color} size={size} strokeWidth={2} />
          ),
        }}
      />
    </Tabs>
  );
}
