import { Tabs } from 'expo-router';
import React from 'react';
import { Text } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs 
      screenOptions={{ 
        headerShown: false, // Oculta el encabezado feo de arriba
        tabBarStyle: { backgroundColor: '#ffffff', borderTopColor: '#eeeeee' },
        tabBarActiveTintColor: '#4CAF50',
      }}>
      
      {/* Pestaña Principal (Tu Dashboard) */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Mi Diario',
          tabBarIcon: () => <Text style={{fontSize: 20}}>📓</Text>,
        }}
      />
      
    </Tabs>
  );
}