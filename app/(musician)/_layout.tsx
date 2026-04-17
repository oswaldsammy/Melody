import { Tabs } from 'expo-router';
import { Text } from 'react-native';

export default function MusicianLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: '#7C3AED' }}>
      <Tabs.Screen name="dashboard" options={{ title: 'Dashboard', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📊</Text> }} />
      <Tabs.Screen name="bookings" options={{ title: 'Bookings', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📅</Text> }} />
      <Tabs.Screen name="messages" options={{ title: 'Messages', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>💬</Text> }} />
      <Tabs.Screen name="availability" options={{ title: 'Calendar', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🗓️</Text> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>👤</Text> }} />
    </Tabs>
  );
}
