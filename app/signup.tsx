import { SignUpScreen } from '@/screens/SignUp';
import { Stack } from 'expo-router';

export default function SignUp() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SignUpScreen />
    </>
  );
}
