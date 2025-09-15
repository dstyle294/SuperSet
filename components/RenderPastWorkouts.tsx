import { workoutObj } from "@/app/types/workout.types"
import { useEffect, useState } from "react"
import { ActivityIndicator, Alert, FlatList, RefreshControl, Text, TouchableOpacity, View } from "react-native"
import homeStyles from '@/assets/styles/home.styles'
import styles from "@/assets/styles/workoutPage.styles"
import COLORS from "@/constants/colors"
import { Ionicons } from "@expo/vector-icons"
import { RenderWorkout } from "./RenderWorkout"
import { API_URL } from "@/constants/api"
import { useAuthStore } from "@/store/authStore"
import Loader from "./loader"

interface RenderPastWorkoutsProps {
  workoutId: string,
  setWorkoutId: (id: string) => void,
  isWorkoutActive: boolean, 
  setIsWorkoutActive: (active: boolean) => void,
  paused: boolean,
  setPaused: (paused: boolean) => void,
  refreshing: boolean,
  setRefreshing: (paused: boolean) => void,
  activeTab: ['workout', 'history'],
  setActiveTab: (tab: string) => void, 
  shouldResume: boolean, 
  setShouldResume: (resume: boolean) => void
}

export const RenderPastWorkouts: React.FC<RenderPastWorkoutsProps> = ({ workoutId, setWorkoutId, isWorkoutActive, setIsWorkoutActive, paused, setPaused, refreshing, setRefreshing, activeTab, setActiveTab, shouldResume, setShouldResume }) => {
  const { token } = useAuthStore()
  
  const [ workouts, setWorkouts ] = useState<workoutObj[]>([])
  const [ renderTrigger, setRenderTrigger ] = useState(0)
  const [ hasMore, setHasMore ] = useState(true) 
  const [ loading, setLoading ] = useState(false)
  const [ page, setPage ] = useState(0)

  useEffect(() => {
    getWorkouts(1, refreshing)
  }, [refreshing])
  

  const updateWorkoutInList = (workoutId: string, updates: Partial<workoutObj>) => {
    setWorkouts(prevWorkouts => 
      prevWorkouts.map(workout => 
        workout._id === workoutId
          ? { ...workout, ...updates }
          : workout
      )
    )
  }

  const getWorkouts = async (pageNum = 1, refreshing = false) => {
    try {
      if ( refreshing ) setRefreshing(true)
      else if (pageNum == 1) setLoading(true)

      const response = await fetch(`${API_URL}/workouts/?page=${pageNum}`, {
        method: 'GET',
        headers: {
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


  const renderWorkout = ({ item } : { item: workoutObj }) => {
    const getCurrentStatus = () => {
      if (item._id === workoutId && isWorkoutActive) {
        return paused ? 'paused' : 'in-progress'
      }
      return item.status
    }

    const currentStatus = getCurrentStatus()

    return (
      <View style={homeStyles.postCard}>

        {currentStatus === 'in-progress' ? (
          <TouchableOpacity
            onPress={() => {
              setIsWorkoutActive(true)
              setWorkoutId(item._id)
              setPaused(false)
              setActiveTab('workout')
            }}
            style={styles.resumeButton}
          >
            <Text style={styles.controlButtonText}>Continue?</Text>
          </TouchableOpacity>
        ) : (
          null
        )}

        {currentStatus === 'paused' ? (
          <TouchableOpacity 
            onPress={async () => {
              setIsWorkoutActive(true)
              setWorkoutId(item._id)
              setShouldResume(true)
              setPaused(false)
              updateWorkoutInList(item._id, { status: 'in-progress' })
              setActiveTab('workout')
            }}
            style={styles.resumeButton}
          >
            <Text style={styles.controlButtonText}>Resume? ▶️</Text>
          </TouchableOpacity>
        ) : (
          null
        )}
        <RenderWorkout workoutId={item._id} currentStatus={currentStatus} personal={true} setRefreshing={setRefreshing} />
      </View>
    )
  }

  const handleLoadMore = async () => {
    if (hasMore && !loading && !refreshing) {
      await getWorkouts(page + 1)
    }
  }

  if (loading) return <Loader size="medium"  />
  
  return (
    <FlatList
      data={workouts} 
      renderItem={renderWorkout}
      keyExtractor={(item: workoutObj) => item._id}
      contentContainerStyle={homeStyles.listContainer}
      showsVerticalScrollIndicator={false}
      onEndReached={handleLoadMore}
      // extraData={renderTrigger}
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
  )
}