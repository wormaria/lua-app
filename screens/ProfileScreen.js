import { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomNav from '../components/BottomNav';
import { useUser } from '../context/UserContext';
import { getCycleDay, getPhase, PHASE_INFO } from '../utils/cycle';

const CUISINES = [
  'Brazilian', 'Mexican', 'Japanese', 'Indian',
  'Italian', 'Colombian', 'Peruvian', 'Korean',
  'Ethiopian', 'Lebanese', 'Thai', 'Cuban',
  'Argentinian', 'Puerto Rican', 'Vietnamese', 'Greek',
];

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });
}

function daysAgoLabel(iso) {
  const diff = Math.floor((Date.now() - new Date(iso)) / 86400000);
  if (diff === 0) return 'today';
  if (diff === 1) return 'yesterday';
  return `${diff} days ago`;
}

export default function ProfileScreen({ navigation }) {
  const { profile, updateProfile } = useUser();

  // Local (unsaved) state
  const [name, setName] = useState(profile.name);
  const [selectedCuisines, setSelectedCuisines] = useState(new Set(profile.cuisines));
  const [lastPeriod, setLastPeriod] = useState(profile.lastPeriod);
  const [editingCuisines, setEditingCuisines] = useState(false);
  const [editingDate, setEditingDate] = useState(false);
  const [saved, setSaved] = useState(false);

  const cycleDay = getCycleDay(lastPeriod);
  const phase = getPhase(cycleDay);
  const phaseInfo = PHASE_INFO[phase];

  const toggleCuisine = (c) => {
    setSelectedCuisines(prev => {
      const next = new Set(prev);
      next.has(c) ? next.delete(c) : next.add(c);
      return next;
    });
  };

  const handleSave = () => {
    if (selectedCuisines.size === 0) return; // require at least 1
    updateProfile({ name, cuisines: Array.from(selectedCuisines), lastPeriod });
    setEditingCuisines(false);
    setEditingDate(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Build the 5-week mini-calendar for last period date picker
  const { weeks, calMonthLabel } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Earliest selectable date: 34 days ago
    const earliest = new Date(today);
    earliest.setDate(today.getDate() - 34);

    // Start the grid on the Sunday of that week
    const gridStart = new Date(earliest);
    gridStart.setDate(gridStart.getDate() - gridStart.getDay());

    const builtWeeks = Array.from({ length: 5 }, (_, w) =>
      Array.from({ length: 7 }, (_, d) => {
        const date = new Date(gridStart);
        date.setDate(gridStart.getDate() + w * 7 + d);
        return date;
      })
    );

    // Month range label
    const sm = earliest.toLocaleDateString('en-US', { month: 'short' });
    const em = today.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    const label = earliest.getMonth() === today.getMonth()
      ? today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      : `${sm} – ${em}`;

    return { weeks: builtWeeks, calMonthLabel: label, earliest };
  }, []);

  const todayStr = new Date().toISOString().slice(0, 10);
  const selectedStr = lastPeriod.slice(0, 10);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerEyebrow}>your profile</Text>
          <Text style={styles.headerTitle}>settings</Text>
        </View>

        {/* ── About me ── */}
        <Text style={styles.sectionLabel}>about me</Text>
        <View style={styles.card}>
          <Text style={styles.fieldLabel}>your name</Text>
          <TextInput
            style={styles.textInput}
            value={name}
            onChangeText={setName}
            placeholder="enter your name"
            placeholderTextColor="#ccc"
            autoCorrect={false}
            selectionColor="#3C3489"
          />
        </View>

        {/* ── Cycle settings ── */}
        <Text style={styles.sectionLabel}>cycle settings</Text>
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <View>
              <Text style={styles.fieldLabel}>last period start</Text>
              <Text style={styles.fieldValue}>{formatDate(lastPeriod)}</Text>
              <Text style={styles.fieldSub}>
                {daysAgoLabel(lastPeriod)} · day {cycleDay},{' '}
                <Text style={[styles.fieldSubPhase, { color: phaseInfo.color }]}>
                  {phase} phase
                </Text>
              </Text>
            </View>
            <TouchableOpacity
              style={styles.editChip}
              onPress={() => setEditingDate(v => !v)}
              activeOpacity={0.7}
            >
              <Text style={styles.editChipText}>{editingDate ? 'close' : 'update'}</Text>
            </TouchableOpacity>
          </View>

          {editingDate && (
            <View style={styles.calendarWrap}>
              <Text style={styles.calMonthLabel}>{calMonthLabel}</Text>
              {/* Day-of-week headers */}
              <View style={styles.calRow}>
                {['S','M','T','W','T','F','S'].map((d, i) => (
                  <Text key={i} style={styles.calDayHeader}>{d}</Text>
                ))}
              </View>
              {/* Date grid — 5 weeks */}
              {weeks.map((week, wi) => (
                <View key={wi} style={styles.calRow}>
                  {week.map((date, di) => {
                    const dateStr = date.toISOString().slice(0, 10);
                    const isFuture = dateStr > todayStr;
                    const isSelected = dateStr === selectedStr;
                    const isToday = dateStr === todayStr;
                    // Gray out dates outside our selectable window
                    const earliest35 = new Date();
                    earliest35.setDate(earliest35.getDate() - 34);
                    earliest35.setHours(0, 0, 0, 0);
                    const tooOld = date < earliest35;
                    const disabled = isFuture || tooOld;
                    return (
                      <TouchableOpacity
                        key={di}
                        style={[
                          styles.calCell,
                          isSelected && styles.calCellSelected,
                        ]}
                        onPress={() => !disabled && setLastPeriod(date.toISOString())}
                        activeOpacity={disabled ? 1 : 0.7}
                      >
                        <Text style={[
                          styles.calCellText,
                          isSelected && styles.calCellTextSelected,
                          disabled && styles.calCellTextDisabled,
                        ]}>
                          {date.getDate()}
                        </Text>
                        {isToday && !isSelected && <View style={styles.calTodayDot} />}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* ── Cuisine preferences ── */}
        <Text style={styles.sectionLabel}>cuisine preferences</Text>
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.fieldLabel}>
              {selectedCuisines.size} cuisine{selectedCuisines.size !== 1 ? 's' : ''} selected
            </Text>
            <TouchableOpacity
              style={styles.editChip}
              onPress={() => setEditingCuisines(v => !v)}
              activeOpacity={0.7}
            >
              <Text style={styles.editChipText}>{editingCuisines ? 'done' : 'edit'}</Text>
            </TouchableOpacity>
          </View>

          {/* Current selection as pills */}
          <View style={styles.pillWrap}>
            {Array.from(selectedCuisines).map(c => (
              <View key={c} style={[styles.pill, editingCuisines && styles.pillFaded]}>
                <Text style={styles.pillText}>{c}</Text>
              </View>
            ))}
          </View>

          {/* Edit grid */}
          {editingCuisines && (
            <View style={styles.gridWrap}>
              <View style={styles.divider} />
              <View style={styles.pillGrid}>
                {CUISINES.map(c => (
                  <TouchableOpacity
                    key={c}
                    style={[styles.gridPill, selectedCuisines.has(c) && styles.gridPillSelected]}
                    onPress={() => toggleCuisine(c)}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.gridPillText, selectedCuisines.has(c) && styles.gridPillTextSelected]}>
                      {c}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* ── Save button ── */}
        <View style={styles.saveWrap}>
          <TouchableOpacity
            style={[styles.saveBtn, saved && styles.saveBtnSuccess]}
            onPress={handleSave}
            activeOpacity={0.85}
            disabled={saved}
          >
            <Text style={styles.saveBtnText}>{saved ? 'saved ✓' : 'save changes'}</Text>
          </TouchableOpacity>
          {selectedCuisines.size === 0 && (
            <Text style={styles.validationNote}>select at least one cuisine</Text>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <BottomNav activeTab="Profile" navigation={navigation} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F5F3' },
  header: { padding: 24, paddingBottom: 20, backgroundColor: '#EEEDFE' },
  headerEyebrow: {
    fontSize: 11, color: '#3C3489', fontWeight: '500',
    letterSpacing: 0.5, marginBottom: 4, textTransform: 'uppercase',
  },
  headerTitle: { fontFamily: 'Georgia', fontSize: 28, color: '#26215C' },

  sectionLabel: {
    fontSize: 11, fontWeight: '500', letterSpacing: 0.8,
    textTransform: 'uppercase', color: '#aaa',
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8,
  },
  card: {
    marginHorizontal: 16, backgroundColor: '#fff',
    borderRadius: 20, padding: 16,
    borderWidth: 0.5, borderColor: '#eee',
  },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  fieldLabel: { fontSize: 12, color: '#aaa', marginBottom: 6 },
  fieldValue: { fontSize: 16, fontWeight: '500', color: '#1a1a1a', marginBottom: 3 },
  fieldSub: { fontSize: 12, color: '#aaa' },
  fieldSubPhase: { fontWeight: '500' },

  editChip: {
    backgroundColor: '#EEEDFE', borderRadius: 100,
    paddingVertical: 5, paddingHorizontal: 12,
  },
  editChipText: { fontSize: 12, color: '#3C3489', fontWeight: '500' },

  textInput: {
    backgroundColor: '#F5F5F3', borderRadius: 12,
    paddingVertical: 12, paddingHorizontal: 14,
    fontSize: 16, color: '#1a1a1a',
    borderWidth: 0.5, borderColor: '#eee',
  },

  // Mini calendar
  calendarWrap: { marginTop: 16 },
  calMonthLabel: {
    fontSize: 12, fontWeight: '500', color: '#888',
    textAlign: 'center', marginBottom: 10,
  },
  calRow: { flexDirection: 'row', marginBottom: 3 },
  calDayHeader: {
    flex: 1, textAlign: 'center',
    fontSize: 10, color: '#bbb', fontWeight: '500',
    paddingBottom: 6,
  },
  calCell: {
    flex: 1, height: 34, alignItems: 'center',
    justifyContent: 'center', borderRadius: 17,
  },
  calCellSelected: { backgroundColor: '#3C3489' },
  calCellText: { fontSize: 13, color: '#333' },
  calCellTextSelected: { color: '#fff', fontWeight: '600' },
  calCellTextDisabled: { color: '#ddd' },
  calTodayDot: {
    width: 3, height: 3, borderRadius: 1.5,
    backgroundColor: '#7F77DD', marginTop: 1,
  },

  // Cuisine pills
  pillWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  pill: {
    backgroundColor: '#EEEDFE', borderRadius: 100,
    paddingVertical: 5, paddingHorizontal: 12,
  },
  pillFaded: { opacity: 0.5 },
  pillText: { fontSize: 13, color: '#3C3489', fontWeight: '500' },

  gridWrap: { marginTop: 12 },
  divider: { height: 0.5, backgroundColor: '#eee', marginBottom: 12 },
  pillGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  gridPill: {
    paddingVertical: 8, paddingHorizontal: 14, borderRadius: 100,
    backgroundColor: '#F5F5F3', borderWidth: 1, borderColor: '#eee',
  },
  gridPillSelected: { backgroundColor: '#EEEDFE', borderColor: '#AFA9EC' },
  gridPillText: { fontSize: 14, color: '#888' },
  gridPillTextSelected: { color: '#3C3489', fontWeight: '500' },

  // Save
  saveWrap: { paddingHorizontal: 16, paddingTop: 20 },
  saveBtn: {
    backgroundColor: '#3C3489', borderRadius: 100,
    paddingVertical: 17, alignItems: 'center',
  },
  saveBtnSuccess: { backgroundColor: '#0F6E56' },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '500' },
  validationNote: { fontSize: 12, color: '#D85A30', textAlign: 'center', marginTop: 8 },
});
