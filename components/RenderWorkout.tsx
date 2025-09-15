import styles from "@/assets/styles/workout.styles"
import { API_URL } from "@/constants/api"
import { useAuthStore } from "@/store/authStore"
import { useEffect, useState } from "react"
import { Text, TouchableOpacity, View } from "react-native"
import { StatCard } from "./StatCard"
import { Badge } from "./Badge"
import { exerciseObj, workoutObj } from "@/app/types/workout.types"
import { ExerciseCard } from "./ExerciseCard"
import { DetailRow } from "./DetailRow"






interface RenderWorkoutProps {
  workoutId: string,
  currentStatus?: string
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
    const mins = Math.floor((total_duration / 60) % 60)
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

export const RenderWorkout: React.FC<RenderWorkoutProps> = ({ workoutId, currentStatus }) => {
  const { token } = useAuthStore()
  const [workout, setWorkout] = useState<workoutObj|null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [activeTab, setActiveTab] = useState('overview')

  const status = currentStatus || workout?.status

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <View style={styles.tabContent}>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>🎯 Target Muscles</Text>
              </View>
              <View style={styles.badgeContainer}>
                {workout?.muscle_groups.map(({muscle}, index) => (
                  <Badge key={index} text={muscle} type="primary" />
                ))}
              {workout?.secondary_muscle_groups.map(({secondary_muscle}, index) => (
                <Badge key={`sec-${index}`} text={secondary_muscle} type="secondary" />
              ))}
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>🏋️ Equipment needed</Text>
              </View>
              <View style={styles.badgeContainer}>
                {workout?.equipment_needed.map(({equipment}, index) => (
                  <Badge key={index} text={equipment} type="equipment" />
                ))}
              </View>
            </View>
          </View>
        )
      case 'exercises':
        return (
          <View style={styles.tabContent}>
            {workout?.exercises.map((exercise, index) => (
              <ExerciseCard key={index} exercise={exercise} index={index} />
            ))}
          </View>
        )
      case 'details':
        return (
          <View style={styles.tabContent}>
            <DetailRow
              label="Started"
              value={new Date(workout?.start_time || Date.now()).toLocaleString()}
            />
            {workout?.end_time ? (
              <DetailRow
                label="Ended"
                value={new Date(workout?.end_time || Date.now()).toLocaleString()}
              />
            ) : (null)}
            <DetailRow
              label="Updated at"
              value={new Date(workout?.updated_at || Date.now()).toLocaleString()}
            />
            <DetailRow
              label="Workout ID"
              value={workout?._id.toString()}
            />
            <DetailRow
              label="Public"
              value={workout?.is_public ? "Yes" : "No"}
            />
            <DetailRow
              label="Allow copying"
              value={workout?.allow_copying ? "Yes" : "No"}
            />
          </View>
        )
    }
  }

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
          <View style={[styles.statusBadge, getStatusStyle(status)]}>
            <Text style={[styles.statusText, getStatusTextStyle(status)]}>
              {status === 'in-progress' ? '▶️' : status === 'completed' ? '✅' : '⏸️'} {status?.replace('-', ' ')}
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

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {['overview', 'exercises', 'details'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              activeTab === tab && styles.activeTab
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[
              styles.tabText,
              activeTab === tab && styles.activeTabText
            ]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      {renderTabContent()}
    </View>
  )
}
