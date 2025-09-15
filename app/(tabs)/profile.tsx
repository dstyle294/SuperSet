import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { useAuthStore } from '@/store/authStore'
import styles from '@/assets/styles/profile.styles'

export default function Profile() {
  const { logout } = useAuthStore()
  return (
    <View>
      <Text>Profile tab</Text>
      <TouchableOpacity onPress={logout} style={styles.logoutButton}>
        <Text>logout</Text>
      </TouchableOpacity>
    </View>
  )
}