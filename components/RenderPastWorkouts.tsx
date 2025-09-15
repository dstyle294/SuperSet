import { workoutObj } from "@/app/types/workout.types"
import { useState } from "react"
import { FlatList, TouchableOpacity, View } from "react-native"

interface RenderPastWorkoutsProps {
  workoutId: string,
  setWorkoutId: (id: string) => void,
  isWorkoutActive: boolean, 
  setIsWorkoutActive: (active: boolean) => void,
}

export const RenderPastWorkouts: React.FC<RenderPastWorkoutsProps> = ({ workoutId, setWorkoutId, isWorkoutActive, setIsWorkoutActive }) => {
  const [ workouts, setWorkouts ] = useState<workoutObj[]>([])

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
              setWorkoutTitle(item.title)
              setWorkoutTime((new Date().getTime() - new Date(item.start_time).getTime() - item.total_pause_time) / 1000)
              setExercises(item.exercises)
              setWorkoutId(item._id)
              setPaused(false)
              setRenderTrigger(prev => prev + 1)
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
              setWorkoutTitle(item.title)
              setWorkoutTime((new Date().getTime() - new Date(item.start_time).getTime() - (item.total_pause_time)) / 1000)
              setExercises(item.exercises)
              setWorkoutId(item._id)
              setShouldResume(true)
              updateWorkoutInList(item._id, { status: 'in-progress' })
              setRenderTrigger(prev => prev + 1)
            }}
            style={styles.resumeButton}
          >
            <Text style={styles.controlButtonText}>Resume? ▶️</Text>
          </TouchableOpacity>
        ) : (
          null
        )}
        <RenderWorkout workoutId={item._id} currentStatus={currentStatus} />
      </View>
    )
  }
  
  return (
    <FlatList
      data={workouts} 
      renderItem={renderWorkout}
      keyExtractor={(item: workoutObj) => item._id}
      contentContainerStyle={homeStyles.listContainer}
      showsVerticalScrollIndicator={false}
      onEndReached={handleLoadMore}
      extraData={renderTrigger}
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