import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useUser } from '../../context/UserContext';

const GOALS = [
  {
    id: 'weight_loss',
    label: 'Weight Loss',
    emoji: '🔥',
    desc: 'Lose weight and burn fat'
  },
  {
    id: 'muscle_gain',
    label: 'Muscle Gain',
    emoji: '💪',
    desc: 'Build muscle and strength'
  },
  {
    id: 'general_wellness',
    label: 'General Wellness',
    emoji: '🌿',
    desc: 'Stay healthy and balanced'
  },
];

export default function GoalsScreen({ navigation }) {
  const [selected, setSelected] = useState('');
  const { updateUser } = useUser();

  const handleNext = () => {
    if (!selected) return;
    updateUser({ goals: [selected] });
    navigation.navigate('MedicalConditions');
  };

  return (
    <View style={styles.container}>
      <View style={styles.progressBar}>
        <View style={[styles.progress, { width: '85%' }]} />
      </View>
      <Text style={styles.title}>What is your goal?</Text>
      <Text style={styles.subtitle}>Select one goal to personalize your experience.</Text>

      {GOALS.map(goal => (
        <TouchableOpacity
          key={goal.id}
          style={[styles.option, selected === goal.id && styles.optionActive]}
          onPress={() => setSelected(goal.id)}
        >
          <Text style={styles.optionEmoji}>{goal.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.optionLabel, selected === goal.id && styles.optionLabelActive]}>
              {goal.label}
            </Text>
            <Text style={styles.optionDesc}>{goal.desc}</Text>
          </View>
          <View style={[styles.radio, selected === goal.id && styles.radioActive]} />
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={[styles.button, !selected && styles.buttonDisabled]}
        onPress={handleNext}
        disabled={!selected}
      >
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 28, paddingTop: 60, paddingBottom: 48 },
  progressBar: { height: 4, backgroundColor: '#eee', borderRadius: 2, marginBottom: 48 },
  progress: { height: 4, backgroundColor: '#1D9E75', borderRadius: 2 },
  title: { fontSize: 26, fontWeight: '700', color: '#1a1a1a', marginBottom: 12, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#888', textAlign: 'center', marginBottom: 32 },
  option: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#eee', borderRadius: 14, padding: 18, marginBottom: 14, gap: 14 },
  optionActive: { borderColor: '#1D9E75', backgroundColor: '#E1F5EE' },
  optionEmoji: { fontSize: 28 },
  optionLabel: { fontSize: 16, fontWeight: '600', color: '#1a1a1a', marginBottom: 3 },
  optionLabelActive: { color: '#1D9E75' },
  optionDesc: { fontSize: 12, color: '#888' },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#ccc' },
  radioActive: { borderColor: '#1D9E75', backgroundColor: '#1D9E75' },
  button: { backgroundColor: '#1D9E75', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 'auto' },
  buttonDisabled: { backgroundColor: '#ccc' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});