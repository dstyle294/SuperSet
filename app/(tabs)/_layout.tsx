import { View, Text } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import COLORS from '../../constants/colors'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function TabLayout() {
  const insets = useSafeAreaInsets()

  return (
    <Tabs 
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        headerTitleStyle: {
          color: COLORS.textPrimary,
          fontWeight: "600",
        },
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: COLORS.cardBackground,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          paddingTop: 5,
          paddingBottom: insets.bottom,
          height: 60 + insets.bottom,
        }
      }}
    >
      <Tabs.Screen 
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({color, size, focused}) => (<Ionicons name="home-outline" size={size} color={color} />)
        }} 
      />
      <Tabs.Screen 
        name="workout" 
        options={{
          title: "Workout",
          tabBarIcon: ({color, size, focused}) => (<Ionicons name="barbell-outline" size={size} color={color} />)
        }} 
      />
      <Tabs.Screen 
        name="post"
        options={{
          title: "Post",
          tabBarIcon: ({color, size, focused}) => (<Ionicons name="add-circle" size={size} color={color} />)
        }} />
      <Tabs.Screen 
        name="exercises" 
        options={{
          title: "Exercises",
          tabBarIcon: ({color, size, focused}) => (<Ionicons name="bicycle-outline" size={size} color={color} />)
        }} 
      />
      <Tabs.Screen 
        name="profile" 
        options={{
          title: "Profile",
          tabBarIcon: ({color, size, focused}) => (<Ionicons name="person-outline" size={size} color={color} />)
        }} 
        />
    </Tabs>
  )
}