import { View, Text, TouchableOpacity, FlatList, Image, ActivityIndicator, RefreshControl } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import styles from '@/assets/styles/home.styles'
import { API_URL } from '@/constants/api'
import { RenderUser } from '@/components/RenderUser'
import { formatPublishDate } from '../../lib/utils'
import COLORS from '@/constants/colors'
import { Ionicons } from '@expo/vector-icons'
import Loader from '../../components/loader'
import { RenderWorkout } from '@/components/RenderWorkout'

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
  createdAt: string,
}

interface postOfArray {
  post: {
    item: postObj
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

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

      const response = await fetch(`${API_URL}/posts?page=${pageNum}&limit=5`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const data = await response.json()


      if (!response.ok) throw new Error(data.message || "Failed to fetch posts");

      const uniquePosts = 
        refreshing || pageNum === 1 
          ? data.posts
          : Array.from(new Set([...posts, ...data.posts].map((post) => post._id))).map((id) => 
            [...posts, ...data.posts].find((post) => post._id === id)
          )
        
      setPosts(uniquePosts)

      setHasMore(pageNum < data.totalPages)
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
    if (hasMore && !loading && !refreshing) {
      await fetchPosts(page + 1)
    }
  }

  if (loading) return <Loader size="small" />

  const renderItem = ({ item }: {item: postObj}) => ( // flatlist expects function that receives object with item in that object
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <RenderUser post={item} />
      </View>
   
      {item.media.length > 0 && item.media[0].type === 'image' ? (
      <View style={styles.postImageContainer}>
        <Image source={{uri: item.media[0].url}} style={styles.postImage}/>
      </View>
      ) : <></>}

      <View style={styles.postDetails}>
        <Text style={styles.postTitle}>{item.caption}</Text>
          <Text style={styles.date}>Shared on {formatPublishDate(item.created_at)}</Text>
      </View>
      <RenderWorkout workoutId={item.workout} />
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
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>SuperSet 🚀</Text>
            <Text style={styles.headerSubtitle}>Scroll to see what the fitness world is up to... 👇</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="barbell-outline" size={60} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>No posts yet 😞</Text>
            <Text style={styles.emptySubtext}>Be the first to share a post!</Text>
          </View>
        }
        ListFooterComponent={
          hasMore && posts.length > 0 ? (
            <ActivityIndicator style={styles.footerLoader} size="small" color={COLORS.primary} />
          ) : null
        }
        refreshControl={
          <RefreshControl 
            refreshing={refreshing}
            onRefresh={() => fetchPosts(1, true)}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      />
    </View>
  )
}