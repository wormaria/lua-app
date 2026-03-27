import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OnboardingScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.moon}>🌙</Text>
          <Text style={styles.appName}>lua</Text>
          <Text style={styles.tagline}>
            cycle care rooted in your culture, your food, your body
          </Text>
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.btnPrimary}
            onPress={() => navigation.navigate('Setup')}
            activeOpacity={0.85}
          >
            <Text style={styles.btnPrimaryText}>get started</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnSecondary} activeOpacity={0.7}>
            <Text style={styles.btnSecondaryText}>i already have an account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#E1F5EE',
  },
  container: {
    flex: 1,
    backgroundColor: '#F4C0D1',
    paddingHorizontal: 32,
    justifyContent: 'space-between',
    paddingBottom: 40,
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  moon: {
    fontSize: 80,
    marginBottom: 8,
  },
  appName: {
    fontFamily: 'Georgia',
    fontSize: 64,
    color: '#3C3489',
    letterSpacing: -2,
  },
  tagline: {
    fontSize: 16,
    color: '#5F5E5A',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 260,
    marginTop: 8,
  },
  buttons: {
    gap: 12,
  },
  btnPrimary: {
    backgroundColor: '#3C3489',
    borderRadius: 100,
    paddingVertical: 18,
    alignItems: 'center',
  },
  btnPrimaryText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '500',
  },
  btnSecondary: {
    borderRadius: 100,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#AFA9EC',
  },
  btnSecondaryText: {
    color: '#3C3489',
    fontSize: 15,
  },
});