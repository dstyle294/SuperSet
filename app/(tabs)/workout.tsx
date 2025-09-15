import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl, Touchable, TextInput, Modal, Alert, SafeAreaView, Image, ScrollView } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import styles from '@/assets/styles/workoutPage.styles'
import { API_URL } from '@/constants/api'
import { useAuthStore } from '@/store/authStore'
import { exerciseFromSearchObj, exerciseObj, workoutObj, workoutSet } from '../../assets/types/workout.types'
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
import { DetailRow } from '@/components/DetailRow'
import { ExerciseInstructions } from '@/components/ExerciseInstructions'
import { RenderWorkoutPage } from '@/components/RenderWorkoutPage'

export default function Workout() {
  return (
    <View style={styles.container}>
      <RenderWorkoutPage />
    </View>
  )
}