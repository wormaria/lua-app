import { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const CUISINES = [
  'Brazilian', 'Mexican', 'Japanese', 'Indian',
  'Italian', 'Colombian', 'Peruvian', 'Korean',
  'Ethiopian', 'Lebanese', 'Thai', 'Cuban',
  'Argentinian', 'Puerto Rican', 'Vietnamese', 'Greek',
];

export default function SetupScreen({ navigation }) {
  const [step, setStep] = useState(1);
  const [selectedCuisines, setSelectedCuisines] = useState(new Set(['Brazilian', 'Mexican']));

  const toggleCuisine = (c) => {
    setSelectedCuisines(prev => {
      const next = new Set(prev);
      next.has(c) ? next.delete(c) : next.add(c);
      return next;
    });
  };

  const handleContinue = () => {
    if (step === 1) {
      setStep(2);
    } else {
      navigation.navigate('Home', {
        cuisines: Array.from(selectedCuisines),
        lastPeriod: new Date(Date.now() - 18 * 86400000).toISOString(),
      });
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <Text style={styles.stepLabel}>step {step} of 2</Text>
          <Text style={styles.title}>
            {step === 1
              ? 'when did your last period start?'
              : 'what cuisines do you love?'}
          </Text>
          <Text style={styles.subtitle}>
            {step === 1
              ? "we'll use this to understand your cycle and personalize your recommendations"
              : 'lua will suggest meals from the cultures that feel like home to you'}
          </Text>
        </View>

        {step === 1 && (
          <View style={styles.datePicker}>
            <Text style={styles.fieldLabel}>last period start date</Text>
            <View style={styles.dateDisplay}>
              <Text style={styles.dateText}>March 8, 2026</Text>
              <Text style={styles.dateStar}>✦</Text>
            </View>
            <View style={styles.calendarHint}>
              <Text style={styles.calendarHintText}>
                tap to change date (date picker coming soon)
              </Text>
            </View>
          </View>
        )}

        {step === 2 && (
          <View>
            <Text style={styles.fieldLabel}>select all that apply</Text>
            <View style={styles.pillGrid}>
              {CUISINES.map(c => (
                <TouchableOpacity
                  key={c}
                  style={[styles.pill, selectedCuisines.has(c) && styles.pillSelected]}
                  onPress={() => toggleCuisine(c)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.pillText, selectedCuisines.has(c) && styles.pillTextSelected]}>
                    {c}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={styles.dotsRow}>
          <View style={[styles.dot, step === 1 && styles.dotActive]} />
          <View style={[styles.dot, step === 2 && styles.dotActive]} />
        </View>

        <TouchableOpacity style={styles.btnPrimary} onPress={handleContinue} activeOpacity={0.85}>
          <Text style={styles.btnPrimaryText}>
            {step === 1 ? 'continue' : 'go to my dashboard ✦'}
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { padding: 24, paddingBottom: 40 },
  header: { marginBottom: 28 },
  stepLabel: {
    fontSize: 11, fontWeight: '500', letterSpacing: 1,
    textTransform: 'uppercase', color: '#0F6E56', marginBottom: 8,
  },
  title: {
    fontFamily: 'Georgia', fontSize: 28, color: '#1a1a1a',
    lineHeight: 36, marginBottom: 8,
  },
  subtitle: { fontSize: 14, color: '#888', lineHeight: 22 },
  fieldLabel: { fontSize: 13, color: '#888', marginBottom: 10 },
  datePicker: { marginBottom: 24 },
  dateDisplay: {
    backgroundColor: '#F5F5F3',
    borderRadius: 16, padding: 18,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderWidth: 0.5, borderColor: '#ddd',
  },
  dateText: { fontSize: 17, fontWeight: '500', color: '#1a1a1a' },
  dateStar: { fontSize: 18, color: '#7F77DD' },
  calendarHint: { marginTop: 10 },
  calendarHintText: { fontSize: 12, color: '#bbb', textAlign: 'center' },
  pillGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    paddingVertical: 9, paddingHorizontal: 16, borderRadius: 100,
    backgroundColor: '#F5F5F3', borderWidth: 1, borderColor: '#eee',
  },
  pillSelected: { backgroundColor: '#EEEDFE', borderColor: '#AFA9EC' },
  pillText: { fontSize: 14, color: '#888' },
  pillTextSelected: { color: '#3C3489', fontWeight: '500' },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginVertical: 28 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#ddd' },
  dotActive: { width: 20, borderRadius: 3, backgroundColor: '#3C3489' },
  btnPrimary: {
    backgroundColor: '#3C3489', borderRadius: 100,
    paddingVertical: 18, alignItems: 'center',
  },
  btnPrimaryText: { color: 'white', fontSize: 17, fontWeight: '500' },
});