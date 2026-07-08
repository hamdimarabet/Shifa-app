import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  TouchableWithoutFeedback, Keyboard
} from 'react-native';
import { useUser } from '../../context/UserContext';

export default function NameScreen({ navigation }) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const { updateUser } = useUser();

  const handleNext = () => {
    if (!name || !age) return;
    updateUser({ name, age });
    navigation.navigate('Height');
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.progressBar}>
          <View style={[styles.progress, { width: '14%' }]} />
        </View>
        <Text style={styles.title}>Tell us about you</Text>
        <Text style={styles.subtitle}>We need a few details to personalize your experience.</Text>
        <Text style={styles.label}>What is your name?</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your name"
          placeholderTextColor="#ccc"
          value={name}
          onChangeText={setName}
          autoFocus
          returnKeyType="next"
        />
        <Text style={styles.label}>How old are you?</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your age"
          placeholderTextColor="#ccc"
          value={age}
          onChangeText={setAge}
          keyboardType="numeric"
          maxLength={3}
          returnKeyType="done"
          onSubmitEditing={handleNext}
        />
        <TouchableOpacity
          style={[styles.button, (!name || !age) && styles.buttonDisabled]}
          onPress={handleNext}
          disabled={!name || !age}
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
  title: { fontSize: 26, fontWeight: '700', color: '#1a1a1a', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#888', textAlign: 'center', marginBottom: 32 },
  label: { fontSize: 14, fontWeight: '600', color: '#444', marginBottom: 8, marginTop: 8 },
  input: { borderWidth: 1, borderColor: '#eee', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: '#1a1a1a', marginBottom: 16 },
  button: { backgroundColor: '#1D9E75', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 'auto' },
  buttonDisabled: { backgroundColor: '#ccc' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});