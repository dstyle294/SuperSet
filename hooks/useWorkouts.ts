import { useAuthStore } from '../store/authStore'
import { useState, useEffect } from 'react'

type WorkoutOption = {
  title: string, // can be title
  date: string, // can be date and muscle groups
  muscles: string,
  id: string,
}

type muscleType = {
  muscle: string
}

type WorkoutFromAPI = {
  _id: string,
  title: string,
  start_time: string,
  muscle_groups: muscleType[],
}



export const useWorkouts = () => {
  const [workouts, setWorkouts] = useState<WorkoutOption[]>([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const {token} = useAuthStore()

  useEffect(() => {
    loadWorkouts(1, true)
  }, [])

  const loadWorkouts = async (pageNum: number = 1, reset: boolean = true) => {
    if (loading) return

    setLoading(true)

    

    try {
      const url = 'https://supersetbackend.onrender.com/api/workouts?page=' + pageNum + '&limit=20'
      const response = await fetch(url, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
      })

      const data = await response.json()
      console.log(data)

      const workouts: WorkoutFromAPI[] = data.workouts


      const muscle_groups = await data.workouts['muscle_groups']


      let muscle_string = ""

      workouts.forEach(workout => {
        workout.muscle_groups.forEach((muscleObject: muscleType) => {
          muscle_string = muscle_string.concat(muscleObject['muscle'])
          muscle_string = muscle_string.concat(", ")
        })
      })

      muscle_string = muscle_string.slice(0, muscle_string.length - 2)

      const condensedWorkouts = workouts.map(workout => ({
        id: workout._id,
        title: workout.title,
        date: workout.start_time,
        muscles: muscle_string
      }))

      console.log(condensedWorkouts)


      if (reset) {
        setWorkouts(condensedWorkouts)
      } else {
        setWorkouts(prev => [...prev, ...condensedWorkouts])
      }

      setHasMore(data.hasMore)
      setPage(pageNum)

    } catch (error) {
      console.log(`Error loading workouts ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const loadMore = () => {
    if (hasMore && !loading) {
      loadWorkouts(page + 1)
    }
  }

  

  return {
    workouts,
    loading,
    hasMore,
    loadMore,
    refresh: () => loadWorkouts(1, true),
  }
}

