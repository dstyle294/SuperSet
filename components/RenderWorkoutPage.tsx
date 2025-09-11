import { exerciseObj, workoutObj } from "@/app/types/workout.types"
import workoutStyles from "@/assets/styles/workout.styles"
import styles from '@/assets/styles/workoutPage.styles'
import { API_URL } from "@/constants/api"
import { formatTime } from "@/lib/utils"
import { useAuthStore } from "@/store/authStore"
import { useState } from "react"
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native"
import { RenderActiveWorkoutTab } from "./RenderActiveWorkoutTab"

// interface RenderWorkoutPageProps = {

// }
// :React.FC<RenderWorkoutPageProps>
export const RenderWorkoutPage = () => {
  

  const [ activeTab, setActiveTab ] = useState('workout')
  

  const renderTabContent = () => {
    switch (activeTab) {
      case 'workout': 
        return (
          <View style={[workoutStyles.tabContent, { flexDirection: 'column' }]}>
            <RenderActiveWorkoutTab />
          </View>
        )
      case 'history':
        return (
          <View style={workoutStyles.tabContent}>
            
          </View>
        )

    }
  }

  return (
    <View>
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