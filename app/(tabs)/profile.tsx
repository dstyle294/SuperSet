import { View, Text, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import styles from '@/assets/styles/profile.styles'
import { profile } from '@/assets/types/profile.types'
import { API_URL } from '@/constants/api'
import Loader from '@/components/loader'
import { DetailRow } from '@/components/DetailRow'
import { formatMemberSince } from '@/lib/utils'
import { router } from 'expo-router'

export default function Profile() {
  const { logout, token } = useAuthStore()
  const [ workoutCount, setWorkoutCount ] = useState(0)
  const [ profile, setProfile ] = useState<profile>()
  const [ loading, setLoading ] = useState(false) 

  useEffect(() => {
    getAllDetails()
  }, [token])

  const getAllDetails = async () => {
    try {
      setLoading(true)

      let response = await fetch(`${API_URL}/users/`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      let data = await response.json()

      if (!response.ok) throw new Error(data.message || "Something went wrong")

      setProfile(data.user)

      response = await fetch(`${API_URL}/users/workouts`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      data = await response.json()

      if (!response.ok) throw new Error(data.message || "Something went wrong")

      setWorkoutCount(data.totalWorkouts)
    } catch (error) {
      console.log(`Error getting user details`)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return ( <Loader size="large" /> )

  return (
    <View style={styles.container}>
      <DetailRow
        label="# of workouts"
        value={workoutCount}
      />
      <DetailRow
        label="Member since"
        value={formatMemberSince(profile?.createdAt)}
      />
      <TouchableOpacity 
        onPress={() => {
          logout()
          router.replace('/(auth)')
        }} 
        style={styles.logoutButton}>
        <Text>Logout</Text>
      </TouchableOpacity>
    </View>
  )
}