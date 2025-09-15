import {create} from "zustand"
import AsyncStorage from "@react-native-async-storage/async-storage"
import {API_URL} from '../constants/api'

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isLoading: false,
  isInitialized: false,

  initializeAuth: async () => {
    try {
      set({ isLoading: true });
      const token = await AsyncStorage.getItem('token');
      if (token) {
        // Validate token and get user data
        const userData = await AsyncStorage.getItem('user');
        const user = userData ? JSON.parse(userData) : null;

        set({ user, token, isLoading: false, isInitialized: true });
      } else {
        set({ user: null, token: null, isLoading: false, isInitialized: true });
      }
    } catch (error) {
      set({ user: null, token: null, isLoading: false, isInitialized: true });
    }
  },
  
  register: async (name, username, email, password) => {

    set({ isLoading: true })
    try {

      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          username,
          email, 
          password
        }),
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.message || "Something went wrong")

      await AsyncStorage.setItem("user", JSON.stringify(data.user))
      await AsyncStorage.setItem("token", data.token)

      set({token: data.token, user: data.user})

      return { success: true }

    } catch (error) {
      return { success: false, error: error.message }
    } finally {
      set({ isLoading: false })
    }
  },

  login: async (email, password) => {
    set({ isLoading: true })
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.message || "Something went wrong")

      await AsyncStorage.setItem("user", JSON.stringify(data.user))
      await AsyncStorage.setItem("token", data.token)

      set({ token: data.token, user: data.user, isLoading: false })

      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    } finally {
      set({ isLoading: false })
    }
  },

  checkAuth: async () => {
    set({ isLoading: true })
    try {

      const token = await AsyncStorage.getItem("token") || null
      const userJson = await AsyncStorage.getItem("user") 
      const user = userJson ? JSON.parse(userJson) : null

      set({ token, user, isLoading: false, isInitialized: true  })
    } catch (error) {
      console.log("Auth check failed", error)
      set({ token: null, user: null, isLoading: false, isInitialized: true })
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem("token")
    await AsyncStorage.removeItem("user")
    set({ token: null, user: null })
  }
}))