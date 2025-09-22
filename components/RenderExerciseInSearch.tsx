import { exerciseFromSearchObj } from "@/assets/types/workout.types"
import styles from "@/assets/styles/workoutPage.styles"
import { Ionicons } from "@expo/vector-icons"
import { useState } from "react"
import { Text, View } from "react-native"

interface RenderExerciseInSearchProps {
  exercise: exerciseFromSearchObj,
  isSelected?: boolean,
  setInformationId: (exerciseId: string) => void,
}

const capitalizeWords = (exerciseName: string) => {
  const words = exerciseName.split(" ")

  let string = ""
  const commonWords = ["on", "of", "with", "and", "to"]
  
  words.forEach(word => {
    if (!commonWords.includes(word)) {
      string += word.charAt(0).toUpperCase() + word.slice(1)
    } else {
      string += word
    }
    string += " "
  })

  return string.slice(0, -1)
}


export const RenderExerciseInSearch: React.FC<RenderExerciseInSearchProps> = ( { exercise, isSelected, setInformationId } ) => {
  return (
    <View style={[styles.exerciseCard, isSelected && styles.selectedExerciseCard]}>
      <View style={{ flexDirection: "row", justifyContent: 'space-between' }}>
        <Text style={styles.exerciseName} numberOfLines={1} ellipsizeMode="tail" >{capitalizeWords(exercise.name)}</Text>
        <Ionicons
          name="information"
          size={22}
          color="gray"
          onPress={() => setInformationId(exercise.exerciseId)}
          style={{
            borderWidth: 2,
            borderColor: "gray",
          }}
        />
      </View>
      <Text style={styles.exerciseDetails}>Target: {exercise.targetMuscles[0]}</Text>
    </View>
  )
}