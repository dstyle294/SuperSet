import styles from "@/assets/styles/workout.styles"
import { Text, View } from "react-native"

interface StatCardProps {
  value: string | number,
  label: string,
}

export const StatCard: React.FC<StatCardProps> = ({ value, label }) => {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  )
}