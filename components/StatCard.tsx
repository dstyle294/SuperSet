import styles from "@/assets/styles/workout.styles"
import { Text, View } from "react-native"

interface RenderWorkoutProps {
  value: string | number,
  label: string,
}

export const StatCard: React.FC<RenderWorkoutProps> = ({ value, label }) => {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  )
}