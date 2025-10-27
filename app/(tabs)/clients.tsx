import { StyleSheet, View, ScrollView } from 'react-native';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Input, InputField } from '@/components/ui/input';

export default function ClientsScreen() {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <VStack space="lg" className="p-4">
          <Heading size="xl">Clients</Heading>
          <Text size="sm" className="text-typography-500">
            Your client list
          </Text>

          {/* Search Bar */}
          <Input variant="outline" size="md">
            <InputField placeholder="Search clients..." />
          </Input>

          {/* Placeholder for clients list */}
          <View className="mt-4 p-4 bg-gray-100 rounded-lg">
            <Text className="text-center text-typography-400">
              No clients found
            </Text>
          </View>
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
