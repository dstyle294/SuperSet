import { View, Text, TouchableOpacity, FlatList, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import styles from '@/assets/styles/home.styles'
import { API_URL } from '@/constants/api'
import { RenderUser } from '@/components/RenderUser'

interface mediaObj {
  type: string,
  url: string,
  thumbnail_url: string,
  _id: string,
}

interface postObj {
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

interface postOfArray {
  post: {
    item: postObj
  }
}


export default function Home() {
  
  const [ posts, setPosts ] = useState<postObj[]>([])
  const [ loading, setLoading ] = useState(true)
  const [ refreshing, setRefreshing ] = useState(false)
  const [ page, setPage ] = useState(1)
  const [ hasMore, setHasMore ] = useState(true) 

  const { token } = useAuthStore()

  const fetchPosts = async (pageNum = 1, refreshing = false) => {
    try {
      if ( refreshing ) setRefreshing(true);
      else if ( pageNum === 1 ) setLoading(true);

      const response = await fetch(`${API_URL}/posts?page=${pageNum}&limit=20`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.message || "Failed to fetch posts");

      setPosts((prevPosts) => [...prevPosts, ...data.posts])

      setHasMore(data.hasMore)
      setPage(pageNum)

    } catch (error) {
      console.log("Error fetching posts", error)
    } finally {
      if (refreshing) {
        setRefreshing(false)
      } else {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  const handleLoadMore = async () => {

  }

  const renderItem = ({ item }: {item: postObj}) => ( // flatlist expects function that receives object with item in that object
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <RenderUser post={item} />
      </View>
   
      {item.media.length > 0 && item.media[0].type === 'image' ? (
      <View style={styles.postImageContainer}>
        <Image source={{uri: item.media[0].url}} style={styles.postImage}/>
      </View>
      ) : <Text>skip</Text>}

      <View style={styles.postDetails}>
        <Text style={styles.postTitle}>{item.caption}</Text>
        
      </View>

    </View>
  )


  return (
    <View style={styles.container}>
      <FlatList 
        data={posts} 
        renderItem={renderItem}
        keyExtractor={(item: postObj) => item._id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  )
}