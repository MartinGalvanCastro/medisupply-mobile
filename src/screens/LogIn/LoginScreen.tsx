import { AuthLogo } from '@/components/AuthLogo';
import { Button, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { KeyboardAvoidingView } from '@/components/ui/keyboard-avoiding-view';
import { Link, LinkText } from '@/components/ui/link';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { FormInput } from '@/components/FormInput';
import { useTranslation } from '@/i18n/hooks';
import { useAuth } from '@/providers/AuthProvider';
import { useAuthStore } from '@/store';
import { zodResolver } from '@hookform/resolvers/zod';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { ScrollView, StyleSheet, View } from 'react-native';
import { z } from 'zod';

// Form validation schema
const loginSchema = z.object({
  email: z.email({ message: 'Invalid email format' }),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginScreen = () => {
  const { login, isLoginPending } = useAuth();

  // Select authentication state from store
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  const { t } = useTranslation();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const email = watch('email');
  const password = watch('password');

  // Auto-redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/');
    } else {
      // Not authenticated, stay on login screen
    }
  }, [isAuthenticated]);

  const onSubmit = (data: LoginFormData) => {
    login(data.email, data.password);
  };

  const isButtonDisabled = !isValid || !email || !password || isLoginPending;

  return (
    <KeyboardAvoidingView testID="login-screen" behavior="padding" style={{ flex: 1 }}>
      <LinearGradient
        colors={['#f0f8ff', '#e0f2fe']}
        style={{ flex: 1 }}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
          overScrollMode="never"
        >
          {/* Logo Section */}
          <AuthLogo />

          {/* Welcome Text */}
          <VStack space="xs" className="px-6 py-2">
            <Heading size="2xl" className="text-center">
              {t('auth.login.title')}
            </Heading>
            <Text size="md" className="text-center text-gray-600">
              {t('auth.login.subtitle')}
            </Text>
          </VStack>

          {/* Login Form */}
          <VStack space="lg" style={styles.formContainer}>
            <View testID="login-form" style={styles.formCard}>
              <Heading size="xl" className="mb-2 text-center">
                {t('auth.login.cardTitle')}
              </Heading>
              <Text size="sm" className="mb-6 text-center text-gray-600">
                {t('auth.login.cardSubtitle')}
              </Text>

              {/* Email Field */}
              <FormInput
                control={control}
                name="email"
                placeholder={t('auth.login.email')}
                error={errors.email}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                testID="email-input"
              />

              {/* Password Field */}
              <View className="mb-2">
                <FormInput
                  control={control}
                  name="password"
                  placeholder={t('auth.login.password')}
                  error={errors.password}
                  secureTextEntry
                  autoCapitalize="none"
                  testID="password-input"
                  showPasswordToggle
                />
              </View>

              {/* Submit Button */}
              <Button
                testID="submit-button"
                onPress={handleSubmit(onSubmit)}
                isDisabled={isButtonDisabled}
              >
                {isLoginPending && <ButtonSpinner className="mr-1" />}
                <ButtonText>{t('auth.login.signIn')}</ButtonText>
              </Button>

              {/* Sign Up Link */}
              <HStack space="xs" className="mt-4 justify-center">
                <Text size="sm">{t('auth.login.noAccount')}</Text>
                <Link
                  testID="signup-link"
                  onPress={() => router.push('/signup')}
                >
                  <LinkText size="sm">{t('auth.login.signUp')}</LinkText>
                </Link>
              </HStack>
            </View>
          </VStack>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  formCard: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
});
