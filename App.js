import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { UserProvider } from './app/context/UserContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import OnboardingNavigator from './app/navigation/OnboardingNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <UserProvider>
        <NavigationContainer>
          <OnboardingNavigator />
        </NavigationContainer>
      </UserProvider>
    </SafeAreaProvider>
  );
}