import type { VisitResponseBFF } from '@/api/generated/models/visitResponseBFF';
import type { VisitStatusFilter } from '@/api/generated/models/visitStatusFilter';
import { listVisitsBffSellersAppVisitsGet } from '@/api/generated/sellers-app/sellers-app';
import { BottomSheet } from '@/components/BottomSheet';
import { PaginatedList } from '@/components/PaginatedList';
import { SearchBar } from '@/components/SearchBar';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { VisitCard } from '@/components/VisitCard';
import { useInfinitePaginatedQuery } from '@/hooks';
import { useTranslation } from '@/i18n/hooks';
import { useNavigationStore } from '@/store/useNavigationStore';
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
  const query = useInfinitePaginatedQuery<VisitResponseBFF>({
    queryKey: [
      'visits',
      { status: statusFilter, client_name: debouncedSearch || undefined },
    ],
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

  const handleVisitPress = (visit: VisitResponseBFF) => {
    // Set visit in global store (in-memory only)
    setCurrentVisit(visit);
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
      case 'today': {
        return t('visits.filterToday');
      }
      case 'past': {
        return t('visits.filterPast');
      }
      case 'future': {
        return t('visits.filterFuture');
      }
      /* istanbul ignore next */
      default:
        return t('visits.filterToday');
    }
  };

  const renderVisit = ({ item }: { item: VisitResponseBFF }) => {
    // Map from API format (Spanish) to component props (English)
    // Note: client_representante is added by mock handlers, not in generated types
    const itemWithRepresentante = item as VisitResponseBFF & {
      client_representante?: string;
    };

    const visitData = {
      id: item.id,
      clientName:
        itemWithRepresentante.client_representante || item.client_nombre_institucion,
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

  return (
    <>
      <PaginatedList.Container
        query={query}
        title={t('visits.title')}
        testID="visits-screen"
      >
        <PaginatedList.Header>
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
              <ButtonText className="ml-2 text-typography-900">
                {getFilterLabel()}
              </ButtonText>
            </Button>
          </HStack>
        </PaginatedList.Header>

        <PaginatedList.Content
          renderItem={renderVisit}
          keyExtractor={(item) => item.id}
          testID="visits-list"
          loadingMessage={t('visits.loadingVisits')}
          loadingTestID="visits-loading"
          errorTestID="visits-error"
          footerLoadingMessage={t('visits.loadingMore')}
          footerLoadingTestID="visits-load-more-spinner"
          ListEmptyComponent={
            <PaginatedList.Empty
              icon={Calendar}
              title={t('visits.emptyState')}
              description={t('visits.emptyStateDescription')}
              testID="visits-empty-state"
            />
          }
          estimatedItemSize={120}
        />
      </PaginatedList.Container>

      {/* istanbul ignore next */}
      <BottomSheet
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        title={t('visits.filterBy')}
        options={[
          {
            label: t('visits.filterToday'),
            value: 'today',
          },
          {
            label: t('visits.filterPast'),
            value: 'past',
          },
          {
            label: t('visits.filterFuture'),
            value: 'future',
          },
        ]}
        selectedValue={statusFilter}
        onSelect={handleFilterSelect}
        testID="filter-status-modal"
      />
    </>
  );
};
