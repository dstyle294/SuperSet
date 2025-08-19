import styles from "@/assets/styles/workout.styles"
import { Background } from "@react-navigation/elements"
import { Text, View } from "react-native"

interface BadgeProps {
  text: string,
  type: string,
}

export const Badge: React.FC<BadgeProps> = ({ text, type = 'default'}) => {
  const getBadgeStyle = () => {
    switch (type) {
      case 'primary':
        return { backgroundColor: '#dbeafe', borderColor: '#bfdbfe' }
      case 'secondary':
        return { backgroundColor: '#f3f4f6', borderColor: '#e5e7eb' }
      case 'equipment':
        return { backgroundColor: '#fed7aa', borderColor: '$fdba74'}
      default: 
        return { backgroundColor: '#f3f4f6', borderCOlor: '#e5e7eb' }
    }
  }

  const getBadgeTextStyle = () => {
    switch (type) {
      case 'primary': 
        return { color: '#1e40af' }
      case 'secondary':
        return { color: '#6b7200' }
      case 'equipment':
        return { color: '#c2410c' }
      default:
        return { color: '#374151' }
    }
  }

  return (
    <View style={[styles.badge, getBadgeStyle()]}>
      <Text style={[styles.badgeText, getBadgeTextStyle()]}>{text}</Text>
    </View>
  )
}