import { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Image, Alert
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../lib/supabase';



export default function MealScreen() {
  const [image, setImage] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const pickImage = async (fromCamera) => {
    const permission = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow access to continue.');
      return;
    }

    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.7,
          base64: true,
        })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.7,
          base64: true,
        });

    if (!result.canceled) {
      setImage(result.assets[0]);
      setAnalysis(null);
      analyzeMeal(result.assets[0]);
    }
  };

  const analyzeMeal = async (imageAsset) => {
    setLoading(true);
  
    try {
      const base64 = imageAsset.base64;
      const mimeType = 'image/jpeg';
  
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.EXPO_PUBLIC_OPENAI_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          max_tokens: 800,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:${mimeType};base64,${base64}`,
                  },
                },
                {
                  type: 'text',
                  text: `Analyze this image. If it is food or a meal, provide a nutrition breakdown in this exact JSON format with no extra text:
  {
    "is_food": true,
    "meal_name": "Name of the meal",
    "calories": 450,
    "protein": 25,
    "carbs": 45,
    "fat": 15,
    "fiber": 8,
    "ingredients": ["ingredient 1", "ingredient 2"],
    "health_score": 7,
    "health_note": "Brief health assessment",
    "recommendation": "Personalized tip"
  }
  
  If it is NOT food (like a car, person, object etc.), return:
  {
    "is_food": false,
    "meal_name": "Not a meal",
    "calories": 0,
    "protein": 0,
    "carbs": 0,
    "fat": 0,
    "fiber": 0,
    "ingredients": [],
    "health_score": 0,
    "health_note": "This does not appear to be food",
    "recommendation": "Please take a photo of your meal"
  }`
                }
              ],
            }
          ],
        }),
      });
  
      const data = await response.json();
      const text = data.choices?.[0]?.message?.content || '{}';
  
      let result;
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        result = JSON.parse(jsonMatch ? jsonMatch[0] : text);
      } catch {
        result = {
          is_food: false,
          meal_name: 'Could not analyze',
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          fiber: 0,
          ingredients: [],
          health_score: 0,
          health_note: 'Could not analyze this image',
          recommendation: 'Please try again with a clearer photo of food',
        };
      }
  
      if (!result.is_food) {
        Alert.alert(
          '🚫 Not a meal',
          'This does not look like food. Please take a photo of your meal!',
          [{ text: 'OK' }]
        );
        setLoading(false);
        setImage(null);
        return;
      }
  
      setAnalysis(result);
      setHistory(prev => [
        { ...result, image: imageAsset.uri, time: new Date() },
        ...prev.slice(0, 4)
      ]);
      await addPoints();
  
    } catch (error) {
      console.log('Meal analysis error:', error);
      Alert.alert('Error', 'Could not analyze meal. Please try again.');
    }
  
    setLoading(false);
  };

  const addPoints = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: loyalty } = await supabase
      .from('loyalty')
      .select('points')
      .eq('id', user.id)
      .single();
    await supabase
      .from('loyalty')
      .update({ points: (loyalty?.points || 0) + 50 })
      .eq('id', user.id);
  };

  const healthColor = (score) => {
    if (score >= 8) return '#1D9E75';
    if (score >= 6) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Meal Scanner</Text>
        <Text style={styles.headerSub}>Snap your meal — get instant nutrition</Text>
      </View>

      {/* Scan buttons */}
      <View style={styles.scanButtons}>
        <TouchableOpacity
          style={styles.scanBtn}
          onPress={() => pickImage(true)}
        >
          <Text style={styles.scanBtnEmoji}>📸</Text>
          <Text style={styles.scanBtnText}>Take Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.scanBtn, styles.scanBtnSecondary]}
          onPress={() => pickImage(false)}
        >
          <Text style={styles.scanBtnEmoji}>🖼️</Text>
          <Text style={styles.scanBtnText}>From Gallery</Text>
        </TouchableOpacity>
      </View>

      {/* Points reminder */}
      <View style={styles.pointsReminder}>
        <Text style={styles.pointsReminderText}>📸 Earn +50 points for every meal scan!</Text>
      </View>

      {/* Image preview */}
      {image && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: image.uri }} style={styles.mealImage} />
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.loadingText}>Analyzing your meal...</Text>
            </View>
          )}
        </View>
      )}

      {/* No image state */}
      {!image && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🍽️</Text>
          <Text style={styles.emptyTitle}>Snap your meal</Text>
          <Text style={styles.emptyDesc}>
            Take a photo of any meal and get instant calorie and nutrition analysis powered by AI
          </Text>
        </View>
      )}

      {/* Analysis results */}
      {analysis && !loading && (
        <View style={styles.analysisContainer}>

          {/* Meal name and health score */}
          <View style={styles.mealHeader}>
            <Text style={styles.mealName}>{analysis.meal_name}</Text>
            <View style={[styles.healthScore, { backgroundColor: healthColor(analysis.health_score) }]}>
              <Text style={styles.healthScoreText}>{analysis.health_score}/10</Text>
            </View>
          </View>

          {/* Calories big number */}
          <View style={styles.caloriesCard}>
            <Text style={styles.caloriesValue}>{analysis.calories}</Text>
            <Text style={styles.caloriesLabel}>calories</Text>
          </View>

          {/* Macros */}
          <View style={styles.macrosRow}>
            <View style={styles.macroCard}>
              <Text style={styles.macroValue}>{analysis.protein}g</Text>
              <Text style={styles.macroLabel}>Protein</Text>
              <View style={[styles.macroBar, { backgroundColor: '#3B82F6' }]} />
            </View>
            <View style={styles.macroCard}>
              <Text style={styles.macroValue}>{analysis.carbs}g</Text>
              <Text style={styles.macroLabel}>Carbs</Text>
              <View style={[styles.macroBar, { backgroundColor: '#F59E0B' }]} />
            </View>
            <View style={styles.macroCard}>
              <Text style={styles.macroValue}>{analysis.fat}g</Text>
              <Text style={styles.macroLabel}>Fat</Text>
              <View style={[styles.macroBar, { backgroundColor: '#EF4444' }]} />
            </View>
            <View style={styles.macroCard}>
              <Text style={styles.macroValue}>{analysis.fiber}g</Text>
              <Text style={styles.macroLabel}>Fiber</Text>
              <View style={[styles.macroBar, { backgroundColor: '#1D9E75' }]} />
            </View>
          </View>

          {/* Ingredients */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Detected ingredients</Text>
            <View style={styles.ingredientsRow}>
              {(analysis.ingredients || []).map((ing, i) => (
                <View key={i} style={styles.ingredientTag}>
                  <Text style={styles.ingredientText}>{ing}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Health note */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Health assessment</Text>
            <Text style={styles.healthNote}>{analysis.health_note}</Text>
          </View>

          {/* Recommendation */}
          <View style={[styles.section, styles.recommendationCard]}>
            <Text style={styles.recommendationTitle}>💡 Ria's tip</Text>
            <Text style={styles.recommendationText}>{analysis.recommendation}</Text>
          </View>

          {/* Points earned */}
          <View style={styles.pointsEarned}>
            <Text style={styles.pointsEarnedText}>⭐ +50 points earned for this scan!</Text>
          </View>

        </View>
      )}

      {/* Scan history */}
      {history.length > 0 && (
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>Recent scans</Text>
          {history.map((item, i) => (
            <View key={i} style={styles.historyItem}>
              <Image source={{ uri: item.image }} style={styles.historyImage} />
              <View style={{ flex: 1 }}>
                <Text style={styles.historyName}>{item.meal_name}</Text>
                <Text style={styles.historyCalories}>{item.calories} cal</Text>
              </View>
              <View style={[styles.historyScore, { backgroundColor: healthColor(item.health_score) }]}>
                <Text style={styles.historyScoreText}>{item.health_score}/10</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  header: { padding: 24, paddingTop: 60, backgroundColor: '#fff' },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#1a1a1a' },
  headerSub: { fontSize: 14, color: '#888', marginTop: 4 },
  scanButtons: { flexDirection: 'row', gap: 12, padding: 16 },
  scanBtn: { flex: 1, backgroundColor: '#1D9E75', borderRadius: 16, padding: 20, alignItems: 'center' },
  scanBtnSecondary: { backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#1D9E75' },
  scanBtnEmoji: { fontSize: 28, marginBottom: 8 },
  scanBtnText: { fontSize: 14, fontWeight: '600', color: '#1D9E75' },
  pointsReminder: { marginHorizontal: 16, backgroundColor: '#E1F5EE', borderRadius: 12, padding: 12, marginBottom: 8 },
  pointsReminderText: { fontSize: 13, color: '#1D9E75', fontWeight: '500', textAlign: 'center' },
  imageContainer: { margin: 16, borderRadius: 16, overflow: 'hidden', position: 'relative' },
  mealImage: { width: '100%', height: 220, borderRadius: 16 },
  loadingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', borderRadius: 16 },
  loadingText: { color: '#fff', marginTop: 12, fontSize: 14, fontWeight: '500' },
  emptyState: { margin: 16, backgroundColor: '#fff', borderRadius: 16, padding: 40, alignItems: 'center' },
  emptyEmoji: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#1a1a1a', marginBottom: 8 },
  emptyDesc: { fontSize: 14, color: '#888', textAlign: 'center', lineHeight: 22 },
  analysisContainer: { margin: 16, gap: 12 },
  mealHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', padding: 16, borderRadius: 16 },
  mealName: { fontSize: 18, fontWeight: '700', color: '#1a1a1a', flex: 1 },
  healthScore: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  healthScoreText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  caloriesCard: { backgroundColor: '#1D9E75', borderRadius: 16, padding: 24, alignItems: 'center' },
  caloriesValue: { fontSize: 64, fontWeight: '700', color: '#fff' },
  caloriesLabel: { fontSize: 16, color: 'rgba(255,255,255,0.8)' },
  macrosRow: { flexDirection: 'row', gap: 8 },
  macroCard: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 12, alignItems: 'center' },
  macroValue: { fontSize: 18, fontWeight: '700', color: '#1a1a1a', marginBottom: 4 },
  macroLabel: { fontSize: 11, color: '#888', marginBottom: 8 },
  macroBar: { height: 4, width: '100%', borderRadius: 2 },
  section: { backgroundColor: '#fff', borderRadius: 16, padding: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1a1a1a', marginBottom: 12 },
  ingredientsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  ingredientTag: { backgroundColor: '#E1F5EE', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  ingredientText: { fontSize: 12, color: '#1D9E75' },
  healthNote: { fontSize: 14, color: '#444', lineHeight: 22 },
  recommendationCard: { backgroundColor: '#E1F5EE' },
  recommendationTitle: { fontSize: 15, fontWeight: '700', color: '#1D9E75', marginBottom: 8 },
  recommendationText: { fontSize: 14, color: '#1D9E75', lineHeight: 22 },
  pointsEarned: { backgroundColor: '#FFF9E6', borderRadius: 12, padding: 14, alignItems: 'center' },
  pointsEarnedText: { fontSize: 14, color: '#F59E0B', fontWeight: '600' },
  historySection: { margin: 16, marginTop: 0, backgroundColor: '#fff', borderRadius: 16, padding: 16 },
  historyItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: '#f0f0f0' },
  historyImage: { width: 48, height: 48, borderRadius: 10 },
  historyName: { fontSize: 14, fontWeight: '600', color: '#1a1a1a', marginBottom: 2 },
  historyCalories: { fontSize: 12, color: '#888' },
  historyScore: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  historyScoreText: { color: '#fff', fontSize: 12, fontWeight: '600' },
});