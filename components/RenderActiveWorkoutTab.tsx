import { exerciseObj, workoutObj, workoutSet } from "@/assets/types/workout.types"
import workoutStyles from "@/assets/styles/workout.styles"
import styles from "@/assets/styles/workoutPage.styles"
import { API_URL } from "@/constants/api"
import { formatTime } from "@/lib/utils"
import { useAuthStore } from "@/store/authStore"
import { useEffect, useRef, useState } from "react"
import { Alert, FlatList, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native"
import { RenderAddExercise } from "./RenderAddExercise"
import Loader from "./loader"
import COLORS from "@/constants/colors"
import { Ionicons } from "@expo/vector-icons"

interface RenderActiveWorkoutTabProps {
  workoutId: string,
  setWorkoutId: (id: string) => void,
  isWorkoutActive: boolean,
  setIsWorkoutActive: (active: boolean) => void,
  paused: boolean,
  setPaused: (paused: boolean) => void,
  refreshing: boolean,
  setRefreshing: (paused: boolean) => void,
  shouldResume: boolean, 
  setShouldResume: (resume: boolean) => void
}



export const RenderActiveWorkoutTab: React.FC<RenderActiveWorkoutTabProps> = ({ workoutId, setWorkoutId, isWorkoutActive, setIsWorkoutActive, paused, setPaused, refreshing, setRefreshing, shouldResume, setShouldResume }) => {
  const { token } = useAuthStore()

  const [ workoutTitle, setWorkoutTitle ] = useState("")
  const [ workoutTime, setWorkoutTime ] = useState(0)
  const [ exercises, setExercises ] = useState<exerciseObj[]>([])
  const [ isEditingTitle, setIsEditingTitle ] = useState(false)
  const [ showAddExercise, setShowAddExercise ] = useState(false)
  const [ workouts, setWorkouts ] = useState<workoutObj[]>([])
  const [ renderTrigger, setRenderTrigger ] = useState(0)
  const lastTap = useRef<number>(null)
  const [ currentHint, setCurrentHint ] = useState(0)

  const DOUBLE_TAP_DELAY = 300 // ms
  const hints = [
    "💡 Tip: Long press any workout to delete it",
    "👆 Double tap sets to delete them"
  ]
  
  useEffect(() => {
    getWorkoutById(workoutId)
  }, [workoutId])

  useEffect(() => {
    if ( shouldResume && workoutId && isWorkoutActive ) {
      resumeWorkout()
      setShouldResume(false)
    }
  }, [shouldResume, workoutId, isWorkoutActive])
  
  useEffect(() => {
    let interval = 0
    if (isWorkoutActive && !paused) {
      interval = setInterval(() => {
        setWorkoutTime(prev => prev + 1)
      }, 1000)
    }


    return () => {
      clearInterval(interval)
    }
  }, [isWorkoutActive, paused, workoutId, exercises])

  useEffect(() => {
    let hintsInterval = 0
    if (isWorkoutActive) {
      hintsInterval = setInterval(() => {
        setCurrentHint((prev) => (prev + 1) % hints.length)
      }, 5000)
    }

    return () => {
      clearInterval(hintsInterval)
    }
  }, [])
  
  const capitalizeFirstLetter = (exerciseName: string) => {
    return exerciseName.charAt(0).toUpperCase() + exerciseName.slice(1)
  }

  const updateWorkoutInList = (workoutId: string, updates: Partial<workoutObj>) => {
    setWorkouts(prevWorkouts => 
      prevWorkouts.map(workout => 
        workout._id === workoutId
          ? { ...workout, ...updates }
          : workout
      )
    )
  }

  const getWorkoutById = async (workoutId: string, refreshing = false) => {
    try {
      if (refreshing) setRefreshing(true)
      if (!workoutId) {
        return 
      }
      const response = await fetch(`${API_URL}/workouts/${workoutId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong")
      }

      setWorkoutTitle(data.workout.title)
      setWorkoutTime((new Date().getTime() - new Date(data.workout.start_time).getTime() - data.workout.total_pause_time) / 1000)
      setExercises(data.workout.exercises)

    } catch (error) {
      console.log(`Error fetching workout ${error}`)
    } finally {
      if (refreshing) setRefreshing(false)
    }
  }

  const deleteExercise = async (exerciseId: string) => {
    try {
      const response = await fetch(`${API_URL}/workouts/${workoutId}/exercises/${exerciseId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong")
      }

    } catch (error) {
      console.log(`Error deleting exercise ${error}`)
      Alert.alert("Error", "Couldn't delete exercise")
    }
  }

  const deleteWorkout = async (workoutId: string) => {
    try {
      const response = await fetch(`${API_URL}/workouts/${workoutId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong")
      }

    } catch (error) {
      console.log(`Error deleting workout ${error}`)
      Alert.alert("Error", "Couldn't delete workout")
    }
  }

  const deleteSet = async (exerciseId: string, setId: string) => {
    try {
      const response = await fetch(`${API_URL}/workouts/${workoutId}/exercises/${exerciseId}/sets/${setId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong")
      }

    } catch (error) {
      console.log(`Error deleting set ${error}`)
      Alert.alert("Error", "Couldn't delete set")
    }
  }

  const confirmDelete = (exerciseId: string) => {
    Alert.alert(
      "Delete?", 
      "Are you sure you want to delete this exercise?",
      [ 
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setRefreshing(true)
            try {
              await deleteExercise(exerciseId)
              await getWorkoutById(workoutId, true)
            } finally {
              setRefreshing(false)
            }
          } 
        }
      ], 
      { cancelable: false }
    )
  }

  const confirmSetDelete = (exerciseId: string, setId: string) => {
    Alert.alert(
      "Delete?", 
      "Are you sure you want to delete this set?",
      [ 
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setRefreshing(true)
            try {
              await deleteSet(exerciseId, setId)
              await getWorkoutById(workoutId, true)
            } finally {
              setRefreshing(false)
            }
          } 
        }
      ], 
      { cancelable: false }
    )
  }

  const confirmCancelWorkout = () => {
    Alert.alert(
      "Delete?", 
      "Are you sure you want to cancel this workout?",
      [ 
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setRefreshing(true)
            try {
              await deleteWorkout(workoutId)
              setIsWorkoutActive(false)
            } finally {
              setRefreshing(false)
            }
          } 
        }
      ], 
      { cancelable: false }
    )
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
      setWorkoutId(data._id)

    } catch (error) {
      console.log("Error starting workout", error)
      if (error instanceof Error) {
        Alert.alert("Error", error.message)
      }
    }
  }

  
 
  const addSet = async (exercise: exerciseObj) => {
    try {
      setRefreshing(true)
      const response = await fetch(`${API_URL}/workouts/${workoutId}/exercises/${exercise._id}/sets`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`, 
          'Content-Type': 'application/json'
        }, 
        body: JSON.stringify({ sets: [{set_number: exercise.sets.length + 1, reps: null, weight: null, completed: false, notes: ""}] })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong")
      }

      const updatedExercises = exercises.map(item => {
        if (item._id === exercise._id) {
          return data.exercise
        }
      })

      setExercises(updatedExercises)
      
    } catch (error) {
      console.log(`Error adding set ${error}`)
    } finally {
      setRefreshing(false)
    }
  }

  const onRepChange = async (reps: number, item: workoutSet, exercise: exerciseObj) => {
    try {
      const updatedExercises = exercises.map(ex => {
        if (ex._id === exercise._id) {
          return {
            ...ex,
            sets: ex.sets.map(set => 
              set._id === item._id 
                ? { ...set, reps: reps ? Number(reps) : null }
                : set
            )
          }
        }
        return ex
      })
      setExercises(updatedExercises)
      
      item.reps = reps
      const response = await fetch(`${API_URL}/workouts/${workoutId}/exercises/${exercise._id}/sets/${item._id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(item)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong")
      }
      
    } catch (error) {
      console.log(`Error updating set reps ${error}`)
    }
  }
  
  const onWeightChange = async (weight: number, item: workoutSet, exercise: exerciseObj) => {
    try {

      const updatedExercises = exercises.map(ex => {
        if (ex._id === exercise._id) {
          return {
            ...ex,
            sets: ex.sets.map(set => 
              set._id === item._id 
                ? { ...set, weight: weight ? Number(weight) : null }
                : set
            )
          }
        }
        return ex
      })

      setExercises(updatedExercises)

      item.weight = weight
      const response = await fetch(`${API_URL}/workouts/${workoutId}/exercises/${exercise._id}/sets/${item._id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(item)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong")
      }
      
    } catch (error) {
      console.log(`Error updating set weight ${error}`)
    }
  }

  const onCompletenessChange = async (set: workoutSet, exercise: exerciseObj) => {
    try {
      set.completed = !set.completed
      const response = await fetch(`${API_URL}/workouts/${workoutId}/exercises/${exercise._id}/sets/${set._id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(set)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong")
      }
      
    } catch (error) {
      console.log(`Error updating set completeness ${error}`)
    }
  }

  const handleSetTap = (exerciseId: string, setId: string) => {
    const now = Date.now()
    if (lastTap.current && (now - lastTap.current) < DOUBLE_TAP_DELAY) {
      confirmSetDelete(exerciseId, setId)
      lastTap.current = null
    } else {
      lastTap.current = now
    }
  }

  const renderSet = (set: workoutSet, exercise: exerciseObj) => {
    return (
      <TouchableOpacity style={styles.setContainer} onPress={() => handleSetTap(exercise._id, set._id)}>
        <Text style={styles.setNumber}>Set {set.set_number}</Text>
        <TextInput
          style={styles.setInputBox}
          placeholder="Reps"
          placeholderTextColor={COLORS.placeholderText}
          value={set.reps ? set.reps.toString() : ""}
          keyboardType="numeric"
          onChangeText={(reps) => onRepChange(Number(reps), set, exercise)}
        />
        <Text style={styles.setMultiply}>x</Text>
        <TextInput
          style={styles.setInputBox}
          placeholder="Weight"
          placeholderTextColor={COLORS.placeholderText}
          value={set.weight ? set.weight.toString() : ""}
          keyboardType="numeric"
          onChangeText={(weight) => onWeightChange(Number(weight), set, exercise)}
        />
        <TouchableOpacity 
          style={!set.completed ? (styles.setBox) : ([styles.setBox, {backgroundColor: COLORS.green}])}
          onPress={() => onCompletenessChange(set, exercise)}
        >
          <Ionicons
            name="checkmark"
            color="white"
            size={20}
          />
        </TouchableOpacity>

      </TouchableOpacity>
    )
  }

  const renderExercise = ({ item } : { item: exerciseObj}) => {
    const completedSets = item.sets.filter(set => set.completed === true).length
    return (
      <TouchableOpacity 
        style={styles.liveExercisesContainer}
        onLongPress={() => confirmDelete(item._id)}
        delayLongPress={500} 
        activeOpacity={0.7}
      >
        <View key={item._id} style={styles.exerciseItem}>
          <Text style={styles.exerciseName}>{capitalizeFirstLetter(item.name)}</Text>
          <Text style={styles.exerciseDetails}>{completedSets} of {item.sets.length} sets completed</Text>
        </View>
        {item.sets.map((set) => (
          <View key={set._id}>
            {renderSet(set, item)}
          </View>
        ))}
        <TouchableOpacity 
          style={styles.addSetButton}
          onPress={() => addSet(item)}
        >
          <Text style={styles.addSetButtonText}>+ Add Set</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    )
  }

  if (isWorkoutActive && workoutId && !workoutTitle) {
    return <Loader size="large" /> // Show loader until workout data is loaded
  }

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
            {/* <TouchableOpacity style={styles.photoButton}>
              <Text style={styles.photoButtonText}>📸</Text>
            </TouchableOpacity> */}
            <TouchableOpacity style={styles.photoButton} onPress={confirmCancelWorkout}>
              <Ionicons name="close-sharp" color={COLORS.red} size={30}/>
            </TouchableOpacity>
          </View>

          <View style={styles.timerContainer}>
              <Text style={styles.timerText}>{formatTime(workoutTime)}</Text>
              <View style={[workoutStyles.statusBadge]}>
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
            <FlatList
              data={exercises}
              keyExtractor={(item) => item._id}
              renderItem={renderExercise}
              showsVerticalScrollIndicator={true}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={() => getWorkoutById(workoutId)}
                  colors={[COLORS.primary]}
                  tintColor={COLORS.primary}
                />
              }
            />
              

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

              <RenderAddExercise
                showAddExercise={showAddExercise}
                setShowAddExercise={setShowAddExercise}
                refreshing={refreshing} 
                setRefreshing={setRefreshing} 
                exercises={exercises}
                setExercises={setExercises}
                workoutId={workoutId}
                setWorkoutId={setWorkoutId}
              />
          </View>

          <View style={styles.hints}>
              <Text style={styles.hintText}>
                {hints[currentHint]}
              </Text>
          </View>
        </View>
      )}
    </View>
  )
}