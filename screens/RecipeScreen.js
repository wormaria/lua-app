import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, StatusBar, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PHASE_INFO, callAI } from '../utils/cycle';

export default function RecipeScreen({ route, navigation }) {
  const { meal, phase, cuisines = [] } = route?.params || {};
  const phaseInfo = PHASE_INFO[phase] || PHASE_INFO.luteal;

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadRecipe(); }, []);

  const loadRecipe = async () => {
    try {
      const text = await callAI(
        `You are a chef specializing in cycle-syncing nutrition for Latina women.
Provide a detailed recipe for: ${meal?.name}
This meal supports the ${phase} phase of the menstrual cycle.
Respond ONLY with a valid JSON object, no markdown:
{
  "prepTime": "X min",
  "cookTime": "X min",
  "servings": "X servings",
  "ingredients": ["amount + ingredient"],
  "steps": ["step description"],
  "note": "one sentence on why this meal is especially supportive during the ${phase} phase"
}`,
        1000
      );
      setRecipe(JSON.parse(text));
    } catch (e) {
      console.log('Recipe error:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Text style={styles.backBtnText}>← back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>{meal?.emoji || '🍲'}</Text>
        </View>

        <View style={styles.titleBlock}>
          <View style={styles.tagWrap}>
            <Text style={styles.tag}>{meal?.tag}</Text>
          </View>
          <Text style={styles.mealName}>{meal?.name}</Text>
          <Text style={styles.mealDesc}>{meal?.description}</Text>
        </View>

        {loading ? (
          <View style={styles.loadingBlock}>
            <ActivityIndicator size="large" color="#7F77DD" />
            <Text style={styles.loadingText}>lua is generating your recipe...</Text>
          </View>
        ) : recipe ? (
          <>
            <View style={styles.metaRow}>
              {[
                { label: 'prep', value: recipe.prepTime },
                { label: 'cook', value: recipe.cookTime },
                { label: 'serves', value: recipe.servings },
              ].map(m => (
                <View key={m.label} style={styles.metaItem}>
                  <Text style={styles.metaValue}>{m.value}</Text>
                  <Text style={styles.metaLabel}>{m.label}</Text>
                </View>
              ))}
            </View>

            <View style={[styles.noteCard, { backgroundColor: phaseInfo.bg, borderColor: phaseInfo.color + '44' }]}>
              <Text style={[styles.noteIcon, { color: phaseInfo.color }]}>✦</Text>
              <Text style={[styles.noteText, { color: phaseInfo.color }]}>{recipe.note}</Text>
            </View>

            <Text style={styles.sectionTitle}>ingredients</Text>
            <View style={styles.section}>
              {recipe.ingredients.map((ing, i) => (
                <View key={i} style={styles.ingredientRow}>
                  <View style={[styles.ingredientDot, { backgroundColor: phaseInfo.color }]} />
                  <Text style={styles.ingredientText}>{ing}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.sectionTitle}>instructions</Text>
            <View style={styles.section}>
              {recipe.steps.map((step, i) => (
                <View key={i} style={styles.stepRow}>
                  <View style={[styles.stepNum, { backgroundColor: phaseInfo.color }]}>
                    <Text style={styles.stepNumText}>{i + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </View>
          </>
        ) : (
          <View style={styles.loadingBlock}>
            <Text style={styles.loadingText}>unable to load recipe. please try again.</Text>
          </View>
        )}

        <View style={{ height: 48 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  topBar: { paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { alignSelf: 'flex-start' },
  backBtnText: { fontSize: 15, color: '#3C3489', fontWeight: '500' },
  hero: {
    height: 200, backgroundColor: '#C0DD97',
    alignItems: 'center', justifyContent: 'center',
  },
  heroEmoji: { fontSize: 80 },
  titleBlock: { padding: 20 },
  tagWrap: { marginBottom: 8 },
  tag: {
    fontSize: 11, fontWeight: '500', letterSpacing: 0.5,
    textTransform: 'uppercase', color: '#0F6E56',
    backgroundColor: '#E1F5EE', paddingVertical: 3, paddingHorizontal: 8,
    borderRadius: 6, alignSelf: 'flex-start',
  },
  mealName: { fontFamily: 'Georgia', fontSize: 24, color: '#1a1a1a', marginBottom: 8 },
  mealDesc: { fontSize: 14, color: '#888', lineHeight: 22 },
  loadingBlock: { padding: 40, alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 13, color: '#aaa', textAlign: 'center' },
  metaRow: {
    flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 16,
    borderTopWidth: 0.5, borderBottomWidth: 0.5, borderColor: '#eee',
    justifyContent: 'space-around',
  },
  metaItem: { alignItems: 'center', gap: 3 },
  metaValue: { fontSize: 14, fontWeight: '600', color: '#1a1a1a' },
  metaLabel: { fontSize: 11, color: '#aaa', textTransform: 'uppercase', letterSpacing: 0.5 },
  noteCard: {
    margin: 16, borderRadius: 14, padding: 14,
    flexDirection: 'row', gap: 10, alignItems: 'flex-start', borderWidth: 1,
  },
  noteIcon: { fontSize: 12, marginTop: 2 },
  noteText: { fontSize: 13, lineHeight: 20, flex: 1, fontWeight: '500' },
  sectionTitle: {
    fontSize: 11, fontWeight: '500', letterSpacing: 0.8,
    textTransform: 'uppercase', color: '#aaa',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 10,
  },
  section: { paddingHorizontal: 20, gap: 10 },
  ingredientRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  ingredientDot: { width: 6, height: 6, borderRadius: 3, flexShrink: 0 },
  ingredientText: { fontSize: 14, color: '#333', flex: 1 },
  stepRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  stepNum: {
    width: 24, height: 24, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  stepNumText: { fontSize: 11, color: '#fff', fontWeight: '700' },
  stepText: { fontSize: 14, color: '#333', lineHeight: 22, flex: 1 },
});
