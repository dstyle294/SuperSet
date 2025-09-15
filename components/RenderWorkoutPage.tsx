import { exerciseObj, workoutObj } from "@/app/types/workout.types"
import workoutStyles from "@/assets/styles/workout.styles"
import styles from '@/assets/styles/workoutPage.styles'
import { API_URL } from "@/constants/api"
import { formatTime } from "@/lib/utils"
import { useAuthStore } from "@/store/authStore"
import { useState } from "react"
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native"
import { RenderActiveWorkoutTab } from "./RenderActiveWorkoutTab"
import { RenderPastWorkouts } from "./RenderPastWorkouts"

// interface RenderWorkoutPageProps = {

// }
// :React.FC<RenderWorkoutPageProps>
export const RenderWorkoutPage = () => {
  
  const [ activeTab, setActiveTab ] = useState('workout')
  const [ workoutId, setWorkoutId ] = useState("")
  const [ isWorkoutActive, setIsWorkoutActive ] = useState(false) 
  const [ paused, setPaused ] = useState(false)
  const [ refreshing, setRefreshing ] = useState(false)
  const [ shouldResume, setShouldResume ] = useState(false)
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'workout': 
        return (
          <RenderActiveWorkoutTab workoutId={workoutId} setWorkoutId={setWorkoutId} isWorkoutActive={isWorkoutActive} setIsWorkoutActive={setIsWorkoutActive} paused={paused} setPaused={setPaused} refreshing={refreshing} setRefreshing={setRefreshing} shouldResume={shouldResume} setShouldResume={setShouldResume} />
        )
      case 'history':
        return (
          <RenderPastWorkouts workoutId={workoutId} setWorkoutId={setWorkoutId} isWorkoutActive={isWorkoutActive} setIsWorkoutActive={setIsWorkoutActive} paused={paused} setPaused={setPaused} refreshing={refreshing} setRefreshing={setRefreshing} activeTab={activeTab} setActiveTab={setActiveTab} shouldResume={shouldResume} setShouldResume={setShouldResume}  />
        )

    }
  }

  return (
    <View style={styles.container}>
      <View style={workoutStyles.tabContainer}>
        {['workout', 'history'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              workoutStyles.tab,
              activeTab === tab && workoutStyles.activeTab
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[
              workoutStyles.tabText,
              activeTab === tab && workoutStyles.activeTabText
            ]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {renderTabContent()}
    </View>
  )
}