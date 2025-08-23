import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl, Touchable, TextInput, Modal } from 'react-native'
import React, { useEffect, useState } from 'react'
import styles from '@/assets/styles/workoutPage.styles'
import { API_URL } from '@/constants/api'
import { useAuthStore } from '@/store/authStore'
import { exerciseObj, workoutObj } from '../types/workout.types'
import { RenderWorkout } from '@/components/RenderWorkout'
import { Ionicons } from '@expo/vector-icons'
import Loader from '@/components/loader'
import homeStyles from '@/assets/styles/home.styles'
import COLORS from '@/constants/colors'
import workoutStyles from '@/assets/styles/workout.styles'

export default function Workout() {
  const { token } = useAuthStore()
  const [workouts, setWorkouts] = useState<workoutObj[]>([])
  const [ loading, setLoading ] = useState(true)
  const [ refreshing, setRefreshing ] = useState(false)
  const [ page, setPage ] = useState(1)
  const [ hasMore, setHasMore ] = useState(true) 
  const [ isWorkoutActive, setIsWorkoutActive ] = useState(false)
  const [ isEditingTitle, setIsEditingTitle ] = useState(false)
  const [ workoutTitle, setWorkoutTitle ] = useState("")
  const [ workoutTime, setWorkoutTime ] = useState(0)
  const [ exercises, setExercises ] = useState<exerciseObj[]>([])
  const [ showAddExercise, setShowAddExercise ] = useState(false)
  const [ newExerciseName, setNewExerciseName ] = useState("")

  useEffect(() => {
    let interval = 0
    if (isWorkoutActive) {
      interval = setInterval(() => {
        setWorkoutTime(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isWorkoutActive])


  const renderWorkout = ({ item } : {item: workoutObj}) => (
    <View style={homeStyles.postCard}>
      <RenderWorkout workoutId={item._id} />
    </View>
  )

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`
    }
    return `${minutes}m ${secs}s`
  }

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

  const pauseWorkout = () => {
    setIsWorkoutActive(false)
  }

  const endWorkout = () => {
    setIsWorkoutActive(false)
    setWorkoutTime(0)
    setExercises([])
    setWorkoutTitle('')
  }

  const startWorkout = () => {
    setIsWorkoutActive(true)
    setWorkoutTime(0)
    setExercises([])
  }

  const addExercise = () => {
    if (newExerciseName.trim()) {
      const newExercise = {
        api_exercise_id: "0001",
        sets: [],
        _id: "Date.now()",
        name: newExerciseName,
        order: 0,
        added_at: new Date(),
        notes: "",
      }
      setExercises([...exercises, newExercise])
      setNewExerciseName('')
      setShowAddExercise(false)
    }
  }
  
  if (loading) return <Loader size="small" />


  return (
    <View style={styles.container}>
      {!isWorkoutActive ? (
        <View style={styles.startWorkoutContainer}>
          <Text style={styles.startWorkoutTitle}>Ready to crush it?</Text>
          <TouchableOpacity onPress={startWorkout} style={styles.startButton}>
            <Text style={styles.startButtonText}>🔥 Start workout!</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.activeWorkoutContainer}>
          <View style={styles.workoutHeader}>
            <TouchableOpacity 
              onPress={() => setIsEditingTitle(true)}
              style={styles.titleContainer}
            >
              {isEditingTitle ? (
                <TextInput
                  style={styles.titleInput}
                  value={workoutTitle}
                  onChangeText={setWorkoutTitle}
                  onBlur={() => setIsEditingTitle(false)}
                  autoFocus
                />
              ) : (
                <Text style={styles.activeWorkoutTitle}>{workoutTitle}</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.photoButton}>
              <Text style={styles.photoButtonText}>📸</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.timerContainer}>
              <Text style={styles.timerText}>{formatTime(workoutTime)}</Text>
              <View style={[workoutStyles.statusBadge, { marginRight: 10 }]}>
                <Text style={workoutStyles.statusText}>🔴</Text>
                <Text style={workoutStyles.statusText}>in progress</Text>
              </View>
          </View>

          <View style={styles.exercisesList}>
              {exercises.map(exercise => (
                <View key={exercise._id} style={styles.exerciseItem}>
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                  <Text style={styles.exerciseDetails}>0 sets</Text>
                </View>
              ))}

              <TouchableOpacity 
                style={styles.addExerciseButton}
                onPress={() => setShowAddExercise(true)}
              >
                <Text style={styles.addExerciseText}>+ Add Exercise</Text>
              </TouchableOpacity>
          </View>

          <View style={styles.workoutControls}>
              <TouchableOpacity
                style={styles.pauseButton}
                onPress={pauseWorkout}
              >
                <Text style={styles.controlButtonText}>⏸️ Pause</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.endButton}
                onPress={endWorkout}
              >
                <Text style={styles.controlButtonText}>🏁 End Workout</Text>
              </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Add Exercise Modal */}
      <Modal
        visible={showAddExercise}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddExercise(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Exercise</Text>
            <TextInput  
              style={styles.modalInput}
              placeholder="Exercise name"
              value={newExerciseName}
              onChangeText={setNewExerciseName}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowAddExercise(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.addButton}
                onPress={addExercise}
              >
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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