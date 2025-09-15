import { exerciseObj, workoutObj, workoutSet } from "@/app/types/workout.types"
import workoutStyles from "@/assets/styles/workout.styles"
import styles from "@/assets/styles/workoutPage.styles"
import { API_URL } from "@/constants/api"
import { formatTime } from "@/lib/utils"
import { useAuthStore } from "@/store/authStore"
import { useState } from "react"
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native"


export const RenderActiveWorkoutTab = () => {
  const { token } = useAuthStore()

  const [ isWorkoutActive, setIsWorkoutActive ] = useState(false)
  const [ workoutTitle, setWorkoutTitle ] = useState("")
  const [ workoutTime, setWorkoutTime ] = useState(0)
  const [ exercises, setExercises ] = useState<exerciseObj[]>([])
  const [ workoutId, setWorkoutId ] = useState("")
  const [ isEditingTitle, setIsEditingTitle ] = useState(false)
  const [ paused, setPaused ] = useState(false)
  const [ showAddExercise, setShowAddExercise ] = useState(false)
  const [ workouts, setWorkouts ] = useState<workoutObj[]>([])
  const [ renderTrigger, setRenderTrigger ] = useState(0)
  

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

  const renderSet = ({ item } : { item: workoutSet }) => {
    return (
      <View style={styles.setContainer}>
        <Text style={styles.setNumber}>Set {item.set_number}</Text>
        {/* <TextInput
          style={styles.setInputBox}
        >

        </TextInput> */}
      </View>
    )
  }

  const renderExercise = ({ item } : { item: exerciseObj}) => {
    const completedSets = item.sets.filter(set => set.completed === true).length
    return (
      <View style={styles.liveExercisesContainer}>
        <View key={item._id} style={styles.exerciseItem}>
          <Text style={styles.exerciseName}>{capitalizeFirstLetter(item.name)}</Text>
          <Text style={styles.exerciseDetails}>{completedSets} of {item.sets.length} sets completed</Text>
        </View>
        {item.sets.map((item) => (
          <View key={item._id}>
            {renderSet({item})}
          </View>
        ))}
      </View>
    )
  }

  return (
    !isWorkoutActive ? (
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

        <ScrollView style={styles.exercisesList}>
          {exercises.map((item) => (
            <View key={item._id}>
              {renderExercise({ item })}
            </View>
          ))}
            

          <TouchableOpacity 
            style={styles.addExerciseButton}
            onPress={() => setShowAddExercise(true)}
          >
            <Text style={styles.addExerciseText}>+ Add Exercise</Text>
          </TouchableOpacity>
        </ScrollView>

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
    )
  )
}