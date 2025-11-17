import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { VStack } from '@/components/ui/vstack';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Box } from '@/components/ui/box';
import type { AuthFormLayoutProps } from './types';

export const AuthFormLayout = ({
  title,
  subtitle,
  children,
  footer,
  testID = 'auth-form-layout',
}: AuthFormLayoutProps) => {
  return (
    <SafeAreaView style={styles.container} testID={testID}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          testID={`${testID}-scroll-view`}
        >
          <VStack space="xl" className="px-6 py-8">
            {/* Header */}
            <VStack space="sm" testID={`${testID}-header`}>
              <Heading
                size="3xl"
                className="text-typography-900 font-bold"
                testID={`${testID}-title`}
              >
                {title}
              </Heading>

              {subtitle && (
                <Text
                  className="text-typography-600 text-base"
                  testID={`${testID}-subtitle`}
                >
                  {subtitle}
                </Text>
              )}
            </VStack>

            {/* Form Content */}
            <Box testID={`${testID}-content`}>
              {children}
            </Box>
          </VStack>

          {/* Footer */}
          {footer && (
            <Box className="px-6 pb-6" testID={`${testID}-footer`}>
              {footer}
            </Box>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
