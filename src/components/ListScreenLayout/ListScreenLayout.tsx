import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';
import { VStack } from '@/components/ui/vstack';
import { Heading } from '@/components/ui/heading';
import { Box } from '@/components/ui/box';
import type { ListScreenLayoutProps } from './types';

export const ListScreenLayout = ({
  title,
  children,
  testID = 'list-screen-layout',
}: ListScreenLayoutProps) => {
  return (
    <SafeAreaView testID={testID} style={styles.container}>
      <VStack space="lg" className="flex-1 px-4 py-2">
        <Heading
          size="2xl"
          className="text-typography-900"
          testID={`${testID}-title`}
        >
          {title}
        </Heading>

        <Box className="flex-1" testID={`${testID}-content`}>
          {children}
        </Box>
      </VStack>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
