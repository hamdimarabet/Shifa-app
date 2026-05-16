import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, TextInput, Modal, ActivityIndicator, Alert
} from 'react-native';
import { supabase } from '../../lib/supabase';

export default function CommunityScreen() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPostVisible, setNewPostVisible] = useState(false);
  const [postText, setPostText] = useState('');
  const [postCategory, setPostCategory] = useState('General');
  const [profile, setProfile] = useState(null);
  const [category, setCategory] = useState('All');

  const CATEGORIES = ['All', 'General', 'Weight Loss', 'Nutrition', 'Fitness', 'Motivation', 'Questions'];

  useEffect(() => {
    fetchProfile();
    fetchPosts();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data } = await supabase
      .from('user_profiles')
      .select('name')
      .eq('id', user.id)
      .single();
    setProfile(data);
  };

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('community_posts')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setPosts(data || []);
    setLoading(false);
  };

  const submitPost = async () => {
    if (!postText.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from('community_posts')
      .insert({
        user_id: user.id,
        author_name: profile?.name || 'Anonymous',
        content: postText.trim(),
        category: postCategory,
        likes: 0,
      });

    if (!error) {
      setPostText('');
      setNewPostVisible(false);
      fetchPosts();
    }
  };

  const likePost = async (post) => {
    await supabase
      .from('community_posts')
      .update({ likes: (post.likes || 0) + 1 })
      .eq('id', post.id);
    fetchPosts();
  };

  const filtered = category === 'All'
    ? posts
    : posts.filter(p => p.category === category);

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Community</Text>
          <Text style={styles.headerSub}>Share your wellness journey</Text>
        </View>
        <TouchableOpacity
          style={styles.newPostBtn}
          onPress={() => setNewPostVisible(true)}
        >
          <Text style={styles.newPostBtnText}>+ Post</Text>
        </TouchableOpacity>
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categories}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
      >
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[styles.catBtn, category === cat && styles.catBtnActive]}
            onPress={() => setCategory(cat)}
          >
            <Text style={[styles.catText, category === cat && styles.catTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Posts */}
      {loading ? (
        <ActivityIndicator size="large" color="#1D9E75" style={{ marginTop: 40 }} />
      ) : filtered.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>👥</Text>
          <Text style={styles.emptyTitle}>No posts yet</Text>
          <Text style={styles.emptyDesc}>Be the first to share your wellness journey!</Text>
          <TouchableOpacity
            style={styles.emptyBtn}
            onPress={() => setNewPostVisible(true)}
          >
            <Text style={styles.emptyBtnText}>Create first post</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.posts}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          showsVerticalScrollIndicator={false}
        >
          {filtered.map(post => (
            <View key={post.id} style={styles.postCard}>
              <View style={styles.postHeader}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {(post.author_name || 'A')[0].toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.authorName}>{post.author_name}</Text>
                  <Text style={styles.postTime}>{timeAgo(post.created_at)}</Text>
                </View>
                <View style={styles.categoryTag}>
                  <Text style={styles.categoryTagText}>{post.category}</Text>
                </View>
              </View>
              <Text style={styles.postContent}>{post.content}</Text>
              <View style={styles.postFooter}>
                <TouchableOpacity
                  style={styles.likeBtn}
                  onPress={() => likePost(post)}
                >
                  <Text style={styles.likeBtnText}>❤️ {post.likes || 0}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
          <View style={{ height: 20 }} />
        </ScrollView>
      )}

      {/* New post modal */}
      <Modal
        visible={newPostVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setNewPostVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Post</Text>
              <TouchableOpacity onPress={() => setNewPostVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>Category</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 16 }}
              contentContainerStyle={{ gap: 8 }}
            >
              {['General', 'Weight Loss', 'Nutrition', 'Fitness', 'Motivation', 'Questions'].map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.catBtn, postCategory === cat && styles.catBtnActive]}
                  onPress={() => setPostCategory(cat)}
                >
                  <Text style={[styles.catText, postCategory === cat && styles.catTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.modalLabel}>What's on your mind?</Text>
            <TextInput
              style={styles.postInput}
              placeholder="Share your progress, tips, or questions..."
              placeholderTextColor="#ccc"
              value={postText}
              onChangeText={setPostText}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[styles.submitBtn, !postText.trim() && styles.submitBtnDisabled]}
              onPress={submitPost}
              disabled={!postText.trim()}
            >
              <Text style={styles.submitBtnText}>Share with community</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 24, paddingTop: 60, backgroundColor: '#fff' },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#1a1a1a' },
  headerSub: { fontSize: 14, color: '#888', marginTop: 4 },
  newPostBtn: { backgroundColor: '#1D9E75', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  newPostBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  categories: { backgroundColor: '#fff', maxHeight: 52, borderBottomWidth: 0.5, borderBottomColor: '#eee' },
  catBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: '#eee', backgroundColor: '#f8f8f8' },
  catBtnActive: { backgroundColor: '#1D9E75', borderColor: '#1D9E75' },
  catText: { fontSize: 12, color: '#888', fontWeight: '500' },
  catTextActive: { color: '#fff' },
  posts: { flex: 1 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#1a1a1a', marginBottom: 8 },
  emptyDesc: { fontSize: 14, color: '#888', textAlign: 'center', marginBottom: 24 },
  emptyBtn: { backgroundColor: '#1D9E75', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  emptyBtnText: { color: '#fff', fontWeight: '600' },
  postCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, elevation: 1 },
  postHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1D9E75', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  authorName: { fontSize: 14, fontWeight: '600', color: '#1a1a1a' },
  postTime: { fontSize: 12, color: '#aaa' },
  categoryTag: { backgroundColor: '#E1F5EE', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  categoryTagText: { fontSize: 11, color: '#1D9E75', fontWeight: '500' },
  postContent: { fontSize: 15, color: '#444', lineHeight: 22, marginBottom: 12 },
  postFooter: { flexDirection: 'row', alignItems: 'center' },
  likeBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 6 },
  likeBtnText: { fontSize: 14, color: '#888' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a' },
  modalClose: { fontSize: 18, color: '#888' },
  modalLabel: { fontSize: 13, fontWeight: '600', color: '#888', marginBottom: 8 },
  postInput: { borderWidth: 1, borderColor: '#eee', borderRadius: 12, padding: 14, fontSize: 15, color: '#1a1a1a', height: 120, marginBottom: 16 },
  submitBtn: { backgroundColor: '#1D9E75', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  submitBtnDisabled: { backgroundColor: '#ccc' },
  submitBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
});