import styles from "@/assets/styles/workout.styles"
import COLORS from "@/constants/colors"
import { Ionicons } from "@expo/vector-icons"
import { useState } from "react"
import { FlatList, Text, TouchableOpacity, View } from "react-native"
import { DetailRow } from "./DetailRow"

interface ExerciseInstructionsProps {
  instructions: string[], 
}

export const ExerciseInstructions: React.FC<ExerciseInstructionsProps> = ({ instructions }) => {
  const [ isExpanded, setIsExpanded ] = useState(false)
  return (
    <View>  
      <TouchableOpacity
        onPress={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? (
          <View style={styles.toggleView}>
            <Ionicons name={"caret-down-outline"} size={20} color={COLORS.black} />
            <Text style={styles.toggleText}>
              Exercise instructions
            </Text>
          </View>
        ): (
          <View style={styles.toggleView}>
            <Ionicons name={"caret-forward-outline"} size={20} color={COLORS.black} />
            <Text style={styles.toggleText}>
              Exercise instructions
            </Text>
          </View>
        )}

        {isExpanded && (
          // <FlatList
          //   data={instructions}
          //   keyExtractor={(item, index) => index.toString()}
          //   renderItem={({ item, index }) => (
          //     <View
          //       key={index.toString()}
          //       style={[styles.setItem, {
          //         borderWidth: 0,
          //         backgroundColor: COLORS.lighterGrey,
          //         margin: 4,
          //         flex: 1,
          //         padding: 5,
          //       }]}
          //     >
          //       <View style={[styles.circle, {padding: 5}]}>
          //         <Text style={[styles.boldText]}>{index + 1}</Text>
          //       </View>
          //       <Text style={{ flex: 1, marginLeft: 8 }}>{item.slice(7)}</Text>
          //     </View>
          //   )}
          // />

          instructions.map((item, index) => (
            <View
              key={index.toString()}
              style={[styles.setItem, {
                borderWidth: 0,
                backgroundColor: COLORS.lighterGrey,
                margin: 4,
                flex: 1,
                padding: 5,
              }]}
            >
              <View style={[styles.circle, {padding: 5}]}>
                <Text style={[styles.boldText]}>{index + 1}</Text>
              </View>
              <Text style={{ flex: 1, marginLeft: 8 }}>{item.slice(7)}</Text>
            </View>
          ))
        )}
      </TouchableOpacity>
    </View>
  )
}