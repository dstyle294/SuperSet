import styles from "@/assets/styles/workout.styles"
import { API_URL } from "@/constants/api"
import { useAuthStore } from "@/store/authStore"
import { useEffect, useState } from "react"
import { Text, View } from "react-native"
import { StatCard } from "./StatCard"

interface exerciseObj {
  api_exercise_id: string,
  name: string,
  order: number,
  sets: number,
  reps: number,
  weight: number,
  rest_time: number,
  notes: string,
  added_at: Date,
  _id: string,
}

interface equipmentObj {
  equipment: string,
}

interface muscleObj {
  muscle: string,
}

interface secondaryMuscleObj {
  secondary_muscle: string,
}

interface workoutObj {
  _id: string,
  is_public: boolean,
  allow_copying: boolean,
  copied_from: string,
  user: string,
  start_time: string,
  end_time: string,
  pause_start: string,
  pause_end: string,
  total_pause_time: number,
  updated_at: string,
  status: string,
  exercises: exerciseObj[],
  equipment_needed: equipmentObj[],
  muscle_groups: muscleObj[],
  secondary_muscle_groups: secondaryMuscleObj[],
  title: string,
  total_duration: number,
}

interface RenderWorkoutProps {
  workoutId: string,
}

const getStatusStyle = (status: (string | undefined)) => {
  switch (status) {
    case 'completed': 
      return { backgroundColor: '#dcfce7', borderColor: '#bbf7d0'}
    case 'in-progress':
      return { backgroundColor: '#dbeafe', borderColor: '#bfdbfe'}
    case 'paused': 
      return { backgroundColor: '#fef3c7', borderColor: '#fde68a'}
    default:
      return { backgroundColor: '#f3f4f6', borderColor: '#e5e7eb'}
  }
}

const getStatusTextStyle = (status: (string | undefined)) => {
  switch (status) {
    case 'completed': 
      return { color: '#166534' }
    case 'in-progress':
      return { color: '#1e40af' }
    case 'paused':
      return { color: '#92400e' }
    default: 
      return { color: '#374151' }
  }
}

const formatDuration = (startTime: (string | undefined), total_duration: (number | undefined)) => {
  if (startTime == null) return ""
  if (total_duration != null) {
    const hours = Math.floor(total_duration / 3600)
    const mins = (total_duration / 60) % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const start = new Date(startTime)
  const now = new Date()
  const diffMs = now.getTime() - start.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const hours = Math.floor(diffMins / 60)
  const mins = diffMins % 60
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
}

export const RenderWorkout: React.FC<RenderWorkoutProps> = ({ workoutId }) => {
  const { token } = useAuthStore()
  const [workout, setWorkout] = useState<workoutObj|null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const response = fetch(`${API_URL}/workouts/${workoutId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).then(async (res) => {
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch workout");
      }

      setWorkout(data.workout)
    })
    .catch((err) => {

    })
    .finally(() => {
      setLoading(false)
    })

  }, [])

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Loading workout...</Text>
          </View>
        </View>
      </View>
    )
  }
  if (workout == null) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>You cannot access this workout</Text>
          </View>
        </View>
      </View>
    )
  }

  
  return (
    <View style={styles.container}>
      {/* Content */}
      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{workout?.title}</Text>
          <View style={[styles.statusBadge, getStatusStyle(workout?.status)]}>
            <Text style={[styles.statusText, getStatusTextStyle(workout?.status)]}>
              {workout.status === 'in-progress' ? '▶️' : workout.status === 'completed' ? '✅' : '⏸️'} {workout.status.replace('-', ' ')}
            </Text>
          </View>
        </View>
      </View>

      {/* Quick stats */}
      <View style={styles.statsContainer}>
        <StatCard 
          value={formatDuration(workout?.start_time, workout?.total_duration)}
          label="Duration"
        />
        <StatCard 
          value={workout.exercises.length}
          label="Exercises"
        />
        <StatCard 
          value={workout.muscle_groups.length + workout.secondary_muscle_groups.length}
          label="Muscle groups"
        />
      </View>
    </View>
  )
}
