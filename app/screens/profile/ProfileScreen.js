import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, TextInput,
  Alert, Modal
} from 'react-native';
import { supabase } from '../../lib/supabase';

export default function ProfileScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [loyalty, setLoyalty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    const { data: profileData } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    const { data: loyaltyData } = await supabase
      .from('loyalty')
      .select('*')
      .eq('id', user.id)
      .single();

    setProfile(profileData);
    setLoyalty(loyaltyData);
    setEditData(profileData || {});
    setLoading(false);
  };

  const saveProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase
      .from('user_profiles')
      .update({
        name: editData.name,
        age: parseInt(editData.age) || null,
        height: parseFloat(editData.height),
        weight: parseFloat(editData.weight),
        sex: editData.sex,
        activity_level: editData.activity_level,
        goals: Array.isArray(editData.goals) ? editData.goals : [editData.goals],
        medical_conditions: editData.medical_conditions || [],
      })
      .eq('id', user.id);

    if (!error) {
      setProfile({ ...profile, ...editData });
      setEditing(false);
      Alert.alert('✅ Saved', 'Your profile has been updated!');
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await supabase.auth.signOut();
            navigation.navigate('Login');
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1D9E75" />
      </View>
    );
  }

  const LEVELS = [
    { name: 'Bronze', min: 0, color: '#CD7F32' },
    { name: 'Silver', min: 1000, color: '#C0C0C0' },
    { name: 'Gold', min: 2000, color: '#FFD700' },
    { name: 'Platinum', min: 5000, color: '#1D9E75' },
  ];

  const points = loyalty?.points || 0;
  const currentLevel = [...LEVELS].reverse().find(l => points >= l.min) || LEVELS[0];

  const bmi = profile?.weight && profile?.height
    ? (profile.weight / ((profile.height / 100) ** 2)).toFixed(1)
    : null;

  const bmiCategory = bmi
    ? bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese'
    : null;

  const bmiColor = bmi
    ? bmi < 18.5 ? '#F59E0B' : bmi < 25 ? '#1D9E75' : bmi < 30 ? '#F59E0B' : '#EF4444'
    : '#888';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(profile?.name || 'U')[0].toUpperCase()}
          </Text>
        </View>
        <Text style={styles.userName}>{profile?.name}</Text>
        <View style={[styles.levelBadge, { backgroundColor: currentLevel.color }]}>
          <Text style={styles.levelBadgeText}>{currentLevel.name} Member</Text>
        </View>
        <Text style={styles.pointsText}>{points} points</Text>
      </View>

      {/* BMI card */}
      {bmi && (
        <View style={styles.bmiCard}>
          <View style={styles.bmiLeft}>
            <Text style={styles.bmiTitle}>Your BMI</Text>
            <Text style={styles.bmiDesc}>Body Mass Index</Text>
          </View>
          <View style={styles.bmiRight}>
            <Text style={[styles.bmiValue, { color: bmiColor }]}>{bmi}</Text>
            <Text style={[styles.bmiCategory, { color: bmiColor }]}>{bmiCategory}</Text>
          </View>
        </View>
      )}

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statEmoji}>⚖️</Text>
          <Text style={styles.statValue}>{profile?.weight} {profile?.weight_unit}</Text>
          <Text style={styles.statLabel}>Weight</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statEmoji}>📏</Text>
          <Text style={styles.statValue}>{profile?.height} {profile?.height_unit}</Text>
          <Text style={styles.statLabel}>Height</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statEmoji}>🏃</Text>
          <Text style={styles.statValue} numberOfLines={1}>{profile?.activity_level}</Text>
          <Text style={styles.statLabel}>Activity</Text>
        </View>
      </View>

      {/* Goals */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My goals</Text>
        <View style={styles.goalsRow}>
          {(profile?.goals || []).map((goal, i) => (
            <View key={i} style={styles.goalTag}>
              <Text style={styles.goalTagText}>{goal}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Edit profile button */}
      <TouchableOpacity
        style={styles.editBtn}
        onPress={() => setEditing(true)}
      >
        <Text style={styles.editBtnText}>✏️ Edit Profile</Text>
      </TouchableOpacity>

      {/* Account section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>🔔 Notifications</Text>
          <Text style={styles.menuItemArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>🔒 Privacy</Text>
          <Text style={styles.menuItemArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>❓ Help & Support</Text>
          <Text style={styles.menuItemArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>📋 Terms & Privacy Policy</Text>
          <Text style={styles.menuItemArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutBtnText}>Logout</Text>
      </TouchableOpacity>

      <Text style={styles.version}>Shifa v1.0.0</Text>

      <View style={{ height: 40 }} />

      {/* Edit modal */}
      <Modal
        visible={editing}
        animationType="slide"
        transparent
        onRequestClose={() => setEditing(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setEditing(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                style={styles.input}
                value={editData.name}
                onChangeText={v => setEditData(p => ({ ...p, name: v }))}
                placeholder="Your name"
              />

              <Text style={styles.inputLabel}>Age</Text>
              <TextInput
                style={styles.input}
                value={String(editData.age || '')}
                onChangeText={v => setEditData(p => ({ ...p, age: v }))}
                keyboardType="numeric"
                placeholder="Your age"
              />

              <Text style={styles.inputLabel}>Height (cm)</Text>
              <TextInput
                style={styles.input}
                value={String(editData.height || '')}
                onChangeText={v => setEditData(p => ({ ...p, height: v }))}
                keyboardType="numeric"
                placeholder="Height in cm"
              />

              <Text style={styles.inputLabel}>Weight (kg)</Text>
              <TextInput
                style={styles.input}
                value={String(editData.weight || '')}
                onChangeText={v => setEditData(p => ({ ...p, weight: v }))}
                keyboardType="numeric"
                placeholder="Weight in kg"
              />

              <Text style={styles.inputLabel}>Sex</Text>
              <View style={styles.optionRow}>
                {['Male', 'Female'].map(s => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.optionBtn, editData.sex === s && styles.optionBtnActive]}
                    onPress={() => setEditData(p => ({ ...p, sex: s }))}
                  >
                    <Text style={[styles.optionBtnText, editData.sex === s && styles.optionBtnTextActive]}>
                      {s}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Activity level</Text>
              {['sitting', 'standing', 'walking', 'intense'].map(level => (
                <TouchableOpacity
                  key={level}
                  style={[styles.activityOption, editData.activity_level === level && styles.activityOptionActive]}
                  onPress={() => setEditData(p => ({ ...p, activity_level: level }))}
                >
                  <Text style={[styles.activityOptionText, editData.activity_level === level && styles.activityOptionTextActive]}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}

              <Text style={styles.inputLabel}>Goal</Text>
              {['weight_loss', 'muscle_gain', 'general_wellness'].map(goal => (
                <TouchableOpacity
                  key={goal}
                  style={[
                    styles.activityOption,
                    (editData.goals?.[0] === goal || editData.goals === goal) && styles.activityOptionActive
                  ]}
                  onPress={() => setEditData(p => ({ ...p, goals: [goal] }))}
                >
                  <Text style={[
                    styles.activityOptionText,
                    (editData.goals?.[0] === goal || editData.goals === goal) && styles.activityOptionTextActive
                  ]}>
                    {goal === 'weight_loss' ? '🔥 Weight Loss' : goal === 'muscle_gain' ? '💪 Muscle Gain' : '🌿 General Wellness'}
                  </Text>
                </TouchableOpacity>
              ))}

              <Text style={styles.inputLabel}>Medical conditions</Text>
              {[
                { id: 'pregnancy', label: '🤰 Pregnancy' },
                { id: 'breastfeeding', label: '🤱 Breastfeeding' },
                { id: 'hypertension', label: '❤️ Hypertension' },
                { id: 'diabetes', label: '🩸 Diabetes' },
              ].map(condition => {
                const currentConditions = editData.medical_conditions || [];
                const isSelected = currentConditions.includes(condition.id);
                return (
                  <TouchableOpacity
                    key={condition.id}
                    style={[styles.activityOption, isSelected && styles.activityOptionActive]}
                    onPress={() => {
                      const updated = isSelected
                        ? currentConditions.filter(c => c !== condition.id)
                        : [...currentConditions, condition.id];
                      setEditData(p => ({ ...p, medical_conditions: updated }));
                    }}
                  >
                    <Text style={[styles.activityOptionText, isSelected && styles.activityOptionTextActive]}>
                      {condition.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}

              <TouchableOpacity style={styles.saveBtn} onPress={saveProfile}>
                <Text style={styles.saveBtnText}>Save changes</Text>
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
  header: { backgroundColor: '#1D9E75', padding: 32, paddingTop: 70, alignItems: 'center' },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { fontSize: 36, color: '#fff', fontWeight: '700' },
  userName: { fontSize: 24, fontWeight: '700', color: '#fff', marginBottom: 8 },
  levelBadge: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, marginBottom: 8 },
  levelBadgeText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  pointsText: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  bmiCard: { margin: 16, backgroundColor: '#fff', borderRadius: 16, padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  bmiLeft: {},
  bmiTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a' },
  bmiDesc: { fontSize: 13, color: '#888', marginTop: 4 },
  bmiRight: { alignItems: 'center' },
  bmiValue: { fontSize: 40, fontWeight: '700' },
  bmiCategory: { fontSize: 13, fontWeight: '600' },
  statsRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, marginBottom: 12 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 14, alignItems: 'center' },
  statEmoji: { fontSize: 20, marginBottom: 6 },
  statValue: { fontSize: 13, fontWeight: '700', color: '#1a1a1a', textAlign: 'center' },
  statLabel: { fontSize: 11, color: '#888', marginTop: 2 },
  section: { backgroundColor: '#fff', margin: 16, marginTop: 0, marginBottom: 12, borderRadius: 16, padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginBottom: 12 },
  goalsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  goalTag: { backgroundColor: '#E1F5EE', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  goalTagText: { fontSize: 12, color: '#1D9E75', fontWeight: '500' },
  editBtn: { marginHorizontal: 16, marginBottom: 12, backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#1D9E75', borderRadius: 12, padding: 14, alignItems: 'center' },
  editBtnText: { color: '#1D9E75', fontWeight: '600', fontSize: 15 },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: '#f0f0f0' },
  menuItemText: { fontSize: 15, color: '#1a1a1a' },
  menuItemArrow: { fontSize: 20, color: '#ccc' },
  logoutBtn: { marginHorizontal: 16, marginBottom: 8, backgroundColor: '#FEE2E2', borderRadius: 12, padding: 14, alignItems: 'center' },
  logoutBtnText: { color: '#EF4444', fontWeight: '600', fontSize: 15 },
  version: { textAlign: 'center', color: '#aaa', fontSize: 12, marginBottom: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a' },
  modalClose: { fontSize: 18, color: '#888' },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#888', marginBottom: 8, marginTop: 12 },
  input: { borderWidth: 1, borderColor: '#eee', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, color: '#1a1a1a', marginBottom: 4 },
  optionRow: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  optionBtn: { flex: 1, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#eee', alignItems: 'center' },
  optionBtnActive: { borderColor: '#1D9E75', backgroundColor: '#E1F5EE' },
  optionBtnText: { fontSize: 14, color: '#888' },
  optionBtnTextActive: { color: '#1D9E75', fontWeight: '600' },
  activityOption: { borderWidth: 1, borderColor: '#eee', borderRadius: 10, padding: 12, marginBottom: 8 },
  activityOptionActive: { borderColor: '#1D9E75', backgroundColor: '#E1F5EE' },
  activityOptionText: { fontSize: 14, color: '#888' },
  activityOptionTextActive: { color: '#1D9E75', fontWeight: '600' },
  saveBtn: { backgroundColor: '#1D9E75', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 16 },
  saveBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
});