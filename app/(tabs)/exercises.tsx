import { ActivityIndicator, Alert, FlatList, Image, Modal, RefreshControl, Text, TextInput, TouchableOpacity, View } from "react-native"
import { SafeAreaProvider } from "react-native-safe-area-context"
import SafeScreen from "@/components/SafeScreen"
import styles from "@/assets/styles/workoutPage.styles"
import homeStyles from '@/assets/styles/home.styles'
import workoutStyles from '@/assets/styles/workout.styles'
import { useCallback, useEffect, useRef, useState } from "react"
import { exerciseFromSearchObj, exerciseObj } from "@/app/types/workout.types"
import COLORS from "@/constants/colors"
import { API_URL } from "@/constants/api"
import { Ionicons } from "@expo/vector-icons"
import { RenderExerciseInSearch } from "@/components/RenderExerciseInSearch"
import { useAuthStore } from "@/store/authStore"
import { ExerciseInstructions } from "@/components/ExerciseInstructions"
import { DetailRow } from "@/components/DetailRow"


export default function Exercises() {
  const { token } = useAuthStore()
  
  const [ searchQuery, setSearchQuery ] = useState("")
  const [ searchResults, setSearchResults ] = useState<exerciseFromSearchObj[]>([])
  const [ isSearching, setIsSearching ] = useState(false)
  const [ searchPage, setSearchPage ] = useState(1)
  const [ searchRefreshing, setSearchRefreshing ] = useState(false)
  const [ searchHasMore, setSearchHasMore ] = useState(false)
  const [ searchLoading, setSearchLoading ] = useState(true)
  const [ selectedExerciseId, setSelectedExerciseId ] = useState("")
  const [ newExerciseName, setNewExerciseName ] = useState("")
  const [ informationId, setInformationId ] = useState("")
  const [ informationExercise, setInformationExercise ] = useState<exerciseFromSearchObj>()
  const [ gifLoading, setGifLoading ] = useState(false)
  const [ refreshing, setRefreshing ] = useState(false)

  

  useEffect(() => {
    const fetchExercise = async () => {
      if (informationId) {
        const exercise = await getImageSource(informationId)
        setInformationExercise(exercise.data)
      }
    }

    fetchExercise()
  }, [informationId])
  
  const getAllExercises = async () => {
    try {
      const response = await fetch(`${API_URL}/exercises`, {
        method: 'GET'
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.message || "Something went wrong")
      console.log(data)
      return data.exercises
    } catch (error) {
      console.log(`Error fetching exercises ${error}`)
      Alert.alert("Error", `Couldn't fetch exercises ${error}`)
    }
  }

  const allExercises = getAllExercises()

  const timeoutRef = useRef<number | null>(null)

  const arrayToString = (array: string[]) => {
    let string = ""
    array.forEach(element => {
      string += ", "
      string += capitalizeFirstLetter(element)
    })

    string = string.slice(2, string.length)

    return string
  }

  const capitalizeFirstLetter = (exerciseName: string) => {
    return exerciseName.charAt(0).toUpperCase() + exerciseName.slice(1)
  }

  const searchWithDebounce = useCallback((query: string) => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      console.log(`Searching for ${query}`)

      searchExercises(searchPage, query, searchRefreshing)
    }, 500)
  }, [])

  const getImageSource = async (id: string) => {
    try { 
      const response = await fetch(`${API_URL}/exercises/id/${id}`, {
        method: 'GET',
      })

      const data = await response.json()


      if (!response.ok) throw new Error(data.message || "Something went wrong")

      return data.exercise
    } catch (error) {
      console.log("Error fetching exercise", error)
      return null
    }
  }

  const searchExercises = async (pageNum = 1, query: string, searchRefreshing = false) => {
    if (!query.trim()) {
      setSearchResults([])
      setIsSearching(false)
      setSearchPage(1)
      setSearchHasMore(false)
      setSearchLoading(false)
      return ;
    }

    setIsSearching(true)
    setSearchLoading(true)

    try {
      const response = await fetch(`${API_URL}/exercises/name/${query}?page=${pageNum}`, {
          method: 'GET',
        }
      )

      const data = await response.json()

      if (!response.ok) throw new Error(data.message || "Something went wrong!")


      const uniqueExercises = 
        searchRefreshing || pageNum === 1 
          ? data.exercises.data
          : Array.from(new Set([...searchResults, ...data.exercises.data].map((exercise) => exercise.exerciseId))).map((id) => 
            [...searchResults, ...data.exercises.data].find((exercise) => exercise.exerciseId === id)
          )
        
      setSearchResults(uniqueExercises)

      setSearchHasMore(data.exercises.pageNum < data.exercises.totalPages)
      setSearchPage(data.exercises.pageNum)

        
    } catch (error) {
      console.error(`Error fetching exercises: ${error}`)
    } finally {
      setIsSearching(false)
      setSearchLoading(false)
    }
  }

  // const addNewExercise = async () => {
  //   if (newExerciseName.trim()) {
  //     const newExercise = {
  //       exerciseId: "0001",
  //       sets: [],
  //       name: newExerciseName,
  //       order: exercises.length + 1,
  //       updated_at: new Date(),
  //       notes: "",
  //       _id: "",
  //     }
  //     setExercises([...exercises, newExercise])
  //     setNewExerciseName('')
  //     setShowAddExercise(false)
  //   }
  // }

  

  const handleSearchInput = (text: string) => {
    setSearchQuery(text)
    searchWithDebounce(text)
  }

  const handleLoadMoreExercisesInSearch = async () => {
    if (searchHasMore && !searchLoading && !searchRefreshing) {
      console.log('here')
      await searchExercises(searchPage + 1, searchQuery, searchRefreshing)
    }
  }

  const renderExerciseInSearch = ({ item } : { item: exerciseFromSearchObj }) => {
    const thisIsSelected = item.exerciseId === selectedExerciseId 

    return (
      <TouchableOpacity
        onPress={() => {
          if (selectedExerciseId === item.exerciseId) {
            setSelectedExerciseId("")
          } else {
            setSelectedExerciseId(item.exerciseId)
          }
        }}
      >
        <RenderExerciseInSearch exercise={item} isSelected={thisIsSelected} setInformationId={setInformationId} />
      </TouchableOpacity>
    )
  }

  return (
    /* Add Exercise Modal */
    
    <SafeAreaProvider>
      <SafeScreen>
        <View style={styles.modalContent}>
          <View style={styles.modalInputBox}>
            <TextInput  
              style={styles.modalInput}
              placeholder="Search exercises (e.g. push up)"
              value={searchQuery}
              onChangeText={handleSearchInput}
              autoFocus
            />
          </View>
          {searchQuery.length > 0 ? (
            <FlatList 
              data={searchResults}
              renderItem={renderExerciseInSearch}
              keyExtractor={(item: exerciseFromSearchObj) => item.exerciseId}
              contentContainerStyle={homeStyles.listContainer}
              showsVerticalScrollIndicator={true}
              onEndReached={handleLoadMoreExercisesInSearch}
              onEndReachedThreshold={0.1}
              ListEmptyComponent={() => {
                if (searchLoading) {
                  return (
                    <View style={homeStyles.emptyContainer}>
                      <ActivityIndicator style={homeStyles.footerLoader} size="large" color={COLORS.primary} />
                      <Text style={homeStyles.emptyText}>Searching exercises...</Text>
                    </View>
                  )
                } 
              }}
              ListFooterComponent={
                searchHasMore && searchResults.length > 0 ? (
                  <ActivityIndicator style={homeStyles.footerLoader} size="small" color={COLORS.primary} />
                ) : null
              }
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={() => searchExercises(1, searchQuery)}
                  colors={[COLORS.primary]}
                  tintColor={COLORS.primary}
                />
              }
            />
          ) : (
            <FlatList 
              data={searchResults}
              renderItem={renderExerciseInSearch}
              keyExtractor={(item: exerciseFromSearchObj) => item.exerciseId}
              contentContainerStyle={homeStyles.listContainer}
              showsVerticalScrollIndicator={true}
              onEndReached={handleLoadMoreExercisesInSearch}
              onEndReachedThreshold={0.1}
              ListEmptyComponent={() => {
                if (searchLoading) {
                  return (
                    <View style={homeStyles.emptyContainer}>
                      <ActivityIndicator style={homeStyles.footerLoader} size="large" color={COLORS.primary} />
                      <Text style={homeStyles.emptyText}>Searching exercises...</Text>
                    </View>
                  )
                } 
              }}
              ListFooterComponent={
                searchHasMore && searchResults.length > 0 ? (
                  <ActivityIndicator style={homeStyles.footerLoader} size="small" color={COLORS.primary} />
                ) : null
              }
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={() => searchExercises(1, searchQuery)}
                  colors={[COLORS.primary]}
                  tintColor={COLORS.primary}
                />
              }
            />
          )}
          </View>

        <Modal
          visible={informationId !== ""}
          animationType="slide" 
          transparent={true} 
        >
          <View style={styles.informationModalOverlay}>
            <View style={styles.informationModalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity
                  onPress={() => {
                    setInformationId("")
                    setInformationExercise(null)
                  }}
                  style={[styles.headerButton, { borderColor: COLORS.gray }]}
                >
                  <Ionicons name="arrow-back" size={24} color={COLORS.gray} />
                </TouchableOpacity>
              </View>
              {informationExercise && (
                <View>
                  <View style={styles.gif}> 
                    {gifLoading ? (
                      <ActivityIndicator size="large" color={COLORS.primary} style={{ justifyContent: 'center' }} />
                    ) : null} 
                    <Image
                      source={{ uri: informationExercise.gifUrl }}
                      style={{ width: 200, height: 200, resizeMode: 'contain', justifyContent: 'center' }}
                      onLoadStart={() => setGifLoading(true)}
                      onLoad={() => setGifLoading(false)}
                      onError={() => setGifLoading(false)}
                    />
                  </View>
                  <View style={workoutStyles.tabContent}>
                    <View style={styles.titleContainer}>
                      <Text style={styles.informationHeading}>{capitalizeFirstLetter(informationExercise.name)}</Text>
                    </View>
                    <ExerciseInstructions instructions={informationExercise.instructions} />
                    <DetailRow
                      label="Body Parts"
                      value={arrayToString(informationExercise.bodyParts)}
                    />
                    <DetailRow
                      label="Target Muscles"
                      value={arrayToString(informationExercise.targetMuscles)}
                    />
                    <DetailRow
                      label="Secondary Muscles"
                      value={arrayToString(informationExercise.secondaryMuscles)}
                    />
                  </View>
                </View>
              )}
              
            </View>
          </View>
        </Modal>
      </SafeScreen>
    </SafeAreaProvider>

  )
}