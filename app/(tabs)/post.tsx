import { View, Text, KeyboardAvoidingView, Platform, ScrollView, TextInput, TouchableOpacity, Image, PlatformColor, Alert, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import styles from '../../assets/styles/post.styles'
import { Ionicons } from '@expo/vector-icons'
import COLORS from '../../constants/colors'
import * as ImagePicker from 'expo-image-picker'
import * as FileSystem from 'expo-file-system'
import { WorkoutDropdown } from '@/components/workoutDropdown'

export default function Post() {
  const [caption, setCaption] = useState("")
  const [image, setImage] = useState<string | null>(null) // to display the image/video 
  const [imageBase64, setImageBase64] = useState<string | null>(null)
  // current functionality will only allow one image upload


  
  const pickImage = async () => {
    try {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync()
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
        console.log(result)
        setImage(result.assets[0].uri)

        // if base64 is provided, use it

        if (result.assets[0].base64) {
          setImageBase64(result.assets[0].base64)
        } else {
          // convert to base64
          const base64 = await FileSystem.readAsStringAsync(result.assets[0].uri,
            {
              encoding: FileSystem.EncodingType.Base64,
            }
          )
          setImageBase64(base64)
        }
      }
    } catch (error) {
      console.log("Error picking image: ", error)
      Alert.alert("Error", "There was a problem selecting your image")
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
            <WorkoutDropdown />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}