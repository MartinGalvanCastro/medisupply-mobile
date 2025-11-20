import type { ClientResponse } from '@/api/generated/models/clientResponse';
import { listClientsBffSellersAppClientsGet } from '@/api/generated/sellers-app/sellers-app';
import { ClientCard } from '@/components/ClientCard';
import { ListScreenLayout } from '@/components/ListScreenLayout';
import { EmptyState } from '@/components/EmptyState';
import { ErrorStateCard } from '@/components/ErrorStateCard';
import { LoadingCard } from '@/components/LoadingCard';
import { SearchBar } from '@/components/SearchBar';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Spinner } from '@/components/ui/spinner';
import { useTranslation } from '@/i18n/hooks';
import { useInfinitePaginatedQuery } from '@/hooks';
import { useNavigationStore } from '@/store/useNavigationStore';
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { useState } from 'react';
import { Users } from 'lucide-react-native';

export const ClientsScreen = () => {
  const { t } = useTranslation();
  const setCurrentClient = useNavigationStore((state) => state.setCurrentClient);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Use infinite pagination hook with server-side filtering
  const {
    data: clients,
    total,
    isLoading,
    isError,
    error,
    isFetchingNextPage,
    isRefetching,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useInfinitePaginatedQuery<ClientResponse>({
    queryKey: ['clients', { client_name: debouncedSearch || undefined }],
    queryFn: ({ page, size }) =>
      listClientsBffSellersAppClientsGet({
        client_name: debouncedSearch || undefined,
        page,
        page_size: size,
      }),
    pageSize: 20,
    staleTime: 5 * 60 * 1000,
  });

  // Pull-to-refresh handler
  const handleRefresh = () => {
    refetch();
  };

  const handleClientPress = (client: ClientResponse) => {
    // Set client in global store (in-memory only)
    setCurrentClient(client);
    // Navigate with only the ID
    router.push(`/client/${client.cliente_id}`);
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
        onPress={() => handleClientPress(item)}
        testID={`client-card-${item.cliente_id}`}
      />
    );
  };

  // Handle load more (automatic on scroll)
  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  // Footer component for loading indicator
  const renderFooter = () => {
    if (isFetchingNextPage) {
      return (
        <Box className="p-4 items-center">
          <VStack space="sm" className="items-center">
            <Spinner size="small" testID="clients-load-more-spinner" />
            <Text className="text-typography-500 text-sm">
              {t('clients.loadingMore')}
            </Text>
          </VStack>
        </Box>
      );
    }
    return null;
  };

  // Early returns for loading/error states
  if (isLoading) {
    return (
      <ListScreenLayout
        title={t('clients.title')}
        testID="clients-screen"
      >
        <VStack space="lg" className="flex-1">
          <SearchBar
            value={searchText}
            onChangeText={handleSearchChange}
            onDebouncedChange={handleDebouncedChange}
            placeholder={t('clients.searchPlaceholder')}
            testID="clients-search-bar"
          />
          <LoadingCard
            message={t('clients.loadingClients')}
            testID="clients-loading"
          />
        </VStack>
      </ListScreenLayout>
    );
  }

  if (isError) {
    const errorMessage = error?.message || 'Failed to load clients';
    return (
      <ListScreenLayout
        title={t('clients.title')}
        testID="clients-screen"
      >
        <VStack space="lg" className="flex-1">
          <SearchBar
            value={searchText}
            onChangeText={handleSearchChange}
            onDebouncedChange={handleDebouncedChange}
            placeholder={t('clients.searchPlaceholder')}
            testID="clients-search-bar"
          />
          <ErrorStateCard
            title={t('common.error')}
            message={errorMessage}
            onRetry={() => refetch()}
            retryLabel={t('common.retry')}
            testID="clients-error"
          />
        </VStack>
      </ListScreenLayout>
    );
  }

  return (
    <ListScreenLayout
      title={t('clients.title')}
      testID="clients-screen"
    >
      <VStack space="lg" className="flex-1">
        <SearchBar
          value={searchText}
          onChangeText={handleSearchChange}
          onDebouncedChange={handleDebouncedChange}
          placeholder={t('clients.searchPlaceholder')}
          testID="clients-search-bar"
        />
        <FlashList
        data={clients}
        renderItem={renderClient}
        ListEmptyComponent={
          <EmptyState
            icon={Users}
            title={t('clients.emptyState')}
            description={t('clients.emptyStateDescription')}
            testID="clients-empty-state"
          />
        }
        ListFooterComponent={renderFooter}
        keyExtractor={(item) => item.cliente_id}
        testID="clients-list"
        onRefresh={handleRefresh}
        refreshing={isRefetching}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
      />
      </VStack>
    </ListScreenLayout>
  );
};
