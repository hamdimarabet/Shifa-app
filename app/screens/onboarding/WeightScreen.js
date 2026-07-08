import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  TouchableWithoutFeedback, Keyboard
} from 'react-native';
import { useUser } from '../../context/UserContext';

export default function WeightScreen({ navigation }) {
  const [weight, setWeight] = useState('');
  const [unit, setUnit] = useState('kg');
  const { updateUser } = useUser();

  const handleNext = () => {
    if (!weight) return;
    updateUser({ weight, weightUnit: unit });
    navigation.navigate('Sex');
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.progressBar}>
          <View style={[styles.progress, { width: '42%' }]} />
        </View>
        <Text style={styles.title}>What's your current weight?</Text>
        <Text style={styles.subtitle}>This will help us determine your goal and monitor your progress.</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Enter your weight"
            placeholderTextColor="#ccc"
            value={weight}
            onChangeText={setWeight}
            keyboardType="numeric"
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleNext}
          />
          <View style={styles.unitToggle}>
            <TouchableOpacity
              style={[styles.unitBtn, unit === 'kg' && styles.unitBtnActive]}
              onPress={() => setUnit('kg')}
            >
              <Text style={[styles.unitText, unit === 'kg' && styles.unitTextActive]}>Kg</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.unitBtn, unit === 'lb' && styles.unitBtnActive]}
              onPress={() => setUnit('lb')}
            >
              <Text style={[styles.unitText, unit === 'lb' && styles.unitTextActive]}>Lb</Text>
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.button, !weight && styles.buttonDisabled]}
          onPress={handleNext}
        >
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 28, paddingTop: 60, paddingBottom: 48 },
  progressBar: { height: 4, backgroundColor: '#eee', borderRadius: 2, marginBottom: 48 },
  progress: { height: 4, backgroundColor: '#1D9E75', borderRadius: 2 },
  title: { fontSize: 26, fontWeight: '700', color: '#1a1a1a', marginBottom: 12, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#888', textAlign: 'center', marginBottom: 32 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 32 },
  input: { flex: 1, borderWidth: 1, borderColor: '#eee', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: '#1a1a1a' },
  unitToggle: { flexDirection: 'row', borderWidth: 1, borderColor: '#eee', borderRadius: 10, overflow: 'hidden' },
  unitBtn: { paddingHorizontal: 14, paddingVertical: 12 },
  unitBtnActive: { backgroundColor: '#1D9E75' },
  unitText: { fontSize: 13, color: '#888' },
  unitTextActive: { color: '#fff', fontWeight: '600' },
  button: { backgroundColor: '#1D9E75', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 'auto' },
  buttonDisabled: { backgroundColor: '#ccc' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});