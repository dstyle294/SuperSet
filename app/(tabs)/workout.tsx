import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl } from 'react-native'
import React, { useEffect, useState } from 'react'
import styles from '@/assets/styles/workoutPage.styles'
import { API_URL } from '@/constants/api'
import { useAuthStore } from '@/store/authStore'
import { workoutObj } from '../types/workout.types'
import { RenderWorkout } from '@/components/RenderWorkout'
import { Ionicons } from '@expo/vector-icons'
import Loader from '@/components/loader'
import homeStyles from '@/assets/styles/home.styles'
import COLORS from '@/constants/colors'

export default function Workout() {
  const { token } = useAuthStore()
  const [workouts, setWorkouts] = useState<workoutObj[]>([])
  const [ loading, setLoading ] = useState(true)
  const [ refreshing, setRefreshing ] = useState(false)
  const [ page, setPage ] = useState(1)
  const [ hasMore, setHasMore ] = useState(true) 

  const startWorkout = () => {
    
  }

  const renderWorkout = ({ item } : {item: workoutObj}) => (
    <View style={homeStyles.postCard}>
      <RenderWorkout workoutId={item._id} />
    </View>
  )

  const getWorkouts = async (pageNum = 1, refreshing = false) => {
    try {
      if ( refreshing ) setRefreshing(true)
      else if (pageNum == 1) setLoading(true)

      const response = await fetch(`${API_URL}/workouts/`, {
        headers: {
          method: 'GET',
          Authorization: `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.message || "Something went wrong")

      const uniqueWorkouts = 
      refreshing || pageNum === 1 
        ? data.workouts
        : Array.from(new Set([...workouts, ...data.workouts].map((workout) => workout._id))).map((id) => 
          [...workouts, ...data.workouts].find((workout) => workout._id === id)
        )

      setWorkouts(uniqueWorkouts)

      setHasMore(pageNum < data.totalPages)
      setPage(pageNum)

    } catch (error) {
      console.error(`Error fetching workouts ${error}`)
    } finally {
      if (refreshing) {
        setRefreshing(false)
      } else {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    getWorkouts()
  }, [])

  const handleLoadMore = async () => {
      if (hasMore && !loading && !refreshing) {
        await getWorkouts(page + 1)
      }
    }
  
  if (loading) return <Loader size="small" />


  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={startWorkout} style={styles.startButton}>
        <Text style={styles.startButtonText}>Start workout!</Text>
      </TouchableOpacity>
      <FlatList
        data={workouts} 
        renderItem={renderWorkout}
        keyExtractor={(item: workoutObj) => item._id}
        contentContainerStyle={homeStyles.listContainer}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListHeaderComponent={
          <View style={homeStyles.header}>
            <Text style={homeStyles.headerSubtitle}>Look how far you've come! 👇</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={homeStyles.emptyContainer}>
            <Ionicons name="barbell-outline" size={60} color={COLORS.textSecondary} />
            <Text style={homeStyles.emptyText}>No workouts yet 😞</Text>
            <Text style={homeStyles.emptySubtext}>Get to work 🔒</Text>
          </View>
        }
        ListFooterComponent={
          hasMore && workouts.length > 0 ? (
            <ActivityIndicator style={homeStyles.footerLoader} size="small" color={COLORS.primary} />
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => getWorkouts(1, true)}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        />
    </View>
  )
}