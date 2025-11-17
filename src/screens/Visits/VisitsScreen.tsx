import type { VisitResponseBFF } from '@/api/generated/models/visitResponseBFF';
import type { VisitStatusFilter } from '@/api/generated/models/visitStatusFilter';
import { listVisitsBffSellersAppVisitsGet } from '@/api/generated/sellers-app/sellers-app';
import { BottomSheet } from '@/components/BottomSheet';
import { EmptyState } from '@/components/EmptyState';
import { ErrorStateCard } from '@/components/ErrorStateCard';
import { ListScreenLayout } from '@/components/ListScreenLayout';
import { LoadingCard } from '@/components/LoadingCard';
import { SearchBar } from '@/components/SearchBar';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { VisitCard } from '@/components/VisitCard';
import { useInfinitePaginatedQuery } from '@/hooks';
import { useTranslation } from '@/i18n/hooks';
import { useNavigationStore } from '@/store/useNavigationStore';
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { Calendar, Filter } from 'lucide-react-native';
import { useState } from 'react';

export const VisitsScreen = () => {
  const { t } = useTranslation();
  const setCurrentVisit = useNavigationStore((state) => state.setCurrentVisit);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<VisitStatusFilter>('today');
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Use infinite pagination hook with server-side filtering
  const {
    data: visits,
    total,
    isLoading,
    isError,
    error,
    isFetchingNextPage,
    isRefetching,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useInfinitePaginatedQuery<VisitResponseBFF>({
    queryKey: ['visits', { status: statusFilter, client_name: debouncedSearch || undefined }],
    queryFn: ({ page, size }) =>
      listVisitsBffSellersAppVisitsGet({
        status: statusFilter,
        page,
        page_size: size,
        client_name: debouncedSearch || undefined,
      }),
    pageSize: 20,
    staleTime: 5 * 60 * 1000,
  });

  console.log('📊 [VisitsScreen] Total visits loaded:', visits.length);
  console.log('📊 [VisitsScreen] First 3 visits:', visits.slice(0, 3).map(v => ({ id: v.id, status: v.status })));

  // Pull-to-refresh handler
  const handleRefresh = () => {
    refetch();
  };

  const handleVisitPress = (visit: VisitResponseBFF) => {
    console.log('📋 [VisitsScreen] Visit pressed:', visit);
    console.log('📋 [VisitsScreen] Visit status:', visit.status);
    // Set visit in global store (in-memory only)
    setCurrentVisit(visit);
    console.log('📋 [VisitsScreen] Set visit in global store');
    // Navigate with only the ID
    router.push(`/visit/${visit.id}`);
  };

  const handleSearchChange = (text: string) => {
    setSearchText(text);
  };

  const handleDebouncedChange = (text: string) => {
    setDebouncedSearch(text);
  };

  const handleFilterSelect = (selected: string) => {
    setStatusFilter(selected as VisitStatusFilter);
    setShowFilterModal(false);
  };

  const getFilterLabel = () => {
    switch (statusFilter) {
      case 'today':
        return t('visits.filterToday') || 'Today';
      case 'past':
        return t('visits.filterPast') || 'Past';
      case 'future':
        return t('visits.filterFuture') || 'Future';
    }
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
      status: item.status,
      notes: item.notas_visita,
      location: item.client_direccion,
    };

    return (
      <VisitCard
        visit={visitData}
        onPress={() => handleVisitPress(item)}
        testID={`visit-card-${item.id}`}
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
            <Spinner size="small" testID="visits-load-more-spinner" />
            <Text className="text-typography-500 text-sm">
              {t('visits.loadingMore') || 'Loading more...'}
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
        title={t('visits.title')}
        testID="visits-screen"
      >
        <VStack space="lg" className="flex-1">
          <HStack space="sm" className="items-center">
            <Box className="flex-1">
              <SearchBar
                value={searchText}
                onChangeText={handleSearchChange}
                onDebouncedChange={handleDebouncedChange}
                placeholder={t('visits.searchPlaceholder')}
                testID="visits-search-bar"
              />
            </Box>
            <Button
              size="sm"
              variant="outline"
              action="secondary"
              onPress={() => setShowFilterModal(true)}
              testID="filter-status-button"
              className="border-outline-500"
            >
              <Filter size={16} color="#6B7280" />
              <ButtonText className="ml-2 text-typography-900">{getFilterLabel()}</ButtonText>
            </Button>
          </HStack>
          <LoadingCard
            message={t('visits.loadingVisits')}
            testID="visits-loading"
          />
        </VStack>
      </ListScreenLayout>
    );
  }

  if (isError) {
    const errorMessage = error?.message || 'Failed to load visits';
    return (
      <ListScreenLayout
        title={t('visits.title')}
        testID="visits-screen"
      >
        <VStack space="lg" className="flex-1">
          <HStack space="sm" className="items-center">
            <Box className="flex-1">
              <SearchBar
                value={searchText}
                onChangeText={handleSearchChange}
                onDebouncedChange={handleDebouncedChange}
                placeholder={t('visits.searchPlaceholder')}
                testID="visits-search-bar"
              />
            </Box>
            <Button
              size="sm"
              variant="outline"
              action="secondary"
              onPress={() => setShowFilterModal(true)}
              testID="filter-status-button"
              className="border-outline-500"
            >
              <Filter size={16} color="#6B7280" />
              <ButtonText className="ml-2 text-typography-900">{getFilterLabel()}</ButtonText>
            </Button>
          </HStack>
          <ErrorStateCard
            title={t('common.error')}
            message={errorMessage}
            onRetry={() => refetch()}
            retryLabel={t('common.retry') || 'Retry'}
            testID="visits-error"
          />
        </VStack>
      </ListScreenLayout>
    );
  }

  return (
    <ListScreenLayout
      title={t('visits.title')}
      testID="visits-screen"
    >
      <VStack space="lg" className="flex-1">
        <HStack space="sm" className="items-center">
          <Box className="flex-1">
            <SearchBar
              value={searchText}
              onChangeText={handleSearchChange}
              onDebouncedChange={handleDebouncedChange}
              placeholder={t('visits.searchPlaceholder')}
              testID="visits-search-bar"
            />
          </Box>
          <Button
            size="sm"
            variant="outline"
            action="secondary"
            onPress={() => setShowFilterModal(true)}
            testID="filter-status-button"
            className="border-outline-500"
          >
            <Filter size={16} color="#6B7280" />
            <ButtonText className="ml-2 text-typography-900">{getFilterLabel()}</ButtonText>
          </Button>
        </HStack>
        <FlashList
        data={visits}
        renderItem={renderVisit}
        ListEmptyComponent={
          <EmptyState
            icon={Calendar}
            title={t('visits.emptyState')}
            description={t('visits.emptyStateDescription')}
            testID="visits-empty-state"
          />
        }
        ListFooterComponent={renderFooter}
        keyExtractor={(item) => item.id}
        testID="visits-list"
        onRefresh={handleRefresh}
        refreshing={isRefetching}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
      />
      </VStack>

      <BottomSheet
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        title={t('visits.filterBy') || 'Filter By'}
        options={[
          {
            label: t('visits.filterToday') || 'Today',
            value: 'today',
          },
          {
            label: t('visits.filterPast') || 'Past',
            value: 'past',
          },
          {
            label: t('visits.filterFuture') || 'Future',
            value: 'future',
          },
        ]}
        selectedValue={statusFilter}
        onSelect={handleFilterSelect}
        testID="filter-status-modal"
      />
    </ListScreenLayout>
  );
};
