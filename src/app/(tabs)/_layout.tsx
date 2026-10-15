import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import { StyleSheet, useColorScheme } from 'react-native';
import { fontFor } from '@/ui/AppText';
import { TabIcon } from '@/ui/TabIcon';
import { useTheme } from '@/theme/colors';

export default function TabsLayout() {
  const c = useTheme();
  const scheme = useColorScheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.accent,
        tabBarInactiveTintColor: c.secondary,
        tabBarLabelStyle: { ...fontFor('semibold'), fontSize: 10 },
        tabBarStyle: {
          position: 'absolute',
          borderTopColor: c.separator,
          borderTopWidth: StyleSheet.hairlineWidth,
          elevation: 0,
        },
        tabBarBackground: () => (
          <BlurView
            tint={scheme === 'dark' ? 'dark' : 'light'}
            intensity={80}
            blurMethod="dimezisBlurView"
            style={StyleSheet.absoluteFill}
          />
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Inicio', tabBarIcon: ({ color }) => <TabIcon ios="house.fill" android="home" color={color} /> }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color }) => <TabIcon ios="bubble.left.and.bubble.right.fill" android="chatbubbles" color={color} />,
        }}
      />
      <Tabs.Screen
        name="movimientos"
        options={{ title: 'Movimientos', tabBarIcon: ({ color }) => <TabIcon ios="list.bullet" android="list" color={color} /> }}
      />
      <Tabs.Screen
        name="reportes"
        options={{ title: 'Reportes', tabBarIcon: ({ color }) => <TabIcon ios="chart.pie.fill" android="pie-chart" color={color} /> }}
      />
      <Tabs.Screen
        name="ajustes"
        options={{ title: 'Ajustes', tabBarIcon: ({ color }) => <TabIcon ios="gearshape.fill" android="settings" color={color} /> }}
      />
    </Tabs>
  );
}
