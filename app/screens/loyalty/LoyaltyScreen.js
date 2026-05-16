import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView,
  StyleSheet, ActivityIndicator, TouchableOpacity
} from 'react-native';
import { supabase } from '../../lib/supabase';

const LEVELS = [
  { name: 'Bronze', min: 0, max: 999, color: '#CD7F32', emoji: '🥉' },
  { name: 'Silver', min: 1000, max: 1999, color: '#C0C0C0', emoji: '🥈' },
  { name: 'Gold', min: 2000, max: 4999, color: '#FFD700', emoji: '🥇' },
  { name: 'Platinum', min: 5000, max: 99999, color: '#1D9E75', emoji: '💎' },
];

const BADGES = [
  { id: 'first_login', label: 'First Login', emoji: '👋', desc: 'Joined Shifa' },
  { id: 'first_chat', label: 'AI Explorer', emoji: '🤖', desc: 'First chat with Ria' },
  { id: 'first_scan', label: 'Meal Scanner', emoji: '📸', desc: 'Scanned first meal' },
  { id: 'first_purchase', label: 'Shifa Shopper', emoji: '🛒', desc: 'First purchase' },
  { id: 'points_500', label: 'Rising Star', emoji: '⭐', desc: 'Reached 500 points' },
  { id: 'points_1000', label: 'Health Hero', emoji: '🏆', desc: 'Reached 1000 points' },
  { id: 'points_2000', label: 'Gold Member', emoji: '🥇', desc: 'Reached 2000 points' },
  { id: 'points_5000', label: 'Platinum Elite', emoji: '💎', desc: 'Reached 5000 points' },
];

const REWARDS = [
  { points: 500, label: 'Free Delivery', emoji: '🚚', desc: 'Get free delivery on your next order' },
  { points: 1000, label: '10% Discount', emoji: '🎟️', desc: '10% off your next purchase' },
  { points: 2000, label: 'Free Supplement', emoji: '🎁', desc: 'Choose any supplement for free' },
  { points: 5000, label: 'VIP Package', emoji: '👑', desc: 'Full wellness package worth $200' },
];

export default function LoyaltyScreen() {
  const [loyalty, setLoyalty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    const { data: loyaltyData } = await supabase
      .from('loyalty')
      .select('*')
      .eq('id', user.id)
      .single();

    const { data: profileData } = await supabase
      .from('user_profiles')
      .select('name')
      .eq('id', user.id)
      .single();

    setLoyalty(loyaltyData);
    setProfile(profileData);
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1D9E75" />
      </View>
    );
  }

  const points = loyalty?.points || 0;
  const currentLevel = LEVELS.find(l => points >= l.min && points <= l.max) || LEVELS[0];
  const nextLevel = LEVELS[LEVELS.indexOf(currentLevel) + 1];
  const progressPercent = nextLevel
    ? ((points - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100
    : 100;

  const earnedBadges = [
    'first_login',
    points >= 50 ? 'first_chat' : null,
    points >= 500 ? 'points_500' : null,
    points >= 1000 ? 'points_1000' : null,
    points >= 2000 ? 'points_2000' : null,
    points >= 5000 ? 'points_5000' : null,
  ].filter(Boolean);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Wellness Rewards</Text>
        <Text style={styles.headerSub}>Earn points, unlock rewards</Text>
      </View>

      {/* Points card */}
      <View style={[styles.pointsCard, { backgroundColor: currentLevel.color }]}>
        <Text style={styles.levelEmoji}>{currentLevel.emoji}</Text>
        <Text style={styles.levelName}>{currentLevel.name} Member</Text>
        <Text style={styles.pointsValue}>{points}</Text>
        <Text style={styles.pointsLabel}>total points</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${Math.min(progressPercent, 100)}%` }]} />
        </View>
        {nextLevel && (
          <Text style={styles.progressLabel}>
            {nextLevel.min - points} points to {nextLevel.name}
          </Text>
        )}
        {!nextLevel && (
          <Text style={styles.progressLabel}>Maximum level reached! 💎</Text>
        )}
      </View>

      {/* How to earn */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How to earn points</Text>
        {[
          { action: 'Complete your profile', pts: 50, emoji: '👤' },
          { action: 'Chat with Ria', pts: 50, emoji: '🤖' },
          { action: 'Scan a meal', pts: 50, emoji: '📸' },
          { action: 'Buy any product', pts: 100, emoji: '🛒' },
          { action: 'Daily app visit', pts: 10, emoji: '📅' },
        ].map((item, i) => (
          <View key={i} style={styles.earnRow}>
            <Text style={styles.earnEmoji}>{item.emoji}</Text>
            <Text style={styles.earnAction}>{item.action}</Text>
            <Text style={styles.earnPts}>+{item.pts} pts</Text>
          </View>
        ))}
      </View>

      {/* Rewards */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Available rewards</Text>
        {REWARDS.map((reward, i) => {
          const unlocked = points >= reward.points;
          return (
            <View key={i} style={[styles.rewardCard, unlocked && styles.rewardCardUnlocked]}>
              <Text style={styles.rewardEmoji}>{reward.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.rewardLabel}>{reward.label}</Text>
                <Text style={styles.rewardDesc}>{reward.desc}</Text>
              </View>
              <View style={[styles.rewardBadge, unlocked && styles.rewardBadgeUnlocked]}>
                <Text style={[styles.rewardBadgeText, unlocked && styles.rewardBadgeTextUnlocked]}>
                  {unlocked ? '✓ Unlocked' : `${reward.points} pts`}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* Badges */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your badges</Text>
        <View style={styles.badgesGrid}>
          {BADGES.map(badge => {
            const earned = earnedBadges.includes(badge.id);
            return (
              <View key={badge.id} style={[styles.badgeCard, !earned && styles.badgeCardLocked]}>
                <Text style={[styles.badgeEmoji, !earned && { opacity: 0.3 }]}>
                  {badge.emoji}
                </Text>
                <Text style={[styles.badgeLabel, !earned && styles.badgeLabelLocked]}>
                  {badge.label}
                </Text>
                <Text style={styles.badgeDesc}>{badge.desc}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { padding: 24, paddingTop: 60, backgroundColor: '#fff' },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#1a1a1a' },
  headerSub: { fontSize: 14, color: '#888', marginTop: 4 },
  pointsCard: { margin: 16, borderRadius: 20, padding: 24, alignItems: 'center' },
  levelEmoji: { fontSize: 40, marginBottom: 8 },
  levelName: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 8 },
  pointsValue: { fontSize: 56, fontWeight: '700', color: '#fff' },
  pointsLabel: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 16 },
  progressBar: { width: '100%', height: 6, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 3, marginBottom: 8 },
  progressFill: { height: 6, backgroundColor: '#fff', borderRadius: 3 },
  progressLabel: { fontSize: 12, color: 'rgba(255,255,255,0.9)' },
  section: { backgroundColor: '#fff', margin: 16, marginTop: 0, marginBottom: 12, borderRadius: 16, padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginBottom: 16 },
  earnRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: '#f0f0f0' },
  earnEmoji: { fontSize: 20, width: 36 },
  earnAction: { flex: 1, fontSize: 14, color: '#444' },
  earnPts: { fontSize: 14, fontWeight: '700', color: '#1D9E75' },
  rewardCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#eee', marginBottom: 10, gap: 12 },
  rewardCardUnlocked: { borderColor: '#1D9E75', backgroundColor: '#E1F5EE' },
  rewardEmoji: { fontSize: 28 },
  rewardLabel: { fontSize: 14, fontWeight: '600', color: '#1a1a1a', marginBottom: 2 },
  rewardDesc: { fontSize: 12, color: '#888' },
  rewardBadge: { backgroundColor: '#f0f0f0', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  rewardBadgeUnlocked: { backgroundColor: '#1D9E75' },
  rewardBadgeText: { fontSize: 11, color: '#888', fontWeight: '500' },
  rewardBadgeTextUnlocked: { color: '#fff' },
  badgesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  badgeCard: { width: '47%', backgroundColor: '#f8f8f8', borderRadius: 12, padding: 14, alignItems: 'center' },
  badgeCardLocked: { opacity: 0.6 },
  badgeEmoji: { fontSize: 32, marginBottom: 8 },
  badgeLabel: { fontSize: 12, fontWeight: '700', color: '#1a1a1a', textAlign: 'center', marginBottom: 4 },
  badgeLabelLocked: { color: '#aaa' },
  badgeDesc: { fontSize: 11, color: '#888', textAlign: 'center' },
});