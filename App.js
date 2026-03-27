import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { UserProvider } from './context/UserContext';
import OnboardingScreen from './screens/OnboardingScreen';
import SetupScreen from './screens/SetupScreen';
import HomeScreen from './screens/HomeScreen';
import MealsScreen from './screens/MealsScreen';
import WorkoutsScreen from './screens/WorkoutsScreen';
import CycleScreen from './screens/CycleScreen';
import ProfileScreen from './screens/ProfileScreen';
import RecipeScreen from './screens/RecipeScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <UserProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="Setup" component={SetupScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Meals" component={MealsScreen} />
          <Stack.Screen name="Workouts" component={WorkoutsScreen} />
          <Stack.Screen name="Cycle" component={CycleScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen
            name="RecipeDetail"
            component={RecipeScreen}
            options={{ animation: 'slide_from_bottom' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </UserProvider>
  );
}
