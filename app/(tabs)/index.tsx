import { View, Text, TouchableOpacity } from 'react-native'
import React, { use } from 'react'
import { useAuthStore } from '../../store/authStore'
import styles from '@/assets/styles/post.styles'

export default function Home() {
  const {logout} = useAuthStore()
  return (
    <View>
      <Text>Home</Text>
      <TouchableOpacity
        onPress={() => logout()}
        style={styles.button}
      >
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  )
}