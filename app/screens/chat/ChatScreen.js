import { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, ActivityIndicator,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { supabase } from '../../lib/supabase';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function ChatScreen({ navigation }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm Ria, your personal wellness assistant. I can help you with nutrition, fitness, health insights and personalized advice. What can I help you with today?",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => { fetchProfile(); }, []);
  useEffect(() => { scrollRef.current?.scrollToEnd({ animated: true }); }, [messages]);

  const fetchProfile = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) return;
      const { data, error } = await supabase
        .from('user_profiles').select('*').eq('id', user.id).single();
      if (error) return;
      setProfile(data);
    } catch (error) {
      console.log('FETCH PROFILE ERROR:', error);
    }
  };

  const addPoints = async (pts) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: loyalty } = await supabase
        .from('loyalty').select('points').eq('id', user.id).single();
      await supabase.from('loyalty').upsert({
        id: user.id,
        points: (loyalty?.points || 0) + pts,
      });
    } catch (error) {
      console.log('ADD POINTS ERROR:', error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    await addPoints(50);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const safeGoals = Array.isArray(profile?.goals)
        ? profile.goals
        : profile?.goals ? [profile.goals] : [];

      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userMessage.content,
          user_id: user?.id || 'demo_user',
          age: Number(profile?.age) || 0,
          weight: Number(profile?.weight) || 0,
          height: Number(profile?.height) || 0,
          goals: safeGoals,
          preferences: profile?.preferences || '',
          activity_info: profile?.activity_info || '',
          history: '',
          chat_history: newMessages.map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error('Chat API failed');

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.answer || data.response || data.message || 'No response',
      }]);

    } catch (error) {
      console.log('CHAT ERROR:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Sorry, I'm having trouble connecting right now. Please try again.",
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerName}>Ria</Text>
          <Text style={styles.headerSub}>Your wellness assistant</Text>
        </View>
        <View style={styles.onlineIndicator} />
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.messages}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg, i) => (
          <View key={i} style={[styles.bubble, msg.role === 'user' ? styles.userBubble : styles.aiBubble]}>
            {msg.role === 'assistant' && <Text style={styles.riaLabel}>Ria</Text>}
            <Text style={[styles.bubbleText, msg.role === 'user' ? styles.userText : styles.aiText]}>
              {msg.content}
            </Text>
          </View>
        ))}
        {loading && (
          <View style={styles.aiBubble}>
            <Text style={styles.riaLabel}>Ria</Text>
            <ActivityIndicator size="small" color="#1D9E75" />
          </View>
        )}
      </ScrollView>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Ask Ria anything..."
          placeholderTextColor="#ccc"
          value={input}
          onChangeText={setInput}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
          onPress={sendMessage}
          disabled={!input.trim() || loading}
        >
          <Text style={styles.sendBtnText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 60, backgroundColor: '#fff', borderBottomWidth: 0.5, borderBottomColor: '#eee' },
  backBtn: { fontSize: 15, color: '#1D9E75', fontWeight: '500' },
  headerCenter: { alignItems: 'center' },
  headerName: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  headerSub: { fontSize: 12, color: '#888' },
  onlineIndicator: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#1D9E75' },
  messages: { flex: 1 },
  bubble: { maxWidth: '80%', borderRadius: 16, padding: 12, marginBottom: 12 },
  userBubble: { backgroundColor: '#1D9E75', alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  aiBubble: { backgroundColor: '#fff', alignSelf: 'flex-start', borderBottomLeftRadius: 4, elevation: 2 },
  riaLabel: { fontSize: 11, color: '#1D9E75', fontWeight: '600', marginBottom: 4 },
  bubbleText: { fontSize: 15, lineHeight: 22 },
  userText: { color: '#fff' },
  aiText: { color: '#1a1a1a' },
  inputRow: { flexDirection: 'row', padding: 12, backgroundColor: '#fff', borderTopWidth: 0.5, borderTopColor: '#eee', gap: 8, alignItems: 'flex-end' },
  input: { flex: 1, borderWidth: 1, borderColor: '#eee', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, color: '#1a1a1a', maxHeight: 100 },
  sendBtn: { backgroundColor: '#1D9E75', borderRadius: 20, paddingHorizontal: 18, paddingVertical: 10 },
  sendBtnDisabled: { backgroundColor: '#ccc' },
  sendBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
});