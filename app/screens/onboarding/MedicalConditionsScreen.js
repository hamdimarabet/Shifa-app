import { useState } from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, ScrollView, ActivityIndicator, Alert
} from 'react-native';
import { useUser } from '../../context/UserContext';
import { supabase } from '../../lib/supabase';

const CONDITIONS = [
  { id: 'pregnancy', label: 'Pregnancy', emoji: '🤰', desc: 'Currently pregnant' },
  { id: 'breastfeeding', label: 'Breastfeeding', emoji: '🤱', desc: 'Currently breastfeeding' },
  { id: 'hypertension', label: 'Hypertension', emoji: '❤️', desc: 'High blood pressure' },
  { id: 'diabetes', label: 'Diabetes', emoji: '🩸', desc: 'Type 1 or Type 2 diabetes' },
];

export default function MedicalConditionsScreen({ navigation }) {
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const { userData } = useUser();

  const toggle = (id) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleFinish = async () => {
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('user_profiles')
        .insert({
          id: user.id,
          name: userData.name,
          age: userData.age ? parseInt(userData.age) : null,
          height: parseFloat(userData.height),
          height_unit: userData.heightUnit || 'cm',
          weight: parseFloat(userData.weight),
          weight_unit: userData.weightUnit || 'kg',
          sex: userData.sex,
          activity_level: userData.activityLevel,
          goals: userData.goals || [],
          medical_conditions: selected,
        });

      if (error) {
        Alert.alert('Error saving profile', error.message);
        setLoading(false);
        return;
      }

      await supabase
        .from('loyalty')
        .insert({ id: user.id, points: 50 });

    } catch (error) {
      console.log('Save error:', error);
    }

    setLoading(false);
    navigation.navigate('MainApp');
  };

  return (
    <View style={styles.container}>
      <View style={styles.progressBar}>
        <View style={[styles.progress, { width: '100%' }]} />
      </View>
      <Text style={styles.title}>Any medical conditions?</Text>
      <Text style={styles.subtitle}>
        This helps us personalize your recommendations safely.
        Select all that apply or skip if none.
      </Text>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {CONDITIONS.map(condition => (
          <TouchableOpacity
            key={condition.id}
            style={[
              styles.option,
              selected.includes(condition.id) && styles.optionActive
            ]}
            onPress={() => toggle(condition.id)}
          >
            <Text style={styles.optionEmoji}>{condition.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[
                styles.optionLabel,
                selected.includes(condition.id) && styles.optionLabelActive
              ]}>
                {condition.label}
              </Text>
              <Text style={styles.optionDesc}>{condition.desc}</Text>
            </View>
            <View style={[
              styles.checkbox,
              selected.includes(condition.id) && styles.checkboxActive
            ]}>
              {selected.includes(condition.id) && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
        <View style={{ height: 20 }} />
      </ScrollView>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleFinish}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.buttonText}>
              {selected.length > 0 ? 'Finish' : 'Skip & Finish'}
            </Text>
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
  subtitle: { fontSize: 14, color: '#888', textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  option: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#eee', borderRadius: 14, padding: 16, marginBottom: 12, gap: 14 },
  optionActive: { borderColor: '#1D9E75', backgroundColor: '#E1F5EE' },
  optionEmoji: { fontSize: 28 },
  optionLabel: { fontSize: 15, fontWeight: '600', color: '#1a1a1a', marginBottom: 3 },
  optionLabelActive: { color: '#1D9E75' },
  optionDesc: { fontSize: 12, color: '#888' },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: '#ccc', alignItems: 'center', justifyContent: 'center' },
  checkboxActive: { backgroundColor: '#1D9E75', borderColor: '#1D9E75' },
  checkmark: { color: '#fff', fontSize: 14, fontWeight: '700' },
  button: { backgroundColor: '#1D9E75', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  buttonDisabled: { backgroundColor: '#ccc' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});