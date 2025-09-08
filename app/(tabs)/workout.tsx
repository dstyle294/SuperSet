import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl, Touchable, TextInput, Modal, Alert, SafeAreaView } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import styles from '@/assets/styles/workoutPage.styles'
import { API_URL } from '@/constants/api'
import { useAuthStore } from '@/store/authStore'
import { exerciseFromSearchObj, exerciseObj, workoutObj } from '../types/workout.types'
import { RenderWorkout } from '@/components/RenderWorkout'
import { Ionicons } from '@expo/vector-icons'
import Loader from '@/components/loader'
import homeStyles from '@/assets/styles/home.styles'
import COLORS from '@/constants/colors'
import workoutStyles from '@/assets/styles/workout.styles'
import { formatTime } from '@/lib/utils'
import { RenderExerciseInSearch } from '@/components/RenderExerciseInSearch'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import SafeScreen from '@/components/SafeScreen'

export default function Workout() {
  const { token } = useAuthStore()
  const [ workouts, setWorkouts ] = useState<workoutObj[]>([])
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
  const [ searchResults, setSearchResults ] = useState<exerciseFromSearchObj[]>([])
  const [ isSearching, setIsSearching ] = useState(false)
  const [ searchPage, setSearchPage ] = useState(1)
  const [ searchRefreshing, setSearchRefreshing ] = useState(false)
  const [ searchHasMore, setSearchHasMore ] = useState(false)
  const [ workoutId, setWorkoutId ] = useState("")
  const [ paused, setPaused ] = useState(false)
  const [ shouldResume, setShouldResume ] = useState(false)
  const [ renderTrigger, setRenderTrigger ] = useState(0)
  const [ searchLoading, setSearchLoading ] = useState(true)
  

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

    getWorkouts()

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

  const handleLoadMore = async () => {
    if (hasMore && !loading && !refreshing) {
      await getWorkouts(page + 1)
    }
  }

  const renderExerciseInSearch = ({ item } : { item: exerciseFromSearchObj }) => {
    return (
      <RenderExerciseInSearch exercise={item} />
    )
  }

  const handleLoadMoreExercisesInSearch = async () => {
    if (searchHasMore && !searchLoading && !searchRefreshing) {
      console.log('here')
      await searchExercises(searchPage + 1, searchQuery, searchRefreshing)
    }
  }

  const addNewExercise = async () => {

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

  const timeoutRef = useRef<number | null>(null)

  const searchWithDebounce = useCallback((query: string) => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      console.log(`Searching for ${query}`)

      searchExercises(searchPage, query, searchRefreshing)
    }, 500)
  }, [])

  const searchExercises = async (pageNum = 1, query: string, searchRefreshing = false) => {
    if (!query.trim()) {
      setSearchResults([])
      setIsSearching(false)
      setSearchPage(1)
      setSearchHasMore(false)
      setSearchLoading(false)
      return ;
    }

    setIsSearching(true)
    setSearchLoading(true)

    try {
      const response = await fetch(`${API_URL}/exercises/name/${query}?page=${pageNum}`, {
          method: 'GET',
        }
      )

      const data = await response.json()

      if (!response.ok) throw new Error(data.message || "Something went wrong!")


      const uniqueExercises = 
        searchRefreshing || pageNum === 1 
          ? data.exercises.data
          : Array.from(new Set([...searchResults, ...data.exercises.data].map((exercise) => exercise.exerciseId))).map((id) => 
            [...searchResults, ...data.exercises.data].find((exercise) => exercise.exerciseId === id)
          )
        
      console.log(uniqueExercises.length)
      setSearchResults(uniqueExercises)

      // change backend to return page num, totalpages

      setSearchHasMore(data.exercises.pageNum < data.exercises.totalPages)
      setSearchPage(data.exercises.pageNum)

        
    } catch (error) {
      console.error(`Error fetching exercises: ${error}`)
    } finally {
      setIsSearching(false)
      setSearchLoading(false)
    }
  }

  const handleSearchInput = (text: string) => {
    setSearchQuery(text)
    searchWithDebounce(text)
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
        <SafeAreaProvider>
          <SafeScreen>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Add Exercise</Text>
                  <TouchableOpacity
                    onPress={() => {
                      setShowAddExercise(false)
                      setSearchQuery('')
                      setSearchResults([])
                    }}
                    style={styles.closeButton}
                  >
                    <Ionicons name="close" size={20} color={COLORS.red} />
                  </TouchableOpacity>
                </View>
                <View style={styles.modalInputBox}>
                  <TextInput  
                    style={styles.modalInput}
                    placeholder="Search exercises (e.g. push up)"
                    value={searchQuery}
                    onChangeText={handleSearchInput}
                    autoFocus
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity
                      onPress={() => {
                        setSearchQuery('')
                        setSearchResults([])
                      }}
                      style={styles.clearButton}
                    >
                      <Ionicons name="close" size={16} color={COLORS.textDark} />
                    </TouchableOpacity>
                  )}
                </View>
                {searchQuery.length > 0 ? (
                  <FlatList 
                    data={searchResults}
                    renderItem={renderExerciseInSearch}
                    keyExtractor={(item: exerciseFromSearchObj) => item.exerciseId}
                    contentContainerStyle={homeStyles.listContainer}
                    showsVerticalScrollIndicator={true}
                    onEndReached={handleLoadMoreExercisesInSearch}
                    onEndReachedThreshold={0.1}
                    ListEmptyComponent={() => {
                      if (searchLoading) {
                        return (
                          <View style={homeStyles.emptyContainer}>
                            <ActivityIndicator style={homeStyles.footerLoader} size="large" color={COLORS.primary} />
                            <Text style={homeStyles.emptyText}>Searching exercises...</Text>
                          </View>
                        )
                      } 
                      return (
                        <View style={homeStyles.emptyContainer}>
                          <Text style={homeStyles.emptyText}>No exercises for this search 😞</Text>
                          <TouchableOpacity
                            onPress={addNewExercise}
                            style={styles.addButton}
                          >
                            <Text style={styles.addButtonText}>Add new exercise</Text>
                          </TouchableOpacity>
                        </View>
                      )
                    }}
                    ListFooterComponent={
                      searchHasMore && searchResults.length > 0 ? (
                        <ActivityIndicator style={homeStyles.footerLoader} size="small" color={COLORS.primary} />
                      ) : null
                    }
                    refreshControl={
                      <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => searchExercises(1, searchQuery)}
                        colors={[COLORS.primary]}
                        tintColor={COLORS.primary}
                      />
                    }
                  />
                ) : (
                  null
                )}
                
              </View>
            </View>
          </SafeScreen>
        </SafeAreaProvider>
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