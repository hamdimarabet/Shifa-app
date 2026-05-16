import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, TextInput, Modal, Alert
} from 'react-native';
import { supabase } from '../../lib/supabase';

const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY;

const MEAL_SUGGESTIONS = [
  { emoji: '🥗', name: 'Grilled Chicken Salad', cal: 320, tag: 'High Protein' },
  { emoji: '🍳', name: 'Egg White Omelette', cal: 180, tag: 'Low Carb' },
  { emoji: '🥣', name: 'Oats with Berries', cal: 280, tag: 'Energy Boost' },
  { emoji: '🐟', name: 'Grilled Salmon', cal: 350, tag: 'Omega-3' },
  { emoji: '🥙', name: 'Veggie Wrap', cal: 260, tag: 'Balanced' },
  { emoji: '🍲', name: 'Lentil Soup', cal: 220, tag: 'Fiber Rich' },
];

export default function HomeScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [loyalty, setLoyalty] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkInVisible, setCheckInVisible] = useState(false);
  const [checkIn, setCheckIn] = useState({ ate: '', feeling: '', water: '', exercise: '' });
  const [aiTip, setAiTip] = useState('');
  const [tipLoading, setTipLoading] = useState(false);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    fetchData();
    setGreetingByTime();
  }, []);

  const setGreetingByTime = () => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  };

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    const [{ data: profileData }, { data: loyaltyData }, { data: productsData }] =
      await Promise.all([
        supabase.from('user_profiles').select('*').eq('id', user.id).single(),
        supabase.from('loyalty').select('*').eq('id', user.id).single(),
        supabase.from('products').select('*').limit(4),
      ]);

    setProfile(profileData);
    setLoyalty(loyaltyData);
    setProducts(productsData || []);
    setLoading(false);

    fetchAiTip(profileData);
  };

  const fetchAiTip = async (profileData) => {
    if (!profileData) return;
    setTipLoading(true);
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          max_tokens: 100,
          messages: [{
            role: 'user',
            content: `Give a single short wellness tip (max 2 sentences) for someone who wants to ${(profileData?.goals || []).join(', ')}. Be specific and motivating. No introduction, just the tip.`
          }],
        }),
      });
      const data = await response.json();
      setAiTip(data.choices?.[0]?.message?.content || '');
    } catch {
      setAiTip('Stay consistent with your wellness goals today!');
    }
    setTipLoading(false);
  };

  const submitCheckIn = async () => {
    if (!checkIn.ate && !checkIn.feeling && !checkIn.water && !checkIn.exercise) return;

    const { data: { user } } = await supabase.auth.getUser();
    const { data: loy } = await supabase
      .from('loyalty')
      .select('points')
      .eq('id', user.id)
      .single();

    await supabase
      .from('loyalty')
      .update({ points: (loy?.points || 0) + 10 })
      .eq('id', user.id);

    setCheckInVisible(false);
    setCheckIn({ ate: '', feeling: '', water: '', exercise: '' });
    Alert.alert('✅ Check-in saved!', 'You earned +10 points for your daily check-in!');
    fetchData();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1D9E75" />
      </View>
    );
  }

  const points = loyalty?.points || 0;
  const pointsToNext = 2000 - points;
  const progressPercent = Math.min((points / 2000) * 100, 100);

  const recommendedMeals = MEAL_SUGGESTIONS
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{greeting},</Text>
          <Text style={styles.userName}>{profile?.name} 👋</Text>
        </View>
        <TouchableOpacity
          style={styles.notifBtn}
          onPress={() => navigation.getParent()?.navigate('Chat')}
        >
          <Text style={styles.notifEmoji}>🤖</Text>
        </TouchableOpacity>
      </View>

      {/* AI Daily tip */}
      <View style={styles.tipCard}>
        <Text style={styles.tipTitle}>💡 Ria's tip for today</Text>
        {tipLoading
          ? <ActivityIndicator size="small" color="#1D9E75" style={{ marginTop: 8 }} />
          : <Text style={styles.tipText}>{aiTip}</Text>
        }
      </View>

      {/* Daily check-in */}
      <TouchableOpacity
        style={styles.checkInCard}
        onPress={() => setCheckInVisible(true)}
      >
        <View style={styles.checkInLeft}>
          <Text style={styles.checkInEmoji}>📋</Text>
          <View>
            <Text style={styles.checkInTitle}>Daily Check-in</Text>
            <Text style={styles.checkInSub}>Log your day • Earn +10 pts</Text>
          </View>
        </View>
        <Text style={styles.checkInArrow}>›</Text>
      </TouchableOpacity>

      {/* Loyalty card */}
      <View style={styles.loyaltyCard}>
        <View style={styles.loyaltyTop}>
          <View>
            <Text style={styles.loyaltyLevel}>{loyalty?.level || 'Bronze'} Member</Text>
            <Text style={styles.loyaltyPoints}>{points} pts</Text>
          </View>
          <TouchableOpacity
            style={styles.viewRewardsBtn}
            onPress={() => navigation.getParent()?.navigate('Rewards')}
          >
            <Text style={styles.viewRewardsBtnText}>View rewards →</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
        </View>
        <Text style={styles.progressLabel}>
          {pointsToNext > 0 ? `${pointsToNext} more points to Gold` : 'Gold level reached! 🥇'}
        </Text>
      </View>

      {/* Quick actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.quickBtn}
          onPress={() => navigation.getParent()?.navigate('Chat')}
        >
          <Text style={styles.quickEmoji}>🤖</Text>
          <Text style={styles.quickLabel}>Ask Ria</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickBtn}
          onPress={() => navigation.getParent()?.navigate('Meal')}
        >
          <Text style={styles.quickEmoji}>📸</Text>
          <Text style={styles.quickLabel}>Scan Meal</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickBtn}
          onPress={() => navigation.getParent()?.navigate('Store')}
        >
          <Text style={styles.quickEmoji}>🛒</Text>
          <Text style={styles.quickLabel}>Store</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickBtn}
          onPress={() => navigation.getParent()?.navigate('Blog')}
        >
          <Text style={styles.quickEmoji}>📝</Text>
          <Text style={styles.quickLabel}>Blog</Text>
        </TouchableOpacity>
      </View>

      {/* Recommended products */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recommended for you</Text>
        <TouchableOpacity onPress={() => navigation.getParent()?.navigate('Store')}>
          <Text style={styles.seeAll}>See all →</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
      >
        {products.map(product => (
          <TouchableOpacity
            key={product.id}
            style={styles.productCard}
            onPress={() => navigation.getParent()?.navigate('Store')}
          >
            <View style={styles.productEmoji}>
              <Text style={{ fontSize: 32 }}>{product.image_emoji}</Text>
            </View>
            <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
            <Text style={styles.productPrice}>${product.price}</Text>
            <View style={styles.productTag}>
              <Text style={styles.productTagText}>{product.category}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Recommended meals */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Meal ideas for you</Text>
        <TouchableOpacity onPress={() => navigation.getParent()?.navigate('Meal')}>
          <Text style={styles.seeAll}>Scan meal →</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.mealsContainer}>
        {recommendedMeals.map((meal, i) => (
          <View key={i} style={styles.mealCard}>
            <Text style={styles.mealEmoji}>{meal.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.mealName}>{meal.name}</Text>
              <Text style={styles.mealCal}>{meal.cal} kcal</Text>
            </View>
            <View style={styles.mealTag}>
              <Text style={styles.mealTagText}>{meal.tag}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Stats row */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Your stats</Text>
      </View>
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statEmoji}>⚖️</Text>
          <Text style={styles.statValue}>{profile?.weight}{profile?.weight_unit}</Text>
          <Text style={styles.statLabel}>Weight</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statEmoji}>📏</Text>
          <Text style={styles.statValue}>{profile?.height}{profile?.height_unit}</Text>
          <Text style={styles.statLabel}>Height</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statEmoji}>🎯</Text>
          <Text style={styles.statValue} numberOfLines={1}>
            {(profile?.goals || [])[0] || 'None'}
          </Text>
          <Text style={styles.statLabel}>Top goal</Text>
        </View>
      </View>

      {/* Goals */}
      <View style={styles.goalsSection}>
        <Text style={styles.sectionTitle}>My goals</Text>
        <View style={styles.goalsRow}>
          {(profile?.goals || []).map((goal, i) => (
            <View key={i} style={styles.goalTag}>
              <Text style={styles.goalTagText}>{goal}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={{ height: 40 }} />

      {/* Daily Check-in Modal */}
      <Modal
        visible={checkInVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setCheckInVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Daily Check-in</Text>
              <TouchableOpacity onPress={() => setCheckInVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>🍽️ What did you eat today?</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Salad, grilled chicken, fruits..."
                placeholderTextColor="#ccc"
                value={checkIn.ate}
                onChangeText={v => setCheckIn(p => ({ ...p, ate: v }))}
                multiline
              />

              <Text style={styles.inputLabel}>💧 How much water did you drink?</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 2 liters, 8 glasses..."
                placeholderTextColor="#ccc"
                value={checkIn.water}
                onChangeText={v => setCheckIn(p => ({ ...p, water: v }))}
              />

              <Text style={styles.inputLabel}>🏃 Did you exercise today?</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 30 min walk, gym session..."
                placeholderTextColor="#ccc"
                value={checkIn.exercise}
                onChangeText={v => setCheckIn(p => ({ ...p, exercise: v }))}
              />

              <Text style={styles.inputLabel}>😊 How are you feeling?</Text>
              <View style={styles.feelingRow}>
                {['😔', '😐', '🙂', '😊', '🤩'].map(emoji => (
                  <TouchableOpacity
                    key={emoji}
                    style={[
                      styles.feelingBtn,
                      checkIn.feeling === emoji && styles.feelingBtnActive
                    ]}
                    onPress={() => setCheckIn(p => ({ ...p, feeling: emoji }))}
                  >
                    <Text style={{ fontSize: 24 }}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={styles.submitBtn}
                onPress={submitCheckIn}
              >
                <Text style={styles.submitBtnText}>Save check-in • +10 pts</Text>
              </TouchableOpacity>

              <View style={{ height: 20 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, paddingTop: 60, backgroundColor: '#fff' },
  greeting: { fontSize: 14, color: '#888' },
  userName: { fontSize: 22, fontWeight: '700', color: '#1a1a1a' },
  notifBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E1F5EE', alignItems: 'center', justifyContent: 'center' },
  notifEmoji: { fontSize: 22 },
  tipCard: { margin: 16, marginBottom: 8, backgroundColor: '#1D9E75', borderRadius: 16, padding: 16 },
  tipTitle: { fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: '600', marginBottom: 8 },
  tipText: { fontSize: 14, color: '#fff', lineHeight: 22 },
  checkInCard: { marginHorizontal: 16, marginBottom: 8, backgroundColor: '#fff', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1.5, borderColor: '#1D9E75' },
  checkInLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  checkInEmoji: { fontSize: 28 },
  checkInTitle: { fontSize: 15, fontWeight: '600', color: '#1a1a1a' },
  checkInSub: { fontSize: 12, color: '#888', marginTop: 2 },
  checkInArrow: { fontSize: 24, color: '#1D9E75' },
  loyaltyCard: { margin: 16, marginTop: 8, marginBottom: 8, backgroundColor: '#fff', borderRadius: 16, padding: 16, elevation: 1 },
  loyaltyTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  loyaltyLevel: { fontSize: 12, color: '#888', marginBottom: 4 },
  loyaltyPoints: { fontSize: 28, fontWeight: '700', color: '#1D9E75' },
  viewRewardsBtn: { backgroundColor: '#E1F5EE', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  viewRewardsBtnText: { fontSize: 12, color: '#1D9E75', fontWeight: '600' },
  progressBarContainer: { height: 6, backgroundColor: '#eee', borderRadius: 3, marginBottom: 8 },
  progressBarFill: { height: 6, backgroundColor: '#1D9E75', borderRadius: 3 },
  progressLabel: { fontSize: 12, color: '#888' },
  quickActions: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 8 },
  quickBtn: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 14, alignItems: 'center', elevation: 1 },
  quickEmoji: { fontSize: 24, marginBottom: 6 },
  quickLabel: { fontSize: 11, color: '#444', fontWeight: '500' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginTop: 8, marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  seeAll: { fontSize: 13, color: '#1D9E75', fontWeight: '500' },
  productCard: { width: 140, backgroundColor: '#fff', borderRadius: 16, padding: 14, alignItems: 'center', marginBottom: 8, elevation: 1 },
  productEmoji: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#E1F5EE', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  productName: { fontSize: 12, fontWeight: '600', color: '#1a1a1a', textAlign: 'center', marginBottom: 6 },
  productPrice: { fontSize: 15, fontWeight: '700', color: '#1D9E75', marginBottom: 6 },
  productTag: { backgroundColor: '#f0f0f0', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  productTagText: { fontSize: 10, color: '#888' },
  mealsContainer: { paddingHorizontal: 16, gap: 8, marginBottom: 8 },
  mealCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 14, gap: 12, elevation: 1 },
  mealEmoji: { fontSize: 32 },
  mealName: { fontSize: 14, fontWeight: '600', color: '#1a1a1a', marginBottom: 2 },
  mealCal: { fontSize: 12, color: '#888' },
  mealTag: { backgroundColor: '#E1F5EE', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  mealTagText: { fontSize: 11, color: '#1D9E75', fontWeight: '500' },
  statsRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 8 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 12, alignItems: 'center', elevation: 1 },
  statEmoji: { fontSize: 20, marginBottom: 6 },
  statValue: { fontSize: 13, fontWeight: '700', color: '#1a1a1a', textAlign: 'center' },
  statLabel: { fontSize: 10, color: '#888', marginTop: 2 },
  goalsSection: { paddingHorizontal: 16, marginBottom: 8 },
  goalsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  goalTag: { backgroundColor: '#E1F5EE', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  goalTagText: { fontSize: 12, color: '#1D9E75', fontWeight: '500' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a' },
  modalClose: { fontSize: 18, color: '#888' },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#444', marginBottom: 8, marginTop: 12 },
  input: { borderWidth: 1, borderColor: '#eee', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, color: '#1a1a1a', marginBottom: 4 },
  feelingRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, marginTop: 4 },
  feelingBtn: { width: 52, height: 52, borderRadius: 26, borderWidth: 2, borderColor: '#eee', alignItems: 'center', justifyContent: 'center' },
  feelingBtnActive: { borderColor: '#1D9E75', backgroundColor: '#E1F5EE' },
  submitBtn: { backgroundColor: '#1D9E75', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  submitBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
});