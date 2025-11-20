import type { ClientResponse } from '@/api/generated/models/clientResponse';
import { listClientsBffSellersAppClientsGet } from '@/api/generated/sellers-app/sellers-app';
import { ClientCard } from '@/components/ClientCard';
import { PaginatedList } from '@/components/PaginatedList';
import { SearchBar } from '@/components/SearchBar';
import { useInfinitePaginatedQuery } from '@/hooks';
import { useTranslation } from '@/i18n/hooks';
import { useNavigationStore } from '@/store/useNavigationStore';
import { router } from 'expo-router';
import { Users } from 'lucide-react-native';
import { useState } from 'react';

export const ClientsScreen = () => {
  const { t } = useTranslation();
  const setCurrentClient = useNavigationStore((state) => state.setCurrentClient);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Use infinite pagination hook with server-side filtering
  const query = useInfinitePaginatedQuery<ClientResponse>({
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

  return (
    <PaginatedList.Container
      query={query}
      title={t('clients.title')}
      testID="clients-screen"
    >
      <PaginatedList.Header>
        <SearchBar
          value={searchText}
          onChangeText={handleSearchChange}
          onDebouncedChange={handleDebouncedChange}
          placeholder={t('clients.searchPlaceholder')}
          testID="clients-search-bar"
        />
      </PaginatedList.Header>

      <PaginatedList.Content
        renderItem={renderClient}
        keyExtractor={(item) => item.cliente_id}
        testID="clients-list"
        loadingMessage={t('clients.loadingClients')}
        loadingTestID="clients-loading"
        errorTestID="clients-error"
        footerLoadingMessage={t('clients.loadingMore')}
        footerLoadingTestID="clients-load-more-spinner"
        ListEmptyComponent={
          <PaginatedList.Empty
            icon={Users}
            title={t('clients.emptyState')}
            description={t('clients.emptyStateDescription')}
            testID="clients-empty-state"
          />
        }
        estimatedItemSize={100}
      />
    </PaginatedList.Container>
  );
};
