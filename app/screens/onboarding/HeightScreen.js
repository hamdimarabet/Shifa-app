import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  TouchableWithoutFeedback, Keyboard
} from 'react-native';
import { useUser } from '../../context/UserContext';

export default function HeightScreen({ navigation }) {
  const [height, setHeight] = useState('');
  const [unit, setUnit] = useState('cm');
  const { updateUser } = useUser();

  const handleNext = () => {
    if (!height) return;
    updateUser({ height, heightUnit: unit });
    navigation.navigate('Weight');
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.progressBar}>
          <View style={[styles.progress, { width: '28%' }]} />
        </View>
        <Text style={styles.title}>How tall are you?</Text>
        <Text style={styles.subtitle}>Your height will help us calculate important body stats.</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Enter your height"
            placeholderTextColor="#ccc"
            value={height}
            onChangeText={setHeight}
            keyboardType="numeric"
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleNext}
          />
          <View style={styles.unitToggle}>
            <TouchableOpacity
              style={[styles.unitBtn, unit === 'ft' && styles.unitBtnActive]}
              onPress={() => setUnit('ft')}
            >
              <Text style={[styles.unitText, unit === 'ft' && styles.unitTextActive]}>Ft/In</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.unitBtn, unit === 'cm' && styles.unitBtnActive]}
              onPress={() => setUnit('cm')}
            >
              <Text style={[styles.unitText, unit === 'cm' && styles.unitTextActive]}>Cm</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.hint}>Don't worry if you don't know it precisely — you can change this later.</Text>
        <TouchableOpacity
          style={[styles.button, !height && styles.buttonDisabled]}
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
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  input: { flex: 1, borderWidth: 1, borderColor: '#eee', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: '#1a1a1a' },
  unitToggle: { flexDirection: 'row', borderWidth: 1, borderColor: '#eee', borderRadius: 10, overflow: 'hidden' },
  unitBtn: { paddingHorizontal: 14, paddingVertical: 12 },
  unitBtnActive: { backgroundColor: '#1D9E75' },
  unitText: { fontSize: 13, color: '#888' },
  unitTextActive: { color: '#fff', fontWeight: '600' },
  hint: { fontSize: 12, color: '#aaa', textAlign: 'center', marginBottom: 32 },
  button: { backgroundColor: '#1D9E75', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 'auto' },
  buttonDisabled: { backgroundColor: '#ccc' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});