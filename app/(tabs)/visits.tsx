import { StyleSheet, View, ScrollView } from 'react-native';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Button, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';

export default function VisitsScreen() {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <VStack space="lg" className="p-4">
          <Heading size="xl">Visits</Heading>
          <Text size="sm" className="text-typography-500">
            Today's visit route and schedule
          </Text>

          {/* Placeholder for visits list */}
          <View className="mt-4 p-4 bg-gray-100 rounded-lg">
            <Text className="text-center text-typography-400">
              No visits scheduled for today
            </Text>
          </View>

          {/* Register Visit Button */}
          <Button action="primary" className="mt-4">
            <ButtonText>Register Visit</ButtonText>
          </Button>
        </VStack>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
  },
});
