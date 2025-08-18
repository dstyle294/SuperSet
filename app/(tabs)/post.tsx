import { View, Text, KeyboardAvoidingView, Platform, ScrollView, TextInput, TouchableOpacity, Image, PlatformColor, Alert, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import styles from '../../assets/styles/post.styles'
import { Ionicons } from '@expo/vector-icons'
import COLORS from '../../constants/colors'
import * as ImagePicker from 'expo-image-picker'
import * as FileSystem from 'expo-file-system'
import { WorkoutDropdown } from '@/components/workoutDropdown'
import { useAuthStore } from '@/store/authStore'
import { API_URL } from '@/constants/api'
import { router } from 'expo-router'

export default function Post() {
  const [caption, setCaption] = useState("")
  const [image, setImage] = useState<string | null>(null) // to display the image/video 
  const [imageBase64, setImageBase64] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [ selectedWorkout, setSelectedWorkout ] = useState("")
  const {token} = useAuthStore()

  // current functionality will only allow one image upload


  
  const pickImage = async () => {
    try {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
        if (status !== 'granted') {
          Alert.alert("Permission denied", "We need camera roll permissions to upload an image")
          return
        }
      }

      // launch image library
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images", "videos"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5, 
        base64: true,
      })

      if (!result.canceled) {
        setImage(result.assets[0].uri)

        // if base64 is provided, use it
        // convert to base64
        if (result.assets[0].base64) {
          setImageBase64(result.assets[0].base64)
        }
      }
    } catch (error) {
      console.log("Error picking image: ", error)
      Alert.alert("Error", "There was a problem selecting your image")
    }
  }

  const uploadImage = async (imageUrl: string) => {
    const formData = new FormData()
    formData.append('file', imageUrl)
    formData.append('upload_preset', 'mobile-app-uploads')

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/dkxvq9kuy/image/upload`, 
      {
        method: 'POST',
        body: formData,
      }
    )

    const data = await response.json()
    return data.secure_url
  }

  const handleSubmit = async () => {
    
    if (!caption) {
      Alert.alert("Error", "Please fill in caption")
      return;
    }

    if (!selectedWorkout) {
      Alert.alert("Error", "Please fill in workout")
      return;
    }
    try {
      setLoading(true)

      
      let payload: Record<string, any> = { caption: caption, workout: selectedWorkout };
      // console.log(payload)
      

      if (image) {
        const uriParts = image.split(".")
        const fileType = uriParts[uriParts.length - 1]
        const imageType = fileType ? `image/${fileType.toLowerCase()}` : "image/jpeg"

        const imageDataUrl = `data:${imageType};base64,${imageBase64}`

        const imageUrl = await uploadImage(imageDataUrl)

        payload.media =  [{
          type: 'image',
          url: imageUrl,
        }] 
      } 
      // console.log(payload)
      
      const response = await fetch(`${API_URL}/posts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.message || "Something went wrong")
      
      Alert.alert("Success", "Your post has been posted!")

      setCaption("")
      setImage(null)
      setImageBase64(null)
      setSelectedWorkout("")
      router.push("/")
      
    } catch (error) {
      console.error("Error creating post:", error)
      if (error instanceof Error) {
        Alert.alert("Error", error.message)
      } else {
        Alert.alert("Error", "Something went wrong")
      }
    } finally {
      setLoading(false)
    }
  }
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.container} style={styles.scrollViewStyle}>
        <View style={styles.card}>  
          {/* HEADER */}
          <Text style={styles.title}>Post about your workout!</Text>
          <Text style={styles.subtitle}>Work it out with your friends.</Text>
        </View>

        <View style={styles.form}>
          {/* POST CAPTION */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Caption ✍️</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="text-outline"
                size={20}
                color={COLORS.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput 
                style={styles.input}
                placeholder="Speak your mind"
                placeholderTextColor={COLORS.placeholderText}
                value={caption}
                onChangeText={setCaption}
                multiline
              />
            </View>
          </View>

          {/* IMAGE */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Post media 📸</Text>
            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
              { image ? (
                <Image source={{ uri: image }} style={styles.previewImage} />
              ) : (
                <View style={styles.placeholderContainer}>
                  <Ionicons name="image-outline" size={40} color={COLORS.textSecondary} />
                  <Text style={styles.placeholderText}>Tap to select image</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* WORKOUT */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Choose workout 🏋️ </Text>
            <WorkoutDropdown 
              selectedWorkout={selectedWorkout}
              onWorkoutChange={setSelectedWorkout}
            />
          </View>

          {/* POST */}
          <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <>
                <Ionicons 
                  name="cloud-upload-outline"
                  size={20}
                  color={COLORS.white}
                  style={styles.buttonIcon}
                />
                <Text style={styles.buttonText}>Post</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}