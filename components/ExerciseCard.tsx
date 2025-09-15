import { exerciseObj } from "@/app/types/workout.types";
import styles from "@/assets/styles/workout.styles";
import COLORS from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";


interface ExerciseCardProps {
  exercise: exerciseObj,
  index: number,
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ( { exercise, index } ) => {
  const [expanded, setExpanded] = useState(false)

  return (
    <View style={styles.exerciseCard}>
      <View style={styles.exerciseHeader}>
        <Text style={styles.exerciseName}>{exercise.name}</Text>
        <Text style={styles.exerciseNumber}>#{index + 1}</Text>
      </View>
      <View style={styles.exerciseDetails}>
        <TouchableOpacity
          onPress={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <View style={styles.toggleView}>
              <Ionicons name={"caret-down-outline"} size={20} color={COLORS.black} />
              <Text style={styles.toggleText}>
                Hide sets
              </Text>
            </View>
          ): (
            <View style={styles.toggleView}>
              <Ionicons name={"caret-forward-outline"} size={20} color={COLORS.black} />
              <Text style={styles.toggleText}>
                Show all {exercise.sets.length} sets
              </Text>
            </View>
          )}
        </TouchableOpacity>
        {expanded ? (
          <FlatList
            data={exercise.sets}
            keyExtractor={(set) => set._id}
            renderItem={({ item, index }) => (
              <View
                key={item._id}
                style={[
                  styles.setItem,
                  item.completed ? styles.completedSet : styles.pendingSet,
                ]}
              >
                  <Text style={styles.setNumber}>Set {index + 1}</Text>
                  <Text style={styles.setDetails}>
                    {item.weight} kg × {item.reps}
                  </Text>
                  <Text style={styles.volumeText}>
                    Volume: {item.weight * item.reps} kg
                  </Text>
              </View>
            )}
          />
            ) : (
          <>
          </>
        )}
      </View>
      
    </View>
  )
}