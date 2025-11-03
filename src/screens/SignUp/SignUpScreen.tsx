import { Button, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { KeyboardAvoidingView } from '@/components/ui/keyboard-avoiding-view';
import { Link, LinkText } from '@/components/ui/link';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { FormInput } from '@/components/FormInput';
import { FormDropdown } from '@/components/FormDropdown';
import { useTranslation } from '@/i18n/hooks';
import { useAuth } from '@/providers/AuthProvider';
import { InstitutionType, InstitutionTypeLabels } from '@/types/enums';
import { zodResolver } from '@hookform/resolvers/zod';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';
import { Country, State, City } from 'country-state-city';
import { useMemo, useState } from 'react';

type SignUpFormData = {
  email: string;
  password: string;
  confirmPassword: string;
  telefono: string;
  nombre_institucion: string;
  tipo_institucion: string;
  nit: string;
  direccion: string;
  ciudad: string;
  pais: string;
  representante: string;
};

// Form validation schema factory
const createSignupSchema = (t: (key: any) => string) =>
  z
    .object({
      email: z.email({ message: t('validation.emailInvalid') }),
      password: z.string().min(8, t('validation.passwordMin').replace('{{min}}', '8')),
      confirmPassword: z.string().min(1, t('validation.required')),
      telefono: z.string().min(1, t('validation.required')),
      nombre_institucion: z.string().min(1, t('validation.required')),
      tipo_institucion: z.string().min(1, t('validation.required')),
      nit: z.string().min(1, t('validation.required')),
      direccion: z.string().min(1, t('validation.required')),
      ciudad: z.string().min(1, t('validation.required')),
      pais: z.string().min(1, t('validation.required')),
      representante: z.string().min(1, t('validation.required')),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('validation.passwordsDoNotMatch'),
      path: ['confirmPassword'],
    });

export const SignUpScreen = () => {
  const { signup, isSignupPending } = useAuth();
  const { t } = useTranslation();

  // State for cascading dropdowns
  const [selectedCountry, setSelectedCountry] = useState<string>('');

  const institutionTypeOptions = Object.values(InstitutionType).map((type) => ({
    label: t(InstitutionTypeLabels[type]),
    value: type,
  }));

  // Get all countries - store name as value for form
  const countryOptions = useMemo(() =>
    Country.getAllCountries().map((country) => ({
      label: country.name,
      value: country.name,
    })),
    []
  );

  // Get all cities for selected country (from all states)
  const cityOptions = useMemo(() => {
    const country = Country.getAllCountries().find(c => c.name === selectedCountry);
    if (!country) return [];

    // Get all states for this country
    const states = State.getStatesOfCountry(country.isoCode);

    // Get all cities from all states and flatten
    const allCities: { label: string; value: string }[] = [];
    states.forEach(state => {
      const cities = City.getCitiesOfState(country.isoCode, state.isoCode);
      cities.forEach(city => {
        allCities.push({
          label: city.name,
          value: city.name,
        });
      });
    });

    // Remove duplicates and sort
    const uniqueCities = Array.from(new Set(allCities.map(c => c.value)))
      .map(value => ({ label: value, value }))
      .sort((a, b) => a.label.localeCompare(b.label));

    return uniqueCities;
  }, [selectedCountry]);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(createSignupSchema(t)),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      telefono: '',
      nombre_institucion: '',
      tipo_institucion: '',
      nit: '',
      direccion: '',
      ciudad: '',
      pais: '',
      representante: '',
    },
  });

  const onSubmit = async (data: SignUpFormData) => {
    await signup(
      data.email,
      data.password,
      data.representante, // Use representative name as user name
      data.telefono,
      data.nombre_institucion,
      data.tipo_institucion,
      data.nit,
      data.direccion,
      data.ciudad,
      data.pais,
      data.representante
    );
    router.replace('/login');
  };

  const isButtonDisabled = !isValid || isSignupPending;

  return (
    <SafeAreaView testID="signup-screen" style={{ flex: 1, backgroundColor: '#f0f8ff' }} edges={['top']}>
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
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

          {/* Welcome Text */}
          <VStack space="xs" className="px-6 py-2">
            <Heading size="2xl" className="text-center">
              {t('auth.signup.title')}
            </Heading>
            <Text size="md" className="text-center text-gray-600">
              {t('auth.signup.subtitle')}
            </Text>
          </VStack>

          {/* SignUp Form */}
          <VStack space="lg" style={styles.formContainer}>
            <View testID="signup-form" style={styles.formCard}>
              <Heading size="xl" className="mb-6 text-center">
                {t('auth.signup.cardTitle')}
              </Heading>

              {/* Email Field */}
              <FormInput
                control={control}
                name="email"
                placeholder={t('auth.signup.email')}
                error={errors.email}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                testID="email-input"
              />

              {/* Password Field */}
              <FormInput
                control={control}
                name="password"
                placeholder={t('auth.signup.password')}
                error={errors.password}
                secureTextEntry
                autoCapitalize="none"
                testID="password-input"
              />

              {/* Confirm Password Field */}
              <FormInput
                control={control}
                name="confirmPassword"
                placeholder={t('auth.signup.confirmPassword')}
                error={errors.confirmPassword}
                secureTextEntry
                autoCapitalize="none"
                testID="confirm-password-input"
              />

              {/* Phone Number Field */}
              <FormInput
                control={control}
                name="telefono"
                placeholder={t('auth.signup.telefono')}
                error={errors.telefono}
                keyboardType="phone-pad"
                testID="telefono-input"
              />

              {/* Institution Name Field */}
              <FormInput
                control={control}
                name="nombre_institucion"
                placeholder={t('auth.signup.nombre_institucion')}
                error={errors.nombre_institucion}
                testID="nombre-institucion-input"
              />

              {/* Institution Type Field */}
              <FormDropdown
                control={control}
                name="tipo_institucion"
                placeholder={t('auth.signup.tipo_institucion_placeholder')}
                options={institutionTypeOptions}
                error={errors.tipo_institucion}
                testID="tipo-institucion-input"
              />

              {/* NIT Field */}
              <FormInput
                control={control}
                name="nit"
                placeholder={t('auth.signup.nit')}
                error={errors.nit}
                testID="nit-input"
              />

              {/* Address Field */}
              <FormInput
                control={control}
                name="direccion"
                placeholder={t('auth.signup.direccion')}
                error={errors.direccion}
                testID="direccion-input"
              />

              {/* Country Field */}
              <FormDropdown
                control={control}
                name="pais"
                placeholder={t('auth.signup.pais')}
                options={countryOptions}
                error={errors.pais}
                testID="pais-input"
                onChange={(value: string) => setSelectedCountry(value)}
              />

              {/* City Field */}
              <FormDropdown
                control={control}
                name="ciudad"
                placeholder={t('auth.signup.ciudad')}
                options={cityOptions}
                error={errors.ciudad}
                testID="ciudad-input"
              />

              {/* Legal Representative Field */}
              <View className="mb-2">
                <FormInput
                  control={control}
                  name="representante"
                  placeholder={t('auth.signup.representante')}
                  error={errors.representante}
                  testID="representante-input"
                />
              </View>

              {/* Submit Button */}
              <Button
                testID="submit-button"
                onPress={handleSubmit(onSubmit)}
                isDisabled={isButtonDisabled}
              >
                {isSignupPending && <ButtonSpinner className="mr-1" />}
                <ButtonText>{t('auth.signup.signUp')}</ButtonText>
              </Button>

              {/* Sign In Link */}
              <HStack space="xs" className="mt-4 justify-center">
                <Text size="sm">{t('auth.signup.haveAccount')}</Text>
                <Link
                  testID="signin-link"
                  onPress={() => router.push('/login')}
                >
                  <LinkText size="sm">{t('auth.signup.signIn')}</LinkText>
                </Link>
              </HStack>
            </View>
          </VStack>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
    </SafeAreaView>
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
