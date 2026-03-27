import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  StatusBar, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomNav from '../components/BottomNav';
import { useUser } from '../context/UserContext';
import { PHASE_INFO, getCycleDay, getPhase, callAI } from '../utils/cycle';

const PHASE_WORKOUT_INFO = {
  menstrual: {
    headline: 'rest & gentle movement',
    intensityLabel: 'low intensity',
    advice: 'Your body is shedding and needs rest. Focus on gentle movement that reduces cramps and supports circulation.',
  },
  follicular: {
    headline: 'build strength & try new things',
    intensityLabel: 'medium–high intensity',
    advice: 'Rising estrogen boosts energy and mood. This is a great time to try new workout styles and push yourself.',
  },
  ovulation: {
    headline: 'peak performance',
    intensityLabel: 'high intensity',
    advice: "You're at peak strength and coordination. Take on your most challenging workouts and set personal records.",
  },
  luteal: {
    headline: 'steady & sustainable',
    intensityLabel: 'low–medium intensity',
    advice: 'Progesterone rises and energy dips. Focus on maintaining consistency with steady, nourishing movement.',
  },
};

const FALLBACK_WORKOUTS = {
  menstrual: [
    { emoji: '🚶', name: 'Gentle Walk', duration: '30 min', intensity: 'low intensity', benefit: 'Supports circulation without taxing your body during rest phase.' },
    { emoji: '🧘', name: 'Yin Yoga', duration: '40 min', intensity: 'low intensity', benefit: 'Deep stretching eases tension and promotes relaxation.' },
    { emoji: '🌊', name: 'Slow Swimming', duration: '25 min', intensity: 'low intensity', benefit: 'Weightless movement reduces cramp pain and feels restorative.' },
    { emoji: '🧘‍♀️', name: 'Breathwork & Meditation', duration: '20 min', intensity: 'low intensity', benefit: 'Regulates the nervous system and supports hormonal balance.' },
  ],
  follicular: [
    { emoji: '🏋️', name: 'Strength Training', duration: '45 min', intensity: 'medium intensity', benefit: 'Rising estrogen accelerates muscle recovery — build now.' },
    { emoji: '💃', name: 'Dance Class', duration: '50 min', intensity: 'medium intensity', benefit: 'Your coordination is sharp; try something fun and creative.' },
    { emoji: '🧗', name: 'Rock Climbing', duration: '60 min', intensity: 'high intensity', benefit: 'High energy and mental sharpness make this phase ideal for challenges.' },
    { emoji: '🏃', name: 'Interval Run', duration: '35 min', intensity: 'high intensity', benefit: 'Your body is primed to build cardiovascular endurance.' },
  ],
  ovulation: [
    { emoji: '🏋️‍♀️', name: 'Heavy Lifts', duration: '50 min', intensity: 'high intensity', benefit: 'Peak strength means this is your best window for personal records.' },
    { emoji: '🏃‍♀️', name: 'Sprints', duration: '30 min', intensity: 'high intensity', benefit: 'Maximum anaerobic capacity supports explosive power output.' },
    { emoji: '🤸', name: 'HIIT Circuit', duration: '40 min', intensity: 'high intensity', benefit: 'Your body recovers fastest this week — push hard.' },
    { emoji: '🏊', name: 'Competitive Swimming', duration: '45 min', intensity: 'high intensity', benefit: 'Endurance and speed are both at their peak.' },
  ],
  luteal: [
    { emoji: '🚴', name: 'Steady Cycling', duration: '40 min', intensity: 'medium intensity', benefit: 'Maintains fitness without triggering cortisol spikes.' },
    { emoji: '🧘‍♀️', name: 'Vinyasa Yoga', duration: '50 min', intensity: 'low intensity', benefit: 'Flowing movement eases bloating and mood swings.' },
    { emoji: '🏊', name: 'Easy Swim', duration: '35 min', intensity: 'low intensity', benefit: 'Water reduces body temperature and joint soreness.' },
    { emoji: '🚶‍♀️', name: 'Nature Walk', duration: '45 min', intensity: 'low intensity', benefit: 'Daylight and gentle movement support serotonin during PMS.' },
  ],
};

export default function WorkoutsScreen({ navigation }) {
  const { profile } = useUser();
  const { lastPeriod } = profile;
  const cycleDay = getCycleDay(lastPeriod);
  const phase = getPhase(cycleDay);
  const phaseInfo = PHASE_INFO[phase];
  const workoutInfo = PHASE_WORKOUT_INFO[phase];

  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadWorkouts(); }, []);

  const loadWorkouts = async () => {
    try {
      const text = await callAI(
        `You are a fitness expert specializing in cycle-syncing workouts for women.
The user is in their ${phase} phase (day ${cycleDay} of their cycle).
Suggest 4 workouts ideal for the ${phase} phase.
Respond ONLY with a valid JSON array, no markdown:
[
  {
    "emoji": "one workout emoji",
    "name": "workout name",
    "duration": "X min",
    "intensity": "low intensity OR medium intensity OR high intensity",
    "benefit": "one sentence on why this workout suits the ${phase} phase"
  }
]`,
        700
      );
      setWorkouts(JSON.parse(text));
    } catch (e) {
      console.log('Workouts error:', e);
      setWorkouts(FALLBACK_WORKOUTS[phase]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false}>

        <View style={[styles.header, { backgroundColor: phaseInfo.bg }]}>
          <Text style={styles.headerEyebrow}>{phaseInfo.label} · day {cycleDay}</Text>
          <Text style={styles.headerTitle}>your workouts</Text>
          <View style={[styles.intensityBadge, { borderColor: phaseInfo.color + '44' }]}>
            <View style={[styles.intensityDot, { backgroundColor: phaseInfo.color }]} />
            <Text style={[styles.intensityText, { color: phaseInfo.color }]}>
              {workoutInfo.intensityLabel}
            </Text>
          </View>
        </View>

        <View style={styles.adviceCard}>
          <Text style={styles.adviceHeadline}>{workoutInfo.headline}</Text>
          <Text style={styles.adviceText}>{workoutInfo.advice}</Text>
        </View>

        <Text style={styles.sectionTitle}>recommended for you</Text>

        {loading ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#7F77DD" />
            <Text style={styles.loadingText}>lua is finding your workouts...</Text>
          </View>
        ) : (
          workouts.map((w, i) => (
            <View key={i} style={styles.workoutCard}>
              <View style={[styles.workoutEmojiWrap, { backgroundColor: phaseInfo.bg }]}>
                <Text style={styles.workoutEmoji}>{w.emoji}</Text>
              </View>
              <View style={styles.workoutInfo}>
                <Text style={styles.workoutName}>{w.name}</Text>
                <Text style={styles.workoutMeta}>{w.duration} · {w.intensity}</Text>
                <Text style={styles.workoutBenefit}>{w.benefit}</Text>
              </View>
            </View>
          ))
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <BottomNav activeTab="Workouts" navigation={navigation} />
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
  headerTitle: { fontFamily: 'Georgia', fontSize: 28, color: '#26215C', marginBottom: 12 },
  intensityBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    alignSelf: 'flex-start', backgroundColor: 'white',
    borderRadius: 100, paddingVertical: 6, paddingHorizontal: 12, borderWidth: 0.5,
  },
  intensityDot: { width: 8, height: 8, borderRadius: 4 },
  intensityText: { fontSize: 13, fontWeight: '500' },
  adviceCard: {
    margin: 16, backgroundColor: '#F5F5F3', borderRadius: 16,
    padding: 16, borderWidth: 0.5, borderColor: '#eee',
  },
  adviceHeadline: { fontSize: 15, fontWeight: '500', color: '#1a1a1a', marginBottom: 6 },
  adviceText: { fontSize: 13, color: '#888', lineHeight: 20 },
  sectionTitle: {
    fontSize: 11, fontWeight: '500', letterSpacing: 0.8,
    textTransform: 'uppercase', color: '#aaa',
    paddingHorizontal: 24, paddingTop: 8, paddingBottom: 10,
  },
  loadingCard: {
    marginHorizontal: 16, borderRadius: 20, padding: 40,
    alignItems: 'center', gap: 12,
    backgroundColor: '#F5F5F3', borderWidth: 0.5, borderColor: '#eee',
  },
  loadingText: { fontSize: 13, color: '#aaa', textAlign: 'center' },
  workoutCard: {
    marginHorizontal: 16, marginBottom: 10, borderRadius: 16,
    backgroundColor: '#fff', borderWidth: 0.5, borderColor: '#eee',
    padding: 14, flexDirection: 'row', alignItems: 'flex-start', gap: 12,
  },
  workoutEmojiWrap: {
    width: 56, height: 56, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  workoutEmoji: { fontSize: 28 },
  workoutInfo: { flex: 1 },
  workoutName: { fontSize: 15, fontWeight: '500', color: '#1a1a1a' },
  workoutMeta: { fontSize: 12, color: '#888', marginTop: 2, marginBottom: 4 },
  workoutBenefit: { fontSize: 12, color: '#aaa', lineHeight: 18 },
});
