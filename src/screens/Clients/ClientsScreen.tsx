import type { ClientResponse } from '@/api/generated/models/clientResponse';
import { useListClientsBffSellersAppClientsGet } from '@/api/generated/sellers-app/sellers-app';
import { ClientCard } from '@/components/ClientCard';
import { SearchBar } from '@/components/SearchBar';
import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useTranslation } from '@/i18n/hooks';
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const ClientsScreen = () => {
  const { t } = useTranslation();
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const { data, isLoading, error } = useListClientsBffSellersAppClientsGet(
    undefined,
    {
      query: {
        enabled: true,
        staleTime: 5 * 60 * 1000,
      },
    }
  );

  //TODO: FIlter in frontend
  // Filter clients client-side based on search text
  const allClients = data?.clients || [];
  const clients = debouncedSearch
    ? allClients.filter((client) => {
        const searchLower = debouncedSearch.toLowerCase();
        return (
          client.representante?.toLowerCase().includes(searchLower) ||
          client.nombre_institucion?.toLowerCase().includes(searchLower) ||
          client.ciudad?.toLowerCase().includes(searchLower) ||
          client.telefono?.toLowerCase().includes(searchLower)
        );
      })
    : allClients;

  const handleClientPress = (clientId: string) => {
    router.push(`/client/${clientId}`);
  };

  const handleSearchChange = (text: string) => {
    setSearchText(text);
  };

  const handleDebouncedChange = (text: string) => {
    setDebouncedSearch(text);
  };

  const renderClient = ({ item }: { item: ClientResponse }) => {
    // Map from API format (Spanish) to component props (English)
    const clientData = {
      id: item.cliente_id,
      name: item.representante,
      institution_name: item.nombre_institucion,
      institution_type: item.tipo_institucion,
      city: item.ciudad,
      phone: item.telefono,
    };

    return (
      <ClientCard
        client={clientData}
        onPress={() => handleClientPress(item.cliente_id)}
        testID={`client-card-${item.cliente_id}`}
      />
    );
  };

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <Box className="flex-1 justify-center items-center p-8">
          <Text className="text-typography-600 text-center">
            {t('clients.loadingClients')}
          </Text>
        </Box>
      );
    }

    if (error) {
      return (
        <Box className="flex-1 justify-center items-center p-8">
          <Text className="text-typography-600 text-center">
            {t('common.error')}
          </Text>
        </Box>
      );
    }

    return (
      <Box className="flex-1 justify-center items-center p-8">
        <Text className="text-typography-900 text-lg font-semibold mb-2">
          {t('clients.emptyState')}
        </Text>
        <Text className="text-typography-600 text-center">
          {t('clients.emptyStateDescription')}
        </Text>
      </Box>
    );
  };

  return (
    <SafeAreaView testID="clients-screen" style={styles.container}>
      <VStack space="lg" className="flex-1 px-4 py-2">
        <Heading size="2xl" className="text-typography-900">
          {t('clients.title')}
        </Heading>

        <SearchBar
          value={searchText}
          onChangeText={handleSearchChange}
          onDebouncedChange={handleDebouncedChange}
          placeholder={t('clients.searchPlaceholder')}
          testID="clients-search-bar"
        />

        <Box className="flex-1">
          <FlashList
            data={clients}
            renderItem={renderClient}
            ListEmptyComponent={renderEmpty}
            keyExtractor={(item) => item.cliente_id}
            testID="clients-list"
          />
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
