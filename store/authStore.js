import {create} from "zustand"
import AsyncStorage from "@react-native-async-storage/async-storage"

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isLoading: false,
  
  register: async (name, username, email, password) => {

    set({ isLoading: true })
    try {
      const response = await fetch("http://localhost:3001/api/auth/register", {
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

      set({token: data.token, user: data.user, isLoading: false})

      return { success: true }

    } catch (error) {
      set({ isLoading: false })
      return { success: false, error: error.message }
    }
  }
}))