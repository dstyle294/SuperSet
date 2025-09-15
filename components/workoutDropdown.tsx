import { useWorkouts } from "../hooks/useWorkouts";
import styles from "../assets/styles/post.styles";
import { useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";

type WorkoutOption = {
  title: string, // can be title
  date: string, // can be date and muscle groups
  muscles: string,
  id: string,
}

const renderItem = (item: WorkoutOption) => {
  return (
    <View style={styles.itemContainer}>
      <Text style={styles.itemTitle}>{item.title}</Text>
      <Text style={styles.itemSubDetail}>{new Date(item.date).toLocaleDateString()}</Text>
      <Text style={styles.itemSubDetail}>{item.muscles}</Text>
    </View>
  )
}

const renderSelectedItem = (item: WorkoutOption) => {
  return (
    <View style={styles.itemContainer}>
      <Text style={styles.itemTitle}>item.title</Text>
      <Text style={styles.itemSubDetail}>item.date / item.muscles</Text>
    </View>
  )
}


export const WorkoutDropdown = () => {
  const { workouts, loading, loadMore } = useWorkouts()
  const [ selectedWorkout, setSelectedWorkout ] = useState()

  return (
    <Dropdown
      style={[styles.dropdown]}
      placeholderStyle={styles.placeholderText}
      search
      data={workouts}
      placeholder="Select a workout"
      labelField="title"
      valueField="id"
      value={selectedWorkout}
      renderItem={renderItem}
      // renderSelectedItem={renderSelectedItem}
      onChange={item => {
        setSelectedWorkout(item.id);
      }}
      maxHeight={200}        // Limit dropdown height to make it scrollable
      flatListProps={{       // Configure the internal FlatList
        nestedScrollEnabled: true,
        showsVerticalScrollIndicator: true,
        onEndReached: loadMore,
        onEndReachedThreshold: 0.1,
        ListFooterComponent: loading ? <ActivityIndicator /> : null,
      }}
      dropdownPosition="auto"
    />
  )
}
