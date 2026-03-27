import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, StatusBar, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomNav from '../components/BottomNav';
import { useUser } from '../context/UserContext';
import { PHASE_INFO, getCycleDay, getPhase, callAI } from '../utils/cycle';

const FALLBACK_MEAL = {
  emoji: '🍲',
  tag: 'Brazilian · luteal support',
  name: 'Caldo de Feijão with Brown Rice',
  description: 'Rich in magnesium & B6 to ease PMS symptoms. A warm, grounding bowl that supports progesterone balance.',
};

const FALLBACK_WORKOUT = {
  emoji: '🧘',
  name: 'Yin Yoga Flow',
  duration: '35 min',
  intensity: 'low intensity',
};

async function fetchRecommendations(phase, cuisines) {
  const text = await callAI(
    `You are a nutrition and wellness expert specializing in cycle-syncing for women.
The user is in their ${phase} phase. Their favorite cuisines: ${cuisines.join(', ')}.
Respond ONLY with a valid JSON object, no markdown:
{
  "meal": {
    "emoji": "one food emoji",
    "tag": "Cuisine · ${phase} support",
    "name": "meal name",
    "description": "one sentence on why this supports the ${phase} phase hormonally"
  },
  "workout": {
    "emoji": "one workout emoji",
    "name": "workout name",
    "duration": "X min",
    "intensity": "low intensity OR medium intensity OR high intensity"
  }
}`
  );
  return JSON.parse(text);
}

export default function HomeScreen({ navigation }) {
  const { profile } = useUser();
  const { name, cuisines, lastPeriod } = profile;

  const cycleDay = getCycleDay(lastPeriod);
  const phase = getPhase(cycleDay);
  const phaseInfo = PHASE_INFO[phase];

  const [meal, setMeal] = useState(FALLBACK_MEAL);
  const [workout, setWorkout] = useState(FALLBACK_WORKOUT);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);

  // Re-fetch whenever the phase or cuisine selection changes
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchRecommendations(phase, cuisines)
      .then(result => {
        if (!cancelled) {
          setMeal(result.meal);
          setWorkout(result.workout);
        }
      })
      .catch(e => console.log('API error, using fallback:', e))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [phase, cuisines.join(',')]);

  const regenerateMeal = async () => {
    setRegenerating(true);
    try {
      const result = await fetchRecommendations(phase, cuisines);
      setMeal(result.meal);
    } catch (e) {
      console.log('Regenerate error:', e);
    } finally {
      setRegenerating(false);
    }
  };

  const firstName = name ? name.trim().split(' ')[0] : null;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={[styles.header, { backgroundColor: phaseInfo.bg }]}>
          <Text style={styles.greeting}>
            {firstName ? `good morning, ${firstName} ✦` : 'good morning ✦'}
          </Text>
          <Text style={styles.headerTitle}>day {cycleDay} of your cycle</Text>
          <View style={[styles.phaseBadge, { borderColor: phaseInfo.color + '44' }]}>
            <View style={[styles.phaseDot, { backgroundColor: phaseInfo.color }]} />
            <Text style={[styles.phaseLabel, { color: phaseInfo.color }]}>{phaseInfo.label}</Text>
          </View>
        </View>

        {/* Cycle Bar */}
        <View style={styles.cycleBarWrap}>
          <View style={styles.cycleBarLabels}>
            <Text style={styles.cycleBarLabel}>day 1</Text>
            <Text style={styles.cycleBarLabel}>day 28</Text>
          </View>
          <View style={styles.cycleBarTrack}>
            <View style={[styles.cycleBarFill, { width: `${(cycleDay / 28) * 100}%` }]} />
          </View>
          <View style={styles.phaseLabelsRow}>
            {['menstrual', 'follicular', 'ovulation', 'luteal'].map(p => (
              <Text key={p} style={[styles.phaseLabelSmall, p === phase && styles.phaseLabelActive]}>
                {p.slice(0, 3)}
              </Text>
            ))}
          </View>
        </View>

        {/* Cuisines */}
        <View style={styles.cuisineRow}>
          <Text style={styles.cuisineRowLabel}>your cuisines  </Text>
          {cuisines.slice(0, 3).map(c => (
            <View key={c} style={styles.cuisineChip}>
              <Text style={styles.cuisineChipText}>{c}</Text>
            </View>
          ))}
          {cuisines.length > 3 && (
            <View style={styles.cuisineChip}>
              <Text style={styles.cuisineChipText}>+{cuisines.length - 3}</Text>
            </View>
          )}
        </View>

        {/* Meal Card */}
        <Text style={styles.sectionTitle}>today's meal</Text>
        {loading ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#7F77DD" />
            <Text style={styles.loadingText}>lua is personalizing your meal...</Text>
          </View>
        ) : (
          <View style={styles.mealCard}>
            <View style={styles.mealCardImage}>
              <Text style={styles.mealEmoji}>{meal.emoji}</Text>
            </View>
            <View style={styles.mealCardBody}>
              <View style={styles.mealTagWrap}>
                <Text style={styles.mealTag}>{meal.tag}</Text>
              </View>
              <Text style={styles.mealName}>{meal.name}</Text>
              <Text style={styles.mealDesc}>{meal.description}</Text>
              <View style={styles.mealActions}>
                <TouchableOpacity
                  style={styles.mealBtnPrimary}
                  activeOpacity={0.85}
                  onPress={() => navigation.navigate('RecipeDetail', { meal, phase, cuisines })}
                >
                  <Text style={styles.mealBtnPrimaryText}>see recipe</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.mealBtnGhost}
                  onPress={regenerateMeal}
                  activeOpacity={0.75}
                  disabled={regenerating}
                >
                  {regenerating
                    ? <ActivityIndicator size="small" color="#3C3489" />
                    : <Text style={styles.mealBtnGhostText}>regenerate ↺</Text>}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Workout Card */}
        <Text style={styles.sectionTitle}>today's workout</Text>
        {loading ? (
          <View style={styles.loadingCardSmall}>
            <ActivityIndicator size="small" color="#7F77DD" />
          </View>
        ) : (
          <View style={styles.workoutCard}>
            <Text style={styles.workoutEmoji}>{workout.emoji}</Text>
            <View style={styles.workoutInfo}>
              <Text style={styles.workoutName}>{workout.name}</Text>
              <Text style={styles.workoutMeta}>{workout.duration} · {workout.intensity}</Text>
            </View>
            <View style={styles.workoutBadge}>
              <Text style={styles.workoutBadgeText}>{phase}</Text>
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <BottomNav activeTab="Home" navigation={navigation} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 24, paddingBottom: 28 },
  greeting: { fontSize: 13, color: '#0F6E56', fontWeight: '500', marginBottom: 4 },
  headerTitle: { fontFamily: 'Georgia', fontSize: 28, color: '#26215C', marginBottom: 12 },
  phaseBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    alignSelf: 'flex-start', backgroundColor: 'white',
    borderRadius: 100, paddingVertical: 6, paddingHorizontal: 12,
    borderWidth: 0.5,
  },
  phaseDot: { width: 8, height: 8, borderRadius: 4 },
  phaseLabel: { fontSize: 13, fontWeight: '500' },
  cycleBarWrap: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 8 },
  cycleBarLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  cycleBarLabel: { fontSize: 11, color: '#aaa' },
  cycleBarTrack: { height: 8, borderRadius: 100, backgroundColor: '#F0EFF8', overflow: 'hidden' },
  cycleBarFill: { height: '100%', borderRadius: 100, backgroundColor: '#7F77DD' },
  phaseLabelsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  phaseLabelSmall: { fontSize: 10, color: '#ccc', textTransform: 'uppercase', letterSpacing: 0.5 },
  phaseLabelActive: { color: '#7F77DD', fontWeight: '600' },
  cuisineRow: {
    flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap',
    paddingHorizontal: 24, paddingVertical: 12, gap: 6,
  },
  cuisineRowLabel: { fontSize: 12, color: '#aaa' },
  cuisineChip: {
    backgroundColor: '#EEEDFE', borderRadius: 100,
    paddingVertical: 4, paddingHorizontal: 10,
  },
  cuisineChipText: { fontSize: 12, color: '#3C3489', fontWeight: '500' },
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
  loadingCardSmall: {
    marginHorizontal: 16, borderRadius: 20, padding: 24,
    alignItems: 'center', backgroundColor: '#F5F5F3',
  },
  mealCard: {
    marginHorizontal: 16, borderRadius: 20, overflow: 'hidden',
    borderWidth: 0.5, borderColor: '#eee', marginBottom: 8, backgroundColor: '#fff',
  },
  mealCardImage: {
    height: 140, backgroundColor: '#C0DD97',
    alignItems: 'center', justifyContent: 'center',
  },
  mealEmoji: { fontSize: 60 },
  mealCardBody: { padding: 16 },
  mealTagWrap: { marginBottom: 6 },
  mealTag: {
    fontSize: 11, fontWeight: '500', letterSpacing: 0.5,
    textTransform: 'uppercase', color: '#0F6E56',
    backgroundColor: '#E1F5EE', paddingVertical: 3, paddingHorizontal: 8,
    borderRadius: 6, alignSelf: 'flex-start',
  },
  mealName: { fontSize: 17, fontWeight: '500', color: '#1a1a1a', marginBottom: 6 },
  mealDesc: { fontSize: 13, color: '#888', lineHeight: 20 },
  mealActions: { flexDirection: 'row', gap: 8, marginTop: 14 },
  mealBtnPrimary: {
    flex: 1, backgroundColor: '#3C3489', borderRadius: 12,
    paddingVertical: 11, alignItems: 'center',
  },
  mealBtnPrimaryText: { color: 'white', fontSize: 14, fontWeight: '500' },
  mealBtnGhost: {
    flex: 1, backgroundColor: '#F5F5F3', borderRadius: 12,
    paddingVertical: 11, alignItems: 'center',
    borderWidth: 0.5, borderColor: '#eee',
  },
  mealBtnGhostText: { color: '#1a1a1a', fontSize: 14 },
  workoutCard: {
    marginHorizontal: 16, backgroundColor: '#F5F5F3', borderRadius: 20,
    padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14,
  },
  workoutEmoji: { fontSize: 38 },
  workoutInfo: { flex: 1 },
  workoutName: { fontSize: 15, fontWeight: '500', color: '#1a1a1a' },
  workoutMeta: { fontSize: 13, color: '#888', marginTop: 2 },
  workoutBadge: {
    backgroundColor: '#EEEDFE', borderRadius: 100,
    paddingVertical: 6, paddingHorizontal: 12,
  },
  workoutBadgeText: { color: '#3C3489', fontSize: 12, fontWeight: '500' },
});
