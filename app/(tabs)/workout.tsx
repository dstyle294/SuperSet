import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl, Touchable, TextInput, Modal, Alert } from 'react-native'
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
  const [ searchQuery, setSearchQuery ] = useState("")
  const [ searchResults, setSearchResults ] = useState([])
  const [ isSearching, setIsSearching ] = useState(false)
  const [ workoutId, setWorkoutId ] = useState("")
  const [ paused, setPaused ] = useState(false)
  const [ shouldResume, setShouldResume ] = useState(false)
  const [ renderTrigger, setRenderTrigger ] = useState(0)
  

  useEffect(() => {
    let interval = 0
    if (isWorkoutActive && !paused) {
      interval = setInterval(() => {
        setWorkoutTime(prev => prev + 1)
      }, 1000)
    }

    if ( shouldResume && workoutId && isWorkoutActive ) {
      resumeWorkout()
      setShouldResume(false)
    }



    return () => clearInterval(interval)
  }, [isWorkoutActive, paused, shouldResume, workoutId])

  const updateWorkoutInList = (workoutId: string, updates: Partial<workoutObj>) => {
    setWorkouts(prevWorkouts => 
      prevWorkouts.map(workout => 
        workout._id === workoutId
          ? { ...workout, ...updates }
          : workout
      )
    )
  }


  const renderWorkout = ({ item } : {item: workoutObj}) => {
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

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`
    }
    return `${minutes}m ${secs}s`
  }

  const getWorkouts = async (pageNum = 1, refreshing = false) => {
    try {
      if ( refreshing ) setRefreshing(true)
      else if (pageNum == 1) setLoading(true)

      const response = await fetch(`${API_URL}/workouts/?page=${pageNum}`, {
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

  const pauseWorkout = async () => {
    try {
      const response = await fetch(`${API_URL}/workouts/pause/${workoutId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.message || "Something went wrong");

      if (workoutId) {
        updateWorkoutInList(workoutId, { status: 'paused' })
      }

      setPaused(true)
      setRenderTrigger(prev => prev + 1)
      

    } catch (error) {
      console.log("Error pausing workout", error)
      if (error instanceof Error) {
        Alert.alert("Error", error.message)
      }
    }
  }

  const resumeWorkout = async () => {
    try {
      const response = await fetch(`${API_URL}/workouts/resume/${workoutId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      console.log(response)

      const data = await response.json()

      if (!response.ok) throw new Error(data.message || "Something went wrong");

      if (workoutId) {
        updateWorkoutInList(workoutId, { status: 'in-progress' })
      }

      setPaused(false)
      setRenderTrigger(prev => prev + 1)
      

    } catch (error) {
      console.log("Error resuming workout", error)
      if (error instanceof Error) {
        Alert.alert("Error", error.message)
      }
    }
  }

  const endWorkout = async () => {
    try {
      const response = await fetch(`${API_URL}/workouts/end/${workoutId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.message || "Something went wrong");

      if (workoutId) {
        updateWorkoutInList(workoutId, { status: 'completed' })
      }

      setIsWorkoutActive(false)
      setWorkoutTime(0)
      setExercises([])
      setWorkoutTitle('')
      setWorkoutId("")
      setRenderTrigger(prev => prev + 1)

    } catch (error) {
      console.log("Error ending workout", error)
      if (error instanceof Error) {
        Alert.alert("Error", error.message)
      }
    }
    
  }

  const startWorkout = async () => {
    try {
      const response = await fetch(`${API_URL}/workouts/start`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.message || "Something went wrong");
      
      setIsWorkoutActive(true)
      setWorkoutTime(0)
      setExercises([])
      console.log(data)
      setWorkoutId(data._id)

    } catch (error) {
      console.log("Error starting workout", error)
      if (error instanceof Error) {
        Alert.alert("Error", error.message)
      }
    }
    
  }

  const addExercise = () => {
    if (newExerciseName.trim()) {
      const newExercise = {
        api_exercise_id: "0001",
        sets: [],
        _id: "Date.now()",
        name: newExerciseName,
        order: exercises.length + 1,
        added_at: new Date(),
        notes: "",
      }
      setExercises([...exercises, newExercise])
      setNewExerciseName('')
      setShowAddExercise(false)
    }
  }

  const searchExercises = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return ;
    }

    setIsSearching(true)

    try {
      
    } catch (error) {
      
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
                {!paused ? (
                  <>
                    <Text style={workoutStyles.statusText}>🔴</Text>
                    <Text style={workoutStyles.statusText}>in progress</Text>
                  </>
                ) : (
                  <>
                    <Text style={workoutStyles.statusText}>⏸️</Text>
                    <Text style={workoutStyles.statusText}>paused</Text>
                  </>
                )}
                
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
              {!paused ? (
                <TouchableOpacity
                  style={styles.pauseButton}
                  onPress={pauseWorkout}
                >
                  <Text style={styles.controlButtonText}>⏸️ Pause</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.resumeButton}
                  onPress={resumeWorkout}
                >
                <Text style={styles.controlButtonText}>▶️ Resume</Text>
              </TouchableOpacity>
              )}
              
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
    </View>
  )
}