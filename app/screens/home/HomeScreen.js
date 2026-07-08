import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, TextInput, Modal, Alert
} from 'react-native';
import { supabase } from '../../lib/supabase';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const FALLBACK_MEALS = [
  { title: 'Grilled Chicken Salad', recommendation: 'High-protein meal idea.', reason: 'Good for balanced nutrition.' },
  { title: 'Oats with Berries', recommendation: 'Energy-boosting breakfast.', reason: 'Good source of carbs and fiber.' },
  { title: 'Lentil Soup', recommendation: 'Fiber-rich meal.', reason: 'Supports digestion.' },
];

export default function HomeScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [loyalty, setLoyalty] = useState(null);
  const [products, setProducts] = useState([]);
  const [meals, setMeals] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [dailyActions, setDailyActions] = useState([]);
  const [priorityFocus, setPriorityFocus] = useState('');
  const [checkinResult, setCheckinResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkInVisible, setCheckInVisible] = useState(false);
  const [checkIn, setCheckIn] = useState({ ate: '', feeling: '', exercise: '' });
  const [aiTip, setAiTip] = useState('');
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

  const normalizeGoals = (goals) => {
    if (Array.isArray(goals)) return goals;
    if (goals) return [goals];
    return [];
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
  
      const [{ data: profileData }, { data: loyaltyData }] = await Promise.all([
        supabase.from('user_profiles').select('*').eq('id', user.id).single(),
        supabase.from('loyalty').select('*').eq('id', user.id).single(),
      ]);
  
      setProfile(profileData);
      setLoyalty(loyaltyData);
  
      // Try recommend API — fail silently if not available
      try {
        const safeGoals = normalizeGoals(profileData?.goals);
        const recommendRes = await fetch(`${API_URL}/recommend`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: user.id,
            age: Number(profileData?.age) || 0,
            weight: Number(profileData?.weight) || 0,
            height: Number(profileData?.height) || 0,
            sex: profileData?.sex || '',
            goals: safeGoals,
            medical_conditions: profileData?.medical_conditions || [],
            language: 'ar',
            activity_info: profileData?.activity_level || '',
          }),
        });
  
        if (recommendRes.ok) {
          const recommendData = await recommendRes.json();
          const aiProducts = (recommendData.recommended_products || []).map((p, index) => ({
            id: index,
            name: p.product || p.name || 'Recommended product',
            image_emoji: p.image_emoji || '🌿',
            price: p.offer?.new_price || p.price || '',
            category: p.reason || p.category || 'Recommended',
          }));
          setProducts(aiProducts);
          setMeals(recommendData.meal_recommendations || FALLBACK_MEALS);
          setExercises(recommendData.exercise_recommendations || []);
          setDailyActions(recommendData.daily_actions || []);
          setPriorityFocus(recommendData.priority_focus || '');
          setAiTip(
            recommendData.motivation_message ||
            recommendData.behavioral_insight ||
            'Stay consistent with your wellness goals today!'
          );
        } else {
          setMeals(FALLBACK_MEALS);
          setAiTip('Stay consistent with your wellness goals today!');
        }
      } catch (recommendError) {
        console.log('Recommend API not available:', recommendError);
        setMeals(FALLBACK_MEALS);
        setAiTip('Stay consistent with your wellness goals today!');
      }
  
    } catch (error) {
      console.log('Home fetchData error:', error);
      setMeals(FALLBACK_MEALS);
      setAiTip('Stay consistent with your wellness goals today!');
    } finally {
      setLoading(false);
    }
  };

  const submitCheckIn = async () => {
    if (!checkIn.ate && !checkIn.feeling && !checkIn.exercise) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const safeGoals = normalizeGoals(profile?.goals);

      const checkinRes = await fetch(`${API_URL}/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          meals_today: checkIn.ate || 'Not specified',
          activity_today: checkIn.exercise || 'Not specified',
          mood: checkIn.feeling || '',
          age: Number(profile?.age) || 0,
          weight: Number(profile?.weight) || 0,
          height: Number(profile?.height) || 0,
          sex: profile?.sex || '',
          medical_conditions: profile?.medical_conditions || [],
          goals: safeGoals,
          language: 'ar',
        }),
      });

      const checkinData = await checkinRes.json();
      setCheckinResult(checkinData);

      const { data: loy } = await supabase
        .from('loyalty').select('points').eq('id', user.id).single();

      await supabase
        .from('loyalty')
        .update({ points: (loy?.points || 0) + 10 })
        .eq('id', user.id);

      setCheckInVisible(false);
      setCheckIn({ ate: '', feeling: '', exercise: '' });

      let message = 'Your AI check-in analysis is ready. +10 points earned!';
      if (checkinData.product_hint) {
        message += `\n\n💊 Ria suggests: ${checkinData.product_hint}`;
      }
      Alert.alert('✅ Check-in saved!', message);
      fetchData();

    } catch (error) {
      console.log('Checkin error:', error);
      Alert.alert('Error', 'Could not save check-in. Please try again.');
    }
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
  const energy = checkinResult?.energy_estimation || {};

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
          onPress={() => navigation.navigate('Chat')}
        >
          <Text style={styles.notifEmoji}>🤖</Text>
        </TouchableOpacity>
      </View>

      {/* AI tip */}
      <View style={styles.tipCard}>
        <Text style={styles.tipTitle}>💡 Ria's tip for today</Text>
        <Text style={styles.tipText}>{aiTip}</Text>
      </View>

      {/* AI Plan */}
      {(priorityFocus || dailyActions.length > 0) && (
        <View style={styles.aiPlanCard}>
          <Text style={styles.sectionTitle}>🧠 Your plan for today</Text>
          {priorityFocus && (
            <Text style={styles.planTitle}>🎯 Today's focus: {priorityFocus}</Text>
          )}
          {dailyActions.slice(0, 2).map((action, index) => (
            <Text key={index} style={styles.planText}>
              • {typeof action === 'string' ? action : action.action}
            </Text>
          ))}
        </View>
      )}

      {/* Check-in button */}
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

      {/* Check-in result */}
      {checkinResult && (
        <View style={styles.loyaltyCard}>
          <Text style={styles.sectionTitle}>Latest AI Check-in Analysis</Text>
          <Text style={styles.progressLabel}>Calories in: {energy.estimated_calories_in ?? 'N/A'} kcal</Text>
          <Text style={styles.progressLabel}>Calories burned: {energy.estimated_calories_burned ?? 'N/A'} kcal</Text>
          <Text style={styles.progressLabel}>Net calories: {energy.estimated_net_calories ?? 'N/A'} kcal</Text>
          <Text style={styles.progressLabel}>Weekly weight prediction: {energy.estimated_weekly_weight_change_kg ?? 'N/A'} kg</Text>
          <Text style={styles.progressLabel}>Trend: {energy.weight_trend ?? checkinResult?.trend_direction ?? 'N/A'}</Text>
        </View>
      )}

      {/* Loyalty card */}
      <View style={styles.loyaltyCard}>
        <View style={styles.loyaltyTop}>
          <View>
            <Text style={styles.loyaltyLevel}>{loyalty?.level || 'Bronze'} Member</Text>
            <Text style={styles.loyaltyPoints}>{points} pts</Text>
          </View>
          <TouchableOpacity
            style={styles.viewRewardsBtn}
            onPress={() => navigation.navigate('Rewards')}
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
        <TouchableOpacity style={styles.quickBtn} onPress={() => navigation.navigate('Chat')}>
          <Text style={styles.quickEmoji}>🤖</Text>
          <Text style={styles.quickLabel}>Ask Ria</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickBtn} onPress={() => navigation.navigate('Meal')}>
          <Text style={styles.quickEmoji}>📸</Text>
          <Text style={styles.quickLabel}>Scan Meal</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickBtn} onPress={() => navigation.navigate('Store')}>
          <Text style={styles.quickEmoji}>🛒</Text>
          <Text style={styles.quickLabel}>Store</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickBtn} onPress={() => navigation.navigate('Blog')}>
          <Text style={styles.quickEmoji}>📝</Text>
          <Text style={styles.quickLabel}>Blog</Text>
        </TouchableOpacity>
      </View>

      {/* Recommended products */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recommended for you</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Store')}>
          <Text style={styles.seeAll}>See all →</Text>
        </TouchableOpacity>
      </View>
      {products.length === 0 ? (
        <Text style={{ paddingHorizontal: 16, color: '#888', marginBottom: 12 }}>
          No product recommendation for your current goal yet.
        </Text>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
          {products.map(product => (
            <TouchableOpacity
              key={product.id}
              style={styles.productCard}
              onPress={() => navigation.navigate('Store')}
            >
              <View style={styles.productEmoji}>
                <Text style={{ fontSize: 32 }}>{product.image_emoji}</Text>
              </View>
              <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
              <Text style={styles.productPrice}>{product.price ? `${product.price} TND` : ''}</Text>
              <View style={styles.productTag}>
                <Text style={styles.productTagText} numberOfLines={2}>{product.category}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Meal ideas */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Meal ideas for you</Text>
      </View>
      <View style={styles.mealsContainer}>
        {meals.map((meal, i) => (
          <View key={i} style={styles.mealCard}>
            <Text style={styles.mealEmoji}>🍽️</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.mealName}>{meal.title || meal.name}</Text>
              <Text style={styles.mealCal}>{meal.recommendation || meal.reason}</Text>
            </View>
            <View style={styles.mealTag}>
              <Text style={styles.mealTagText}>AI Meal</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Exercise suggestions */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Exercise suggestions</Text>
      </View>
      <View style={styles.mealsContainer}>
        {exercises.length === 0 ? (
          <Text style={{ color: '#888', paddingHorizontal: 0 }}>No exercise suggestion yet.</Text>
        ) : exercises.map((exercise, i) => (
          <View key={i} style={styles.mealCard}>
            <Text style={styles.mealEmoji}>🏋️</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.mealName}>{exercise.title}</Text>
              <Text style={styles.mealCal}>{exercise.recommendation}</Text>
            </View>
            <View style={styles.mealTag}>
              <Text style={styles.mealTagText}>AI Exercise</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Stats */}
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
            {normalizeGoals(profile?.goals)[0] || 'None'}
          </Text>
          <Text style={styles.statLabel}>Top goal</Text>
        </View>
      </View>

      {/* Goals */}
      <View style={styles.goalsSection}>
        <Text style={styles.sectionTitle}>My goals</Text>
        <View style={styles.goalsRow}>
          {normalizeGoals(profile?.goals).filter(Boolean).map((goal, i) => (
            <View key={i} style={styles.goalTag}>
              <Text style={styles.goalTagText}>{goal}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={{ height: 40 }} />

      {/* Check-in Modal */}
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
                    style={[styles.feelingBtn, checkIn.feeling === emoji && styles.feelingBtnActive]}
                    onPress={() => setCheckIn(p => ({ ...p, feeling: emoji }))}
                  >
                    <Text style={{ fontSize: 24 }}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={styles.submitBtn} onPress={submitCheckIn}>
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
  aiPlanCard: { margin: 16, marginTop: 8, marginBottom: 8, backgroundColor: '#fff', borderRadius: 16, padding: 16, elevation: 1, borderLeftWidth: 4, borderLeftColor: '#1D9E75' },
  planTitle: { fontSize: 14, fontWeight: '600', color: '#1a1a1a', marginTop: 10, marginBottom: 8 },
  planText: { fontSize: 13, color: '#555', lineHeight: 20, marginBottom: 4 },
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