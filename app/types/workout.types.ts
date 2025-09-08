export interface workoutSet {
  _id: string,
  weight: number,
  reps: number,
  rest_time: number,
  duration: number,
  completed: boolean,
}

export interface exerciseObj {
  api_exercise_id: string,
  name: string,
  order: Number,
  sets: workoutSet[],
  notes: string,
  added_at: Date,
  _id: string,
}

export interface exerciseFromSearchObj {
  bodyParts: string[],
  equipments: string[],
  exerciseId: string,
  instructions: string[],
  name: string,
  secondaryMuscles: string[],
  target: string,
  gifUrl: string,
  targetMuscles: string[],
}

export interface workoutObj {
  _id: string,
  is_public: boolean,
  allow_copying: boolean,
  copied_from: string,
  user: string,
  start_time: string,
  end_time: string,
  pause_start: string,
  pause_end: string,
  total_pause_time: number,
  updated_at: string,
  status: string,
  exercises: exerciseObj[],
  equipment_needed: equipmentObj[],
  muscle_groups: muscleObj[],
  secondary_muscle_groups: secondaryMuscleObj[],
  title: string,
  total_duration: number,
}

export interface equipmentObj {
  equipment: string,
}

export interface muscleObj {
  muscle: string,
}

export interface secondaryMuscleObj {
  secondary_muscle: string,
}