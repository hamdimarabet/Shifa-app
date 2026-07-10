import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import NameScreen from '../screens/onboarding/NameScreen';
import HeightScreen from '../screens/onboarding/HeightScreen';
import WeightScreen from '../screens/onboarding/WeightScreen';
import SexScreen from '../screens/onboarding/SexScreen';
import ActivityScreen from '../screens/onboarding/ActivityScreen';
import GoalsScreen from '../screens/onboarding/GoalsScreen';
import MedicalConditionsScreen from '../screens/onboarding/MedicalConditionsScreen';
import ChatScreen from '../screens/chat/ChatScreen';
import TabNavigator from './TabNavigator';
import OrderFormScreen from '../screens/store/OrderFormScreen';
import BlogScreen from '../screens/blog/BlogScreen';
import CommunityScreen from '../screens/community/CommunityScreen';
import StepsScreen from '../screens/steps/stepsScreen';
import JournalScreen from '../screens/journal/journalScreen';
import MealScreen from '../screens/meal/MealScreen';

const Stack = createStackNavigator();

export default function OnboardingNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="Name" component={NameScreen} />
      <Stack.Screen name="Height" component={HeightScreen} />
      <Stack.Screen name="Weight" component={WeightScreen} />
      <Stack.Screen name="Sex" component={SexScreen} />
      <Stack.Screen name="Activity" component={ActivityScreen} />
      <Stack.Screen name="Goals" component={GoalsScreen} />
      <Stack.Screen name="MedicalConditions" component={MedicalConditionsScreen} />
      <Stack.Screen name="MainApp" component={TabNavigator} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="OrderForm" component={OrderFormScreen} />
      <Stack.Screen name="Blog" component={BlogScreen} />
      <Stack.Screen name="Community" component={CommunityScreen} />
      <Stack.Screen name="Steps" component={StepsScreen} />
      <Stack.Screen name="Journal" component={JournalScreen} />
      <Stack.Screen name="Meal" component={MealScreen} />
    </Stack.Navigator>
  );
}