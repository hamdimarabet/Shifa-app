import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import HomeScreen from '../screens/home/HomeScreen';
import MealScreen from '../screens/meal/MealScreen';
import StoreScreen from '../screens/store/StoreScreen';
import BlogScreen from '../screens/blog/BlogScreen';
import CommunityScreen from '../screens/community/CommunityScreen';
import LoyaltyScreen from '../screens/loyalty/LoyaltyScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import StepsScreen from '../screens/steps/stepsScreen';
import JournalScreen from '../screens/journal/journalScreen';
const Tab = createBottomTabNavigator();

const icon = (emoji) => () => <Text style={{ fontSize: 22 }}>{emoji}</Text>;

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#1D9E75',
        tabBarInactiveTintColor: '#aaa',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 0.5,
          borderTopColor: '#eee',
          paddingBottom: 8,
          paddingTop: 6,
          height: 64,
        },
        tabBarStyle: {
            backgroundColor: '#fff',
            borderTopWidth: 0.5,
            borderTopColor: '#eee',
            paddingBottom: 16,
            paddingTop: 6,
            height: 80,
          },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarIcon: icon('🏠'), tabBarLabel: 'Home' }}
      />
      <Tab.Screen
  name="Steps"
  component={StepsScreen}
  options={{ tabBarIcon: icon('👟'), tabBarLabel: 'Steps' }}
/>
<Tab.Screen
  name="Journal"
  component={JournalScreen}
  options={{ tabBarIcon: icon('📖'), tabBarLabel: 'Journal' }}
/>
      <Tab.Screen
        name="Meal"
        component={MealScreen}
        options={{ tabBarIcon: icon('📸'), tabBarLabel: 'Scan' }}
      />
      <Tab.Screen
        name="Store"
        component={StoreScreen}
        options={{ tabBarIcon: icon('🛒'), tabBarLabel: 'Store' }}
      />
      <Tab.Screen
        name="Blog"
        component={BlogScreen}
        options={{ tabBarIcon: icon('📝'), tabBarLabel: 'Blog' }}
      />
      <Tab.Screen
        name="Community"
        component={CommunityScreen}
        options={{ tabBarIcon: icon('👥'), tabBarLabel: 'Community' }}
      />
      <Tab.Screen
        name="Rewards"
        component={LoyaltyScreen}
        options={{ tabBarIcon: icon('⭐'), tabBarLabel: 'Rewards' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarIcon: icon('👤'), tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
}