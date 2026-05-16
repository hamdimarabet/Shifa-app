import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useUser } from '../../context/UserContext';

const options = [
  { id: 'sitting', label: 'Mostly sitting', desc: 'Seated work, low movement' },
  { id: 'standing', label: 'Often standing', desc: 'Standing work, occasional walking' },
  { id: 'walking', label: 'Regularly walking', desc: 'Frequent walking, steady activity' },
  { id: 'intense', label: 'Physically intense work', desc: 'Heavy labor, high exertion' },
];

export default function ActivityScreen({ navigation }) {
  const [selected, setSelected] = useState('');
  const { updateUser } = useUser();

  return (
    <View style={styles.container}>
      <View style={styles.progressBar}>
        <View style={[styles.progress, { width: '71%' }]} />
      </View>
      <Text style={styles.title}>How active are you?</Text>
      <Text style={styles.subtitle}>Based on your lifestyle, we can assess your daily calorie requirements.</Text>
      {options.map(opt => (
        <TouchableOpacity
          key={opt.id}
          style={[styles.option, selected === opt.id && styles.optionActive]}
          onPress={() => setSelected(opt.id)}
        >
          <View style={styles.optionText}>
            <Text style={[styles.optionLabel, selected === opt.id && styles.optionLabelActive]}>{opt.label}</Text>
            <Text style={styles.optionDesc}>{opt.desc}</Text>
          </View>
          <View style={[styles.radio, selected === opt.id && styles.radioActive]} />
        </TouchableOpacity>
      ))}
      <TouchableOpacity
        style={[styles.button, !selected && styles.buttonDisabled]}
        onPress={() => {
          if (!selected) return;
          updateUser({ activityLevel: selected });
          navigation.navigate('Goals');
        }}
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
  subtitle: { fontSize: 14, color: '#888', textAlign: 'center', marginBottom: 24 },
  option: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#eee', borderRadius: 12, padding: 16, marginBottom: 12 },
  optionActive: { borderColor: '#1D9E75', backgroundColor: '#E1F5EE' },
  optionText: { flex: 1 },
  optionLabel: { fontSize: 14, fontWeight: '600', color: '#1a1a1a', marginBottom: 2 },
  optionLabelActive: { color: '#1D9E75' },
  optionDesc: { fontSize: 12, color: '#aaa' },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: '#ccc' },
  radioActive: { borderColor: '#1D9E75', backgroundColor: '#1D9E75' },
  button: { backgroundColor: '#1D9E75', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 'auto' },
  buttonDisabled: { backgroundColor: '#ccc' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});