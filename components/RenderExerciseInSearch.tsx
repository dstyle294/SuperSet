import { exerciseFromSearchObj } from "@/app/types/workout.types"
import styles from "@/assets/styles/workoutPage.styles"
import { Text, View } from "react-native"

interface RenderExerciseInSearchProps {
  exercise: exerciseFromSearchObj,
}

const capitalizeFirstLetter = (exerciseName: string) => {
  return exerciseName.charAt(0).toUpperCase() + exerciseName.slice(1)
}

export const RenderExerciseInSearch: React.FC<RenderExerciseInSearchProps> = ( { exercise } ) => {
  return (
    <View style={styles.exerciseCard}>
      <Text style={styles.exerciseName}>{capitalizeFirstLetter(exercise.name)}</Text>
    </View>
  )
}