import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useUser } from '../../context/UserContext';

export default function SexScreen({ navigation }) {
  const [selected, setSelected] = useState('');
  const { updateUser } = useUser();

  return (
    <View style={styles.container}>
      <View style={styles.progressBar}>
        <View style={[styles.progress, { width: '57%' }]} />
      </View>
      <Text style={styles.title}>What's your biological sex?</Text>
      <Text style={styles.subtitle}>We support all forms of gender expression. We need this to calculate your body metrics.</Text>
      <View style={styles.optionsRow}>
        <TouchableOpacity
          style={[styles.option, selected === 'Male' && styles.optionActive]}
          onPress={() => setSelected('Male')}
        >
          <Text style={styles.optionIcon}>♂</Text>
          <Text style={[styles.optionText, selected === 'Male' && styles.optionTextActive]}>Male</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.option, selected === 'Female' && styles.optionActive]}
          onPress={() => setSelected('Female')}
        >
          <Text style={styles.optionIcon}>♀</Text>
          <Text style={[styles.optionText, selected === 'Female' && styles.optionTextActive]}>Female</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={[styles.button, !selected && styles.buttonDisabled]}
        onPress={() => {
            if (!selected) return;
            updateUser({ sex: selected });
            navigation.navigate('Activity');
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
  subtitle: { fontSize: 14, color: '#888', textAlign: 'center', marginBottom: 40 },
  optionsRow: { flexDirection: 'row', gap: 16, marginBottom: 32 },
  option: { flex: 1, borderWidth: 1.5, borderColor: '#eee', borderRadius: 16, paddingVertical: 32, alignItems: 'center' },
  optionActive: { borderColor: '#1D9E75', backgroundColor: '#E1F5EE' },
  optionIcon: { fontSize: 32, marginBottom: 8 },
  optionText: { fontSize: 15, color: '#888', fontWeight: '500' },
  optionTextActive: { color: '#1D9E75' },
  button: { backgroundColor: '#1D9E75', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 'auto' },
  buttonDisabled: { backgroundColor: '#ccc' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});