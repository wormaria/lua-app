import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, StatusBar, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomNav from '../components/BottomNav';
import { useUser } from '../context/UserContext';
import { PHASE_INFO, getCycleDay, getPhase, callAI } from '../utils/cycle';

export default function MealsScreen({ navigation }) {
  const { profile } = useUser();
  const { cuisines, lastPeriod } = profile;
  const cycleDay = getCycleDay(lastPeriod);
  const phase = getPhase(cycleDay);
  const phaseInfo = PHASE_INFO[phase];

  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => { generateMeal(true); }, []);

  const generateMeal = async (initial = false) => {
    if (!initial) setGenerating(true);
    try {
      const text = await callAI(
        `You are a nutrition expert specializing in cycle-syncing for Latina women.
The user is in their ${phase} phase. Their favorite cuisines: ${cuisines.join(', ')}.
Suggest a meal different from previous suggestions.
Respond ONLY with a valid JSON object, no markdown:
{
  "emoji": "one food emoji",
  "tag": "Cuisine · ${phase} support",
  "name": "meal name",
  "description": "one sentence on why this supports the ${phase} phase hormonally"
}`
      );
      const meal = JSON.parse(text);
      setMeals(prev => [{ ...meal, id: Date.now() }, ...prev]);
    } catch (e) {
      console.log('Meals error:', e);
    } finally {
      setLoading(false);
      setGenerating(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false}>

        <View style={[styles.header, { backgroundColor: phaseInfo.bg }]}>
          <Text style={styles.headerEyebrow}>{phaseInfo.label} · day {cycleDay}</Text>
          <Text style={styles.headerTitle}>your meals</Text>
          <Text style={styles.headerSub}>cycle-synced for your {phase} phase</Text>
        </View>

        <View style={styles.generateWrap}>
          <TouchableOpacity
            style={[styles.generateBtn, generating && styles.generateBtnDisabled]}
            onPress={() => generateMeal()}
            disabled={generating}
            activeOpacity={0.85}
          >
            {generating
              ? <ActivityIndicator size="small" color="#fff" />
              : <Text style={styles.generateBtnText}>+ generate new meal</Text>}
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>
          {loading
            ? 'finding your meal...'
            : `${meals.length} meal${meals.length !== 1 ? 's' : ''} generated`}
        </Text>

        {loading ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#7F77DD" />
            <Text style={styles.loadingText}>lua is personalizing your meal...</Text>
          </View>
        ) : (
          meals.map(meal => (
            <View key={meal.id} style={styles.mealCard}>
              <View style={styles.mealCardImage}>
                <Text style={styles.mealEmoji}>{meal.emoji}</Text>
              </View>
              <View style={styles.mealCardBody}>
                <View style={styles.mealTagWrap}>
                  <Text style={styles.mealTag}>{meal.tag}</Text>
                </View>
                <Text style={styles.mealName}>{meal.name}</Text>
                <Text style={styles.mealDesc}>{meal.description}</Text>
                <TouchableOpacity
                  style={styles.mealBtnPrimary}
                  activeOpacity={0.85}
                  onPress={() => navigation.navigate('RecipeDetail', { meal, phase, cuisines })}
                >
                  <Text style={styles.mealBtnPrimaryText}>see recipe</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <BottomNav activeTab="Meals" navigation={navigation} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 24, paddingBottom: 24 },
  headerEyebrow: {
    fontSize: 11, color: '#0F6E56', fontWeight: '500',
    letterSpacing: 0.5, marginBottom: 4, textTransform: 'uppercase',
  },
  headerTitle: { fontFamily: 'Georgia', fontSize: 28, color: '#26215C', marginBottom: 6 },
  headerSub: { fontSize: 13, color: '#888' },
  generateWrap: { paddingHorizontal: 16, paddingTop: 16 },
  generateBtn: {
    backgroundColor: '#3C3489', borderRadius: 12,
    paddingVertical: 14, alignItems: 'center',
  },
  generateBtnDisabled: { backgroundColor: '#AFA9EC' },
  generateBtnText: { color: 'white', fontSize: 15, fontWeight: '500' },
  sectionTitle: {
    fontSize: 11, fontWeight: '500', letterSpacing: 0.8,
    textTransform: 'uppercase', color: '#aaa',
    paddingHorizontal: 24, paddingTop: 16, paddingBottom: 10,
  },
  loadingCard: {
    marginHorizontal: 16, borderRadius: 20, padding: 40,
    alignItems: 'center', gap: 12,
    backgroundColor: '#F5F5F3', borderWidth: 0.5, borderColor: '#eee',
  },
  loadingText: { fontSize: 13, color: '#aaa', textAlign: 'center' },
  mealCard: {
    marginHorizontal: 16, borderRadius: 20, overflow: 'hidden',
    borderWidth: 0.5, borderColor: '#eee', marginBottom: 12, backgroundColor: '#fff',
  },
  mealCardImage: {
    height: 120, backgroundColor: '#C0DD97',
    alignItems: 'center', justifyContent: 'center',
  },
  mealEmoji: { fontSize: 52 },
  mealCardBody: { padding: 16 },
  mealTagWrap: { marginBottom: 6 },
  mealTag: {
    fontSize: 11, fontWeight: '500', letterSpacing: 0.5,
    textTransform: 'uppercase', color: '#0F6E56',
    backgroundColor: '#E1F5EE', paddingVertical: 3, paddingHorizontal: 8,
    borderRadius: 6, alignSelf: 'flex-start',
  },
  mealName: { fontSize: 17, fontWeight: '500', color: '#1a1a1a', marginBottom: 6 },
  mealDesc: { fontSize: 13, color: '#888', lineHeight: 20, marginBottom: 12 },
  mealBtnPrimary: {
    backgroundColor: '#3C3489', borderRadius: 12,
    paddingVertical: 11, alignItems: 'center',
  },
  mealBtnPrimaryText: { color: 'white', fontSize: 14, fontWeight: '500' },
});
