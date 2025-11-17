import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';
import type { ScreenContainerProps } from './types';

export const ScreenContainer = ({
  children,
  testID = 'screen-container',
}: ScreenContainerProps) => {
  return (
    <SafeAreaView testID={testID} style={styles.container}>
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
