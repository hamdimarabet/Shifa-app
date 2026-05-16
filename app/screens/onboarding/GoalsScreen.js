import { useState } from 'react';
import {
  View, Text, TouchableOpacity,
  ScrollView, StyleSheet, ActivityIndicator, Alert
} from 'react-native';
import { supabase } from '../../lib/supabase';
import { useUser } from '../../context/UserContext';

const goals = [
  { id: 'coach', label: 'Coach guidance' },
  { id: 'snap', label: 'SNAP' },
  { id: 'diet', label: 'Diet plan' },
  { id: 'weightloss', label: 'Weight loss' },
  { id: 'glp1', label: 'GLP-1' },
  { id: 'fasting', label: 'Intermittent fasting' },
  { id: 'calories', label: 'Calorie tracker' },
  { id: 'muscle', label: 'Muscle gain' },
  { id: 'yoga', label: 'Workouts and yoga' },
  { id: 'healthy', label: 'Healthy foods' },
];

export default function GoalsScreen({ navigation }) {
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const { userData } = useUser();

  const toggle = (id) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleFinish = async () => {
    if (selected.length === 0) return;
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from('user_profiles')
      .insert({
        id: user.id,
        name: userData.name,
        height: parseFloat(userData.height),
        height_unit: userData.heightUnit,
        weight: parseFloat(userData.weight),
        weight_unit: userData.weightUnit,
        sex: userData.sex,
        activity_level: userData.activityLevel,
        goals: selected,
      });

    if (error) {
      Alert.alert('Error saving profile', error.message);
      setLoading(false);
      return;
    }

    await supabase
      .from('loyalty')
      .insert({ id: user.id, points: 50 });

    setLoading(false);
    navigation.navigate('MainApp');
  };

  return (
    <View style={styles.container}>
      <View style={styles.progressBar}>
        <View style={[styles.progress, { width: '100%' }]} />
      </View>
      <Text style={styles.title}>What are you looking for?</Text>
      <Text style={styles.subtitle}>Select one or more options to tailor your experience.</Text>
      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {goals.map(goal => (
          <TouchableOpacity
            key={goal.id}
            style={[styles.option, selected.includes(goal.id) && styles.optionActive]}
            onPress={() => toggle(goal.id)}
          >
            <Text style={[styles.optionLabel, selected.includes(goal.id) && styles.optionLabelActive]}>
              {goal.label}
            </Text>
            <View style={[styles.checkbox, selected.includes(goal.id) && styles.checkboxActive]}>
              {selected.includes(goal.id) && <Text style={styles.checkmark}>✓</Text>}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <TouchableOpacity
        style={[styles.button, (selected.length === 0 || loading) && styles.buttonDisabled]}
        onPress={handleFinish}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.buttonText}>Finish</Text>
        }
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 28, paddingTop: 60, paddingBottom: 48 },
  progressBar: { height: 4, backgroundColor: '#eee', borderRadius: 2, marginBottom: 48 },
  progress: { height: 4, backgroundColor: '#1D9E75', borderRadius: 2 },
  title: { fontSize: 26, fontWeight: '700', color: '#1a1a1a', marginBottom: 12, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#888', textAlign: 'center', marginBottom: 24 },
  list: { flex: 1, marginBottom: 16 },
  option: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#eee', borderRadius: 12, padding: 16, marginBottom: 10 },
  optionActive: { borderColor: '#1D9E75', backgroundColor: '#E1F5EE' },
  optionLabel: { flex: 1, fontSize: 14, fontWeight: '500', color: '#1a1a1a' },
  optionLabelActive: { color: '#1D9E75' },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: '#ccc', alignItems: 'center', justifyContent: 'center' },
  checkboxActive: { backgroundColor: '#1D9E75', borderColor: '#1D9E75' },
  checkmark: { color: '#fff', fontSize: 13, fontWeight: '700' },
  button: { backgroundColor: '#1D9E75', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  buttonDisabled: { backgroundColor: '#ccc' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});