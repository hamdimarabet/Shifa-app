import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, TextInput,
  Modal, Alert
} from 'react-native';
import { supabase } from '../../lib/supabase';

const MOODS = [
  { emoji: '😔', label: 'Sad' },
  { emoji: '😐', label: 'Okay' },
  { emoji: '🙂', label: 'Good' },
  { emoji: '😊', label: 'Great' },
  { emoji: '🤩', label: 'Amazing' },
];

export default function JournalScreen() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [todayEntry, setTodayEntry] = useState(null);
  const [form, setForm] = useState({
    weight: '',
    water_glasses: '',
    sleep_hours: '',
    mood: '',
    notes: '',
  });

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data } = await supabase
      .from('health_journal')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(30);

    setEntries(data || []);

    const today = new Date().toISOString().split('T')[0];
    const todayLog = (data || []).find(e => e.date === today);
    setTodayEntry(todayLog || null);
    if (todayLog) {
      setForm({
        weight: String(todayLog.weight || ''),
        water_glasses: String(todayLog.water_glasses || ''),
        sleep_hours: String(todayLog.sleep_hours || ''),
        mood: todayLog.mood || '',
        notes: todayLog.notes || '',
      });
    }
    setLoading(false);
  };

  const saveEntry = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const today = new Date().toISOString().split('T')[0];

    const entryData = {
      user_id: user.id,
      date: today,
      weight: parseFloat(form.weight) || null,
      water_glasses: parseInt(form.water_glasses) || null,
      sleep_hours: parseFloat(form.sleep_hours) || null,
      mood: form.mood || null,
      notes: form.notes || null,
    };

    if (todayEntry) {
      await supabase
        .from('health_journal')
        .update(entryData)
        .eq('id', todayEntry.id);
    } else {
      await supabase
        .from('health_journal')
        .insert(entryData);

      const { data: loyalty } = await supabase
        .from('loyalty')
        .select('points')
        .eq('id', user.id)
        .single();

      await supabase
        .from('loyalty')
        .update({ points: (loyalty?.points || 0) + 10 })
        .eq('id', user.id);
    }

    setModalVisible(false);
    fetchEntries();
    Alert.alert('✅ Saved!', todayEntry ? 'Journal updated!' : 'Journal saved! +10 points earned!');
  };

  const update = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const avgSleep = entries.length
    ? (entries.reduce((s, e) => s + (e.sleep_hours || 0), 0) / entries.length).toFixed(1)
    : 0;

  const avgWater = entries.length
    ? Math.round(entries.reduce((s, e) => s + (e.water_glasses || 0), 0) / entries.length)
    : 0;

  const avgWeight = entries.filter(e => e.weight).length
    ? (entries.filter(e => e.weight).reduce((s, e) => s + e.weight, 0) / entries.filter(e => e.weight).length).toFixed(1)
    : null;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1D9E75" />
      </View>
    );
  }

  const today = new Date().toISOString().split('T')[0];

  return (
    <View style={styles.container}>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Health Journal</Text>
            <Text style={styles.headerSub}>Track your daily wellness</Text>
          </View>
          <TouchableOpacity
            style={styles.logBtn}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.logBtnText}>
              {todayEntry ? '✏️ Edit today' : '+ Log today'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Today card */}
        <TouchableOpacity
          style={styles.todayCard}
          onPress={() => setModalVisible(true)}
        >
          {todayEntry ? (
            <>
              <Text style={styles.todayTitle}>Today's log ✅</Text>
              <View style={styles.todayStats}>
                {todayEntry.weight && (
                  <View style={styles.todayStat}>
                    <Text style={styles.todayStatEmoji}>⚖️</Text>
                    <Text style={styles.todayStatValue}>{todayEntry.weight} kg</Text>
                  </View>
                )}
                {todayEntry.water_glasses && (
                  <View style={styles.todayStat}>
                    <Text style={styles.todayStatEmoji}>💧</Text>
                    <Text style={styles.todayStatValue}>{todayEntry.water_glasses} glasses</Text>
                  </View>
                )}
                {todayEntry.sleep_hours && (
                  <View style={styles.todayStat}>
                    <Text style={styles.todayStatEmoji}>😴</Text>
                    <Text style={styles.todayStatValue}>{todayEntry.sleep_hours}h sleep</Text>
                  </View>
                )}
                {todayEntry.mood && (
                  <View style={styles.todayStat}>
                    <Text style={styles.todayStatEmoji}>{todayEntry.mood}</Text>
                    <Text style={styles.todayStatValue}>Mood</Text>
                  </View>
                )}
              </View>
              {todayEntry.notes && (
                <Text style={styles.todayNotes}>📝 {todayEntry.notes}</Text>
              )}
            </>
          ) : (
            <View style={styles.emptyToday}>
              <Text style={styles.emptyTodayEmoji}>📋</Text>
              <Text style={styles.emptyTodayTitle}>Log your day</Text>
              <Text style={styles.emptyTodaySub}>Track weight, water, sleep and mood • +10 pts</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Averages */}
        {entries.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>30-day averages</Text>
            <View style={styles.avgRow}>
              <View style={styles.avgCard}>
                <Text style={styles.avgEmoji}>😴</Text>
                <Text style={styles.avgValue}>{avgSleep}h</Text>
                <Text style={styles.avgLabel}>Sleep</Text>
              </View>
              <View style={styles.avgCard}>
                <Text style={styles.avgEmoji}>💧</Text>
                <Text style={styles.avgValue}>{avgWater}</Text>
                <Text style={styles.avgLabel}>Glasses/day</Text>
              </View>
              {avgWeight && (
                <View style={styles.avgCard}>
                  <Text style={styles.avgEmoji}>⚖️</Text>
                  <Text style={styles.avgValue}>{avgWeight}</Text>
                  <Text style={styles.avgLabel}>Avg weight</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Journal entries */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Journal history</Text>
          {entries.length === 0 ? (
            <View style={styles.emptyHistory}>
              <Text style={styles.emptyHistoryEmoji}>📖</Text>
              <Text style={styles.emptyHistoryText}>No entries yet. Start logging today!</Text>
            </View>
          ) : (
            entries.map((entry, i) => (
              <View key={entry.id} style={styles.entryCard}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryDate}>{formatDate(entry.date)}</Text>
                  {entry.date === today && (
                    <View style={styles.todayBadge}>
                      <Text style={styles.todayBadgeText}>Today</Text>
                    </View>
                  )}
                  {entry.mood && <Text style={styles.entryMood}>{entry.mood}</Text>}
                </View>
                <View style={styles.entryStats}>
                  {entry.weight && (
                    <Text style={styles.entryStat}>⚖️ {entry.weight} kg</Text>
                  )}
                  {entry.water_glasses && (
                    <Text style={styles.entryStat}>💧 {entry.water_glasses} glasses</Text>
                  )}
                  {entry.sleep_hours && (
                    <Text style={styles.entryStat}>😴 {entry.sleep_hours}h</Text>
                  )}
                </View>
                {entry.notes && (
                  <Text style={styles.entryNotes}>{entry.notes}</Text>
                )}
              </View>
            ))
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Log Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {todayEntry ? 'Edit Today\'s Log' : 'Log Today'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>

              <Text style={styles.inputLabel}>⚖️ Weight (kg)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 72.5"
                placeholderTextColor="#ccc"
                value={form.weight}
                onChangeText={v => update('weight', v)}
                keyboardType="numeric"
              />

              <Text style={styles.inputLabel}>💧 Water (glasses)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 8"
                placeholderTextColor="#ccc"
                value={form.water_glasses}
                onChangeText={v => update('water_glasses', v)}
                keyboardType="numeric"
              />

              <Text style={styles.inputLabel}>😴 Sleep (hours)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 7.5"
                placeholderTextColor="#ccc"
                value={form.sleep_hours}
                onChangeText={v => update('sleep_hours', v)}
                keyboardType="numeric"
              />

              <Text style={styles.inputLabel}>😊 Mood</Text>
              <View style={styles.moodRow}>
                {MOODS.map(mood => (
                  <TouchableOpacity
                    key={mood.emoji}
                    style={[
                      styles.moodBtn,
                      form.mood === mood.emoji && styles.moodBtnActive
                    ]}
                    onPress={() => update('mood', mood.emoji)}
                  >
                    <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                    <Text style={styles.moodLabel}>{mood.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>📝 Notes</Text>
              <TextInput
                style={[styles.input, styles.inputMultiline]}
                placeholder="How was your day? Any observations..."
                placeholderTextColor="#ccc"
                value={form.notes}
                onChangeText={v => update('notes', v)}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />

              <TouchableOpacity style={styles.saveBtn} onPress={saveEntry}>
                <Text style={styles.saveBtnText}>
                  {todayEntry ? 'Update journal' : 'Save journal • +10 pts'}
                </Text>
              </TouchableOpacity>

              <View style={{ height: 20 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 24, paddingTop: 60, backgroundColor: '#fff' },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#1a1a1a' },
  headerSub: { fontSize: 14, color: '#888', marginTop: 4 },
  logBtn: { backgroundColor: '#1D9E75', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  logBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  todayCard: { margin: 16, backgroundColor: '#1D9E75', borderRadius: 20, padding: 20 },
  todayTitle: { fontSize: 15, fontWeight: '600', color: '#fff', marginBottom: 14 },
  todayStats: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  todayStat: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, padding: 10, minWidth: 70 },
  todayStatEmoji: { fontSize: 20, marginBottom: 4 },
  todayStatValue: { fontSize: 12, color: '#fff', fontWeight: '500' },
  todayNotes: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 12, fontStyle: 'italic' },
  emptyToday: { alignItems: 'center', padding: 8 },
  emptyTodayEmoji: { fontSize: 40, marginBottom: 10 },
  emptyTodayTitle: { fontSize: 17, fontWeight: '700', color: '#fff', marginBottom: 6 },
  emptyTodaySub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', textAlign: 'center' },
  section: { backgroundColor: '#fff', margin: 16, marginTop: 0, marginBottom: 12, borderRadius: 16, padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginBottom: 14 },
  avgRow: { flexDirection: 'row', gap: 10 },
  avgCard: { flex: 1, backgroundColor: '#f8f8f8', borderRadius: 12, padding: 14, alignItems: 'center' },
  avgEmoji: { fontSize: 24, marginBottom: 6 },
  avgValue: { fontSize: 18, fontWeight: '700', color: '#1D9E75', marginBottom: 2 },
  avgLabel: { fontSize: 11, color: '#888', textAlign: 'center' },
  emptyHistory: { alignItems: 'center', padding: 24 },
  emptyHistoryEmoji: { fontSize: 40, marginBottom: 10 },
  emptyHistoryText: { fontSize: 14, color: '#888', textAlign: 'center' },
  entryCard: { borderWidth: 0.5, borderColor: '#eee', borderRadius: 12, padding: 14, marginBottom: 10 },
  entryHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  entryDate: { fontSize: 13, fontWeight: '600', color: '#1a1a1a', flex: 1 },
  todayBadge: { backgroundColor: '#E1F5EE', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  todayBadgeText: { fontSize: 11, color: '#1D9E75', fontWeight: '600' },
  entryMood: { fontSize: 20 },
  entryStats: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 6 },
  entryStat: { fontSize: 13, color: '#444' },
  entryNotes: { fontSize: 12, color: '#888', fontStyle: 'italic', marginTop: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '92%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a' },
  modalClose: { fontSize: 18, color: '#888' },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#444', marginBottom: 8, marginTop: 12 },
  input: { borderWidth: 1, borderColor: '#eee', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, color: '#1a1a1a' },
  inputMultiline: { height: 80, paddingTop: 12 },
  moodRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  moodBtn: { alignItems: 'center', padding: 10, borderRadius: 12, borderWidth: 1.5, borderColor: '#eee', flex: 1, marginHorizontal: 2 },
  moodBtnActive: { borderColor: '#1D9E75', backgroundColor: '#E1F5EE' },
  moodEmoji: { fontSize: 22, marginBottom: 4 },
  moodLabel: { fontSize: 10, color: '#888' },
  saveBtn: { backgroundColor: '#1D9E75', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 16 },
  saveBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
});