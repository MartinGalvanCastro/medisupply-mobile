import type { VisitResponseBFF } from '@/api/generated/models/visitResponseBFF';
import { useListVisitsBffSellersAppVisitsGet } from '@/api/generated/sellers-app/sellers-app';
import { VisitCard, type VisitStatus } from '@/components/VisitCard';
import { SearchBar } from '@/components/SearchBar';
import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useTranslation } from '@/i18n/hooks';
import { FlashList } from '@shopify/flash-list';
import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

export const VisitsScreen = () => {
  const { t } = useTranslation();
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const { data, isLoading, error } = useListVisitsBffSellersAppVisitsGet(
    { date: new Date().toISOString().split('T')[0] },
    {
      query: {
        enabled: true,
        staleTime: 5 * 60 * 1000,
      },
    }
  );

  // Filter visits client-side based on search text
  const allVisits = data?.visits || [];
  const visits = debouncedSearch
    ? allVisits.filter((visit) => {
        const searchLower = debouncedSearch.toLowerCase();
        const visitWithRepresentante = visit as VisitResponseBFF & {
          client_representante?: string;
        };
        return (
          visitWithRepresentante.client_representante?.toLowerCase().includes(searchLower) ||
          visit.client_nombre_institucion?.toLowerCase().includes(searchLower) ||
          visit.client_ciudad?.toLowerCase().includes(searchLower) ||
          visit.status?.toLowerCase().includes(searchLower)
        );
      })
    : allVisits;

  const handleVisitPress = (visitId: string) => {
    router.push(`/visit/${visitId}`);
  };

  const handleSearchChange = (text: string) => {
    setSearchText(text);
  };

  const handleDebouncedChange = (text: string) => {
    setDebouncedSearch(text);
  };

  const renderVisit = ({ item }: { item: VisitResponseBFF }) => {
    // Map from API format (Spanish) to component props (English)
    // Note: client_representante is added by mock handlers, not in generated types
    const itemWithRepresentante = item as VisitResponseBFF & { client_representante?: string };

    const visitData = {
      id: item.id,
      clientName: itemWithRepresentante.client_representante || item.client_nombre_institucion,
      institutionName: item.client_nombre_institucion,
      visitDate: item.fecha_visita,
      status: item.status as VisitStatus,
      notes: item.notas_visita,
      location: item.client_direccion,
    };

    return (
      <VisitCard
        visit={visitData}
        onPress={() => handleVisitPress(item.id)}
        testID={`visit-card-${item.id}`}
      />
    );
  };

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <Box className="flex-1 justify-center items-center p-8">
          <Text className="text-typography-600 text-center">{t('visits.loadingVisits')}</Text>
        </Box>
      );
    }

    if (error) {
      return (
        <Box className="flex-1 justify-center items-center p-8">
          <Text className="text-typography-600 text-center">{t('common.error')}</Text>
        </Box>
      );
    }

    return (
      <Box className="flex-1 justify-center items-center p-8">
        <Text className="text-typography-900 text-lg font-semibold mb-2">
          {t('visits.emptyState')}
        </Text>
        <Text className="text-typography-600 text-center">
          {t('visits.emptyStateDescription')}
        </Text>
      </Box>
    );
  };

  return (
    <SafeAreaView testID="visits-screen" style={styles.container}>
      <VStack space="lg" className="flex-1 px-4 py-2">
        <Heading size="2xl" className="text-typography-900">
          {t('visits.title')}
        </Heading>

        <SearchBar
          value={searchText}
          onChangeText={handleSearchChange}
          onDebouncedChange={handleDebouncedChange}
          placeholder={t('visits.searchPlaceholder')}
          testID="visits-search-bar"
        />

        <Box className="flex-1">
          <FlashList
            data={visits}
            renderItem={renderVisit}
            ListEmptyComponent={renderEmpty}
            keyExtractor={(item) => item.id}
            testID="visits-list"
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
