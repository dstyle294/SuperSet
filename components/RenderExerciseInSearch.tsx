import { exerciseFromSearchObj } from "@/app/types/workout.types"
import styles from "@/assets/styles/workoutPage.styles"
import { Ionicons } from "@expo/vector-icons"
import { Text, View } from "react-native"

interface RenderExerciseInSearchProps {
  exercise: exerciseFromSearchObj,
  isSelected: boolean,
}

const capitalizeFirstLetter = (exerciseName: string) => {
  return exerciseName.charAt(0).toUpperCase() + exerciseName.slice(1)
}

const showInformation = () => {
  
}

export const RenderExerciseInSearch: React.FC<RenderExerciseInSearchProps> = ( { exercise, isSelected } ) => {
  return (
    <View style={[styles.exerciseCard, isSelected && styles.selectedExerciseCard]}>
      <View style={{ flexDirection: "row", justifyContent: 'space-between' }}>
        <Text style={styles.exerciseName} numberOfLines={1} ellipsizeMode="tail" >{capitalizeFirstLetter(exercise.name)}</Text>
        <Ionicons
          name="information"
          size={22}
          color="gray"
          onPress={() => showInformation}
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