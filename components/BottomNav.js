import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const TABS = [
  { key: 'Home',     emoji: '🌙', label: 'home' },
  { key: 'Meals',    emoji: '🍽',  label: 'meals' },
  { key: 'Workouts', emoji: '💪',  label: 'workouts' },
  { key: 'Cycle',    emoji: '📊',  label: 'cycle' },
  { key: 'Profile',  emoji: '👤',  label: 'profile' },
];

export default function BottomNav({ activeTab, navigation }) {
  return (
    <View style={styles.navBar}>
      {TABS.map(tab => (
        <TouchableOpacity
          key={tab.key}
          style={styles.navItem}
          onPress={() => activeTab !== tab.key && navigation.navigate(tab.key)}
          activeOpacity={0.7}
        >
          <Text style={styles.navIcon}>{tab.emoji}</Text>
          <Text style={[styles.navLabel, activeTab === tab.key && styles.navLabelActive]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  navBar: {
    flexDirection: 'row', justifyContent: 'space-around',
    paddingVertical: 10, paddingBottom: 26,
    borderTopWidth: 0.5, borderTopColor: '#eee',
    backgroundColor: '#fff', position: 'absolute', bottom: 0, left: 0, right: 0,
  },
  navItem: { alignItems: 'center', gap: 3 },
  navIcon: { fontSize: 20 },
  navLabel: { fontSize: 10, color: '#bbb' },
  navLabelActive: { color: '#3C3489', fontWeight: '500' },
});
