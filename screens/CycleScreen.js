import { View, Text, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomNav from '../components/BottomNav';
import { useUser } from '../context/UserContext';
import { PHASE_INFO, getCycleDay, getPhase } from '../utils/cycle';

const PHASE_ORDER = ['menstrual', 'follicular', 'ovulation', 'luteal'];

const PHASE_TIPS = {
  menstrual: [
    'Rest more and reduce social commitments',
    'Apply heat to ease cramping and lower back tension',
    'Eat iron-rich foods: beans, lentils, leafy greens',
    'Move gently — yoga, slow walks, stretching',
    'Avoid cold foods and excess caffeine',
  ],
  follicular: [
    'Start new projects — your brain is sharp and creative',
    'Increase protein to support muscle building',
    'Try new workouts: strength training, dance, cardio',
    'Schedule important meetings and social events',
    'Eat fermented foods to support estrogen metabolism',
  ],
  ovulation: [
    'Schedule your most demanding work now',
    'Eat lighter, cooling foods: salads, smoothies, fruit',
    'Push hard in workouts — you recover faster this week',
    'Lean into your heightened communication and charisma',
    'Add cruciferous veggies to support estrogen clearance',
  ],
  luteal: [
    'Slow down and protect your energy',
    'Increase magnesium: dark chocolate, avocado, nuts',
    'Prioritize sleep — your body temperature runs higher',
    'Switch to steady-state cardio or restorative yoga',
    'Journal and reflect — this phase supports introspection',
  ],
};

function getDayPhase(day) {
  if (day <= 5)  return 'menstrual';
  if (day <= 13) return 'follicular';
  if (day <= 16) return 'ovulation';
  return 'luteal';
}

export default function CycleScreen({ navigation }) {
  const { profile } = useUser();
  const { lastPeriod } = profile;
  const cycleDay = getCycleDay(lastPeriod);
  const phase = getPhase(cycleDay);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <Text style={styles.headerEyebrow}>your cycle</Text>
          <Text style={styles.headerTitle}>28-day rhythm</Text>
          <Text style={styles.headerSub}>you are on day {cycleDay} of your cycle</Text>
        </View>

        {/* Calendar grid — 28 circles, 7 per row */}
        <View style={styles.calendarWrap}>
          <Text style={styles.calendarLabel}>cycle calendar</Text>
          <View style={styles.dayGrid}>
            {Array.from({ length: 28 }, (_, i) => {
              const day = i + 1;
              const dayPhase = getDayPhase(day);
              const info = PHASE_INFO[dayPhase];
              const isToday = day === cycleDay;
              return (
                <View
                  key={day}
                  style={[
                    styles.dayCircle,
                    { backgroundColor: info.color + '22', borderColor: info.color + '55' },
                    isToday && { backgroundColor: info.color, borderColor: info.color },
                  ]}
                >
                  <Text style={[styles.dayNum, isToday && styles.dayNumToday]}>{day}</Text>
                </View>
              );
            })}
          </View>
          <View style={styles.legend}>
            {PHASE_ORDER.map(p => {
              const info = PHASE_INFO[p];
              return (
                <View key={p} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: info.color }]} />
                  <Text style={styles.legendText}>{p.slice(0, 3)}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Phase detail cards */}
        <Text style={styles.sectionTitle}>understanding your phases</Text>
        {PHASE_ORDER.map(p => {
          const info = PHASE_INFO[p];
          const tips = PHASE_TIPS[p];
          const isCurrent = p === phase;
          return (
            <View
              key={p}
              style={[
                styles.phaseCard,
                isCurrent && { borderColor: info.color + '66', borderWidth: 1.5 },
              ]}
            >
              <View style={[styles.phaseCardHeader, { backgroundColor: info.bg }]}>
                <View>
                  <Text style={[styles.phaseCardName, { color: info.color }]}>{info.label}</Text>
                  <Text style={styles.phaseCardDays}>days {info.days}</Text>
                </View>
                <View style={styles.phaseCardRight}>
                  {isCurrent && (
                    <View style={[styles.currentBadge, { backgroundColor: info.color }]}>
                      <Text style={styles.currentBadgeText}>you are here</Text>
                    </View>
                  )}
                  <Text style={[styles.phaseCardDesc, { color: info.color }]}>{info.desc}</Text>
                </View>
              </View>
              <View style={styles.phaseCardBody}>
                {tips.map((tip, i) => (
                  <View key={i} style={styles.tipRow}>
                    <Text style={[styles.tipDot, { color: info.color }]}>✦</Text>
                    <Text style={styles.tipText}>{tip}</Text>
                  </View>
                ))}
              </View>
            </View>
          );
        })}

        <View style={{ height: 100 }} />
      </ScrollView>

      <BottomNav activeTab="Cycle" navigation={navigation} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 24, paddingBottom: 20, backgroundColor: '#EEEDFE' },
  headerEyebrow: {
    fontSize: 11, color: '#3C3489', fontWeight: '500',
    letterSpacing: 0.5, marginBottom: 4, textTransform: 'uppercase',
  },
  headerTitle: { fontFamily: 'Georgia', fontSize: 28, color: '#26215C', marginBottom: 6 },
  headerSub: { fontSize: 13, color: '#888' },
  calendarWrap: {
    margin: 16, backgroundColor: '#F5F5F3', borderRadius: 20,
    padding: 16, borderWidth: 0.5, borderColor: '#eee',
  },
  calendarLabel: {
    fontSize: 11, color: '#aaa', fontWeight: '500',
    letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 12,
  },
  dayGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  dayCircle: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center', borderWidth: 0.5,
  },
  dayNum: { fontSize: 11, color: '#555', fontWeight: '500' },
  dayNumToday: { color: '#fff', fontWeight: '700' },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 },
  sectionTitle: {
    fontSize: 11, fontWeight: '500', letterSpacing: 0.8,
    textTransform: 'uppercase', color: '#aaa',
    paddingHorizontal: 24, paddingTop: 16, paddingBottom: 10,
  },
  phaseCard: {
    marginHorizontal: 16, marginBottom: 12, borderRadius: 20,
    overflow: 'hidden', borderWidth: 0.5, borderColor: '#eee', backgroundColor: '#fff',
  },
  phaseCardHeader: {
    padding: 16, flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'flex-start',
  },
  phaseCardRight: { alignItems: 'flex-end', gap: 4 },
  phaseCardName: { fontSize: 15, fontWeight: '600', marginBottom: 2 },
  phaseCardDays: { fontSize: 12, color: '#aaa' },
  phaseCardDesc: { fontSize: 12, fontWeight: '500' },
  currentBadge: { borderRadius: 100, paddingVertical: 3, paddingHorizontal: 8 },
  currentBadgeText: { fontSize: 10, color: '#fff', fontWeight: '600' },
  phaseCardBody: { padding: 14, gap: 8 },
  tipRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  tipDot: { fontSize: 9, marginTop: 5 },
  tipText: { fontSize: 13, color: '#555', lineHeight: 20, flex: 1 },
});
