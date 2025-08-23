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
  startWorkoutContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  startWorkoutTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  activeWorkoutContainer: {
  
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleContainer: {
    flex: 1,
  },
  activeWorkoutTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textDark,
  },
  titleInput: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textDark,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.textSecondary,
  },
  photoButton: {
    backgroundColor: COLORS.white,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoButtonText: {
    fontSize: 18,
  },
  timerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  timerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
  },
  exercisesList: {
    marginBottom: 20,
  },
  exerciseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    marginBottom: 8,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textDark,
  },
  exerciseDetails: {
    fontSize: 14,
    color: COLORS.placeholderText,
  },
  addExerciseButton: {
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.blue,
    borderStyle: 'dashed',
  },
  addExerciseText: {
    color: COLORS.blue,
    fontSize: 16,
    fontWeight: '500',
  },
  workoutControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  pauseButton: {
    flex: 1,
    backgroundColor: COLORS.orange,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  controlButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '500',
  },
  endButton: {
    flex: 1,
    backgroundColor: COLORS.green,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  }
})

export default styles