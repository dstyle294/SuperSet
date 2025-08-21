import COLORS from "@/constants/colors";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    backgroundColor: COLORS.background,
  },
  startButton: {
    backgroundColor: COLORS.primary,
    marginTop: 20,
    paddingHorizontal: 32,
    padding: 16,
    borderRadius: 12,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: "center",
  },
})

export default styles