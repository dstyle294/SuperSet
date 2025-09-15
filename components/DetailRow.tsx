import styles from "@/assets/styles/workout.styles"
import { Text, View } from "react-native"

interface DetailRowProps {
  label: string,
  value: string | undefined, 
}

export const DetailRow: React.FC<DetailRowProps> = ({ label, value }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue} >{value}</Text>
  </View>
)