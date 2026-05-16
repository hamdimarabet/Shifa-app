import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Modal
} from 'react-native';

const ARTICLES = [
  {
    id: 1,
    title: 'How to Lose Weight the Healthy Way',
    category: 'Weight Loss',
    emoji: '🔥',
    readTime: '5 min read',
    date: 'Apr 20, 2026',
    summary: 'Discover science-backed strategies for sustainable weight loss without crash diets.',
    content: `Losing weight doesn't have to mean starving yourself or spending hours at the gym. Here are the most effective, science-backed strategies for sustainable weight loss:

1. EAT MORE PROTEIN
Protein keeps you full longer and boosts metabolism. Aim for 25-30% of your calories from protein sources like eggs, chicken, fish, and legumes.

2. CUT REFINED CARBS
Replace white bread, pasta and sugar with whole grains, vegetables and fruits. This reduces insulin spikes and helps your body burn fat.

3. DRINK MORE WATER
Drinking water before meals reduces hunger and boosts metabolism by 24-30% for 1-1.5 hours. Aim for 2-3 liters per day.

4. MOVE EVERY DAY
You don't need intense workouts. A 30-minute walk daily can make a huge difference. Consistency beats intensity.

5. SLEEP 7-9 HOURS
Poor sleep is one of the biggest risk factors for obesity. It disrupts hunger hormones and increases cravings.

6. TRACK WHAT YOU EAT
Studies show people who track their food intake lose significantly more weight. Use Shifa's meal scanner to help.

Remember: small consistent changes lead to big results over time.`,
  },
  {
    id: 2,
    title: 'The Power of Liver Detox',
    category: 'Detox',
    emoji: '🌿',
    readTime: '4 min read',
    date: 'Apr 18, 2026',
    summary: 'Your liver processes everything you eat. Here is how to keep it healthy and functioning.',
    content: `Your liver is one of the most important organs in your body. It processes nutrients, filters toxins, and produces bile for digestion. Here's how to keep it healthy:

1. REDUCE ALCOHOL
Even moderate alcohol consumption puts stress on the liver. Consider alcohol-free days each week.

2. EAT LIVER-FRIENDLY FOODS
Foods like garlic, grapefruit, beets, leafy greens, olive oil and green tea support liver function naturally.

3. STAY HYDRATED
Water helps flush toxins through your kidneys and liver more efficiently.

4. EXERCISE REGULARLY
Physical activity reduces liver fat and inflammation, protecting against fatty liver disease.

5. AVOID PROCESSED FOODS
Trans fats, excessive sugar and processed foods contribute to fatty liver disease.

6. USE NATURAL SUPPLEMENTS
Milk thistle, turmeric, and dandelion root are proven to support liver health. Shifa's Liver Detox contains all of these.

A healthy liver means better energy, clearer skin, and improved overall health.`,
  },
  {
    id: 3,
    title: 'Intermittent Fasting: Complete Guide',
    category: 'Nutrition',
    emoji: '⏰',
    readTime: '6 min read',
    date: 'Apr 15, 2026',
    summary: 'Everything you need to know about intermittent fasting and how to start today.',
    content: `Intermittent fasting (IF) is one of the most popular health trends in the world. Here's everything you need to know:

WHAT IS INTERMITTENT FASTING?
It's an eating pattern that cycles between periods of fasting and eating. It doesn't specify which foods to eat, but rather when you should eat them.

POPULAR METHODS:
- 16/8 Method: Fast for 16 hours, eat within an 8-hour window (e.g., 12pm-8pm)
- 5:2 Diet: Eat normally 5 days, restrict to 500-600 calories on 2 days
- Eat-Stop-Eat: 24-hour fast once or twice per week

BENEFITS:
- Weight and fat loss
- Improved insulin sensitivity
- Reduced inflammation
- Better brain health
- Longevity benefits

HOW TO START:
1. Choose your method (16/8 is easiest for beginners)
2. Start gradually — try 12 hours first
3. Stay hydrated during fasting
4. Break your fast with nutritious foods
5. Be consistent for at least 4 weeks

IMPORTANT: Consult your doctor before starting if you have any medical conditions.`,
  },
  {
    id: 4,
    title: 'Building Muscle: Nutrition Guide',
    category: 'Fitness',
    emoji: '💪',
    readTime: '5 min read',
    date: 'Apr 12, 2026',
    summary: 'Learn what to eat before and after workouts to maximize muscle growth and recovery.',
    content: `Building muscle requires the right nutrition just as much as the right training. Here's your complete nutrition guide:

PROTEIN IS KING
Aim for 1.6-2.2g of protein per kg of bodyweight. Space it across 4-5 meals throughout the day for optimal muscle protein synthesis.

BEST PROTEIN SOURCES:
- Chicken breast
- Eggs and egg whites
- Greek yogurt
- Tuna and salmon
- Legumes and beans
- Whey protein supplements

PRE-WORKOUT NUTRITION
Eat 1-2 hours before training:
- Complex carbs for energy (oats, rice, sweet potato)
- Moderate protein (chicken, eggs)
- Low fat and fiber (slow digestion)

POST-WORKOUT NUTRITION
Eat within 30-60 minutes after training:
- Fast protein (whey protein shake)
- Fast carbs (banana, white rice)
- This is the most important meal for recovery

CALORIES MATTER
You need a slight caloric surplus (200-300 calories above maintenance) to build muscle effectively.

HYDRATION
Drink at least 3 liters of water daily. Dehydration reduces performance and muscle recovery significantly.`,
  },
  {
    id: 5,
    title: 'Sleep and Weight Loss Connection',
    category: 'Wellness',
    emoji: '😴',
    readTime: '4 min read',
    date: 'Apr 10, 2026',
    summary: 'Poor sleep is silently sabotaging your weight loss goals. Find out why and how to fix it.',
    content: `Most people focus on diet and exercise for weight loss, but sleep is equally important. Here's why:

HOW POOR SLEEP AFFECTS WEIGHT:
- Increases hunger hormones (ghrelin) by up to 28%
- Decreases satiety hormones (leptin) by 18%
- Increases cortisol (stress hormone) which promotes fat storage
- Reduces willpower and increases cravings for junk food
- Decreases insulin sensitivity

HOW MUCH SLEEP DO YOU NEED?
Adults need 7-9 hours per night. Consistently sleeping less than 6 hours is associated with obesity, diabetes and heart disease.

TIPS FOR BETTER SLEEP:
1. Keep a consistent sleep schedule (same time every day)
2. Make your room cool, dark and quiet
3. Avoid screens 1 hour before bed
4. No caffeine after 2pm
5. Exercise regularly (but not right before bed)
6. Avoid alcohol (disrupts sleep quality)
7. Consider magnesium or our Sleep & Calm supplement

THE BOTTOM LINE:
If you're struggling with weight loss despite good diet and exercise, improving your sleep quality might be the missing piece.`,
  },
  {
    id: 6,
    title: 'Gut Health: Your Second Brain',
    category: 'Digestive Health',
    emoji: '🦠',
    readTime: '5 min read',
    date: 'Apr 8, 2026',
    summary: 'Your gut health affects everything from mood to immunity. Learn how to take care of it.',
    content: `Your gut contains trillions of bacteria that influence your health in ways scientists are still discovering. Here's what you need to know:

THE GUT-BRAIN CONNECTION
Your gut has its own nervous system with over 100 million neurons. It produces 95% of your body's serotonin (the happiness hormone). Poor gut health is linked to anxiety, depression and brain fog.

SIGNS OF POOR GUT HEALTH:
- Bloating and gas
- Constipation or diarrhea
- Food intolerances
- Fatigue
- Skin problems
- Frequent illness
- Mood issues

HOW TO IMPROVE GUT HEALTH:
1. EAT MORE FIBER
Vegetables, fruits, legumes and whole grains feed good bacteria.

2. EAT FERMENTED FOODS
Yogurt, kefir, sauerkraut and kimchi contain beneficial probiotics.

3. AVOID ANTIBIOTICS UNLESS NECESSARY
They kill good bacteria along with bad ones.

4. REDUCE STRESS
Chronic stress negatively impacts gut bacteria composition.

5. STAY HYDRATED
Water supports the mucosal lining of the intestines.

6. CONSIDER PROBIOTICS
Shifa's Colon Balance contains proven probiotic strains to restore gut health.`,
  },
];

const CATEGORIES = ['All', 'Weight Loss', 'Detox', 'Nutrition', 'Fitness', 'Wellness', 'Digestive Health'];

export default function BlogScreen() {
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [category, setCategory] = useState('All');

  const filtered = category === 'All'
    ? ARTICLES
    : ARTICLES.filter(a => a.category === category);

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Health Blog</Text>
        <Text style={styles.headerSub}>Expert wellness articles for you</Text>
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categories}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
      >
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[styles.catBtn, category === cat && styles.catBtnActive]}
            onPress={() => setCategory(cat)}
          >
            <Text style={[styles.catText, category === cat && styles.catTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Articles list */}
      <ScrollView
        style={styles.list}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        showsVerticalScrollIndicator={false}
      >
        {filtered.map(article => (
          <TouchableOpacity
            key={article.id}
            style={styles.articleCard}
            onPress={() => setSelectedArticle(article)}
          >
            <View style={styles.articleLeft}>
              <View style={styles.articleEmoji}>
                <Text style={{ fontSize: 28 }}>{article.emoji}</Text>
              </View>
            </View>
            <View style={styles.articleRight}>
              <View style={styles.articleMeta}>
                <Text style={styles.articleCategory}>{article.category}</Text>
                <Text style={styles.articleDate}>{article.date}</Text>
              </View>
              <Text style={styles.articleTitle}>{article.title}</Text>
              <Text style={styles.articleSummary} numberOfLines={2}>
                {article.summary}
              </Text>
              <Text style={styles.readTime}>{article.readTime}</Text>
            </View>
          </TouchableOpacity>
        ))}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Article detail modal */}
      <Modal
        visible={!!selectedArticle}
        animationType="slide"
        onRequestClose={() => setSelectedArticle(null)}
      >
        <View style={styles.articleModal}>
          <View style={styles.articleModalHeader}>
            <TouchableOpacity onPress={() => setSelectedArticle(null)}>
              <Text style={styles.backBtn}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.articleModalCategory}>
              {selectedArticle?.category}
            </Text>
          </View>
          <ScrollView
            style={styles.articleModalContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={{ fontSize: 56, textAlign: 'center', marginBottom: 16 }}>
              {selectedArticle?.emoji}
            </Text>
            <Text style={styles.articleModalTitle}>{selectedArticle?.title}</Text>
            <View style={styles.articleModalMeta}>
              <Text style={styles.articleDate}>{selectedArticle?.date}</Text>
              <Text style={styles.readTime}>{selectedArticle?.readTime}</Text>
            </View>
            <Text style={styles.articleModalBody}>{selectedArticle?.content}</Text>
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  header: { padding: 24, paddingTop: 60, backgroundColor: '#fff' },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#1a1a1a' },
  headerSub: { fontSize: 14, color: '#888', marginTop: 4 },
  categories: { backgroundColor: '#fff', maxHeight: 52, borderBottomWidth: 0.5, borderBottomColor: '#eee' },
  catBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: '#eee', backgroundColor: '#f8f8f8' },
  catBtnActive: { backgroundColor: '#1D9E75', borderColor: '#1D9E75' },
  catText: { fontSize: 12, color: '#888', fontWeight: '500' },
  catTextActive: { color: '#fff' },
  list: { flex: 1 },
  articleCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, padding: 16, gap: 12, elevation: 1 },
  articleLeft: { alignItems: 'center' },
  articleEmoji: { width: 56, height: 56, borderRadius: 16, backgroundColor: '#E1F5EE', alignItems: 'center', justifyContent: 'center' },
  articleRight: { flex: 1 },
  articleMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  articleCategory: { fontSize: 11, color: '#1D9E75', fontWeight: '600' },
  articleDate: { fontSize: 11, color: '#aaa' },
  articleTitle: { fontSize: 14, fontWeight: '700', color: '#1a1a1a', marginBottom: 6, lineHeight: 20 },
  articleSummary: { fontSize: 12, color: '#888', lineHeight: 18, marginBottom: 8 },
  readTime: { fontSize: 11, color: '#aaa' },
  articleModal: { flex: 1, backgroundColor: '#fff' },
  articleModalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: 60, borderBottomWidth: 0.5, borderBottomColor: '#eee' },
  backBtn: { fontSize: 15, color: '#1D9E75', fontWeight: '500' },
  articleModalCategory: { fontSize: 13, color: '#1D9E75', fontWeight: '600' },
  articleModalContent: { flex: 1, padding: 24 },
  articleModalTitle: { fontSize: 24, fontWeight: '700', color: '#1a1a1a', marginBottom: 12, lineHeight: 32 },
  articleModalMeta: { flexDirection: 'row', gap: 16, marginBottom: 24 },
  articleModalBody: { fontSize: 15, color: '#444', lineHeight: 26 },
});