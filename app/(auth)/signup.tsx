import { View, Text, KeyboardAvoidingView, Platform } from 'react-native'
import React from 'react'
import styles from '../../assets/styles/signup.styles'

export default function signup() {
  return (
    <KeyboardAvoidingView
      style={{flex:1}}
      behavior={Platform.OS === 'ios' ? "padding" : "height"}
    >
      <View style={styles.container}>
        <View style={styles.card}>
          {/* HEADER */}
          
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}