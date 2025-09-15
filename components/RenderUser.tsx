import styles from "@/assets/styles/home.styles"
import { API_URL } from "@/constants/api"
import { useAuthStore } from "@/store/authStore"
import { useEffect, useState } from "react"
import { Image, View, Text } from "react-native"

interface mediaObj {
  type: string,
  url: string,
  thumbnail_url: string,
  _id: string,
}

interface postObj {
  post: {
    _id: string,
    user: string,
    caption: string,
    created_at: string,
    likes_count: number,
    shares_count: number,
    comments: string[],
    comments_count: number,
    media: mediaObj[],
    likes: string[],
    shares: string[], 
    workout: string,
  }
}

interface postOfArray {
  post: {
    item: postObj
  }
}

interface userObj {
  username: string,
  profileImage: string,
}





export const RenderUser = (post: postObj) => {
  const [ user, setUser ] = useState<userObj|null>(null)
  const { token } = useAuthStore()

  useEffect(() => {
    const response = fetch(`${API_URL}/users/${post.post.user}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).then(async (res) => {
      const data = await res.json()

      if (!res.ok) throw new Error(data.message || "Failed to fetch user");

      setUser(data.user)
    })
    .catch((err) => console.error("Error fetching user", err))

    
  }, [])
  

  return (
    <View style={styles.userInfo}>
      <Image source={{ uri: user?.profileImage }} style={styles.avatar} />
      <Text style={styles.username}>{user?.username}</Text>
    </View>
  )
}