import { exerciseObj } from "@/app/types/workout.types";
import styles from "@/assets/styles/workout.styles";
import { Text, View } from "react-native";


interface ExerciseCardProps {
  exercise: exerciseObj,
  index: number,
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ( { exercise, index } ) => (
  <View style={styles.exerciseCard}>
    <View style={styles.exerciseHeader}>
      <Text style={styles.exerciseName}>{exercise.name}</Text>
      <Text style={styles.exerciseNumber}>#{index + 1}</Text>
    </View>
  </View>
)