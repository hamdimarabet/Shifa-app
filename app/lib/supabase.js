import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://fvelzzxktroqfyhyvuku.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2ZWx6enhrdHJvcWZ5aHl2dWt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMTQyNTcsImV4cCI6MjA5MTY5MDI1N30.5_jZcDAnHJ4fLWYC5O4meOL4h1Lrp9oq8pGDRRyuKP0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});