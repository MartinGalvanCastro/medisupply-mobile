import React from 'react';
import { StyleSheet, FlatList, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { useTranslation } from '@/i18n/hooks';
import { User } from 'lucide-react-native';
import type { ClientResponse } from '@/api/generated/models/clientResponse';

interface ClientSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  clients: ClientResponse[];
  onSelectClient: (client: ClientResponse) => void;
  testID?: string;
}

export const ClientSelectorModal = ({
  visible,
  onClose,
  clients,
  onSelectClient,
  testID,
}: ClientSelectorModalProps) => {
  const { t } = useTranslation();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      testID={testID}
    >
      <Pressable
        style={styles.modalOverlay}
        onPress={onClose}
        testID="modal-overlay"
      >
        <Pressable
          style={styles.modalContent}
          onPress={(e) => e.stopPropagation()}
          testID="modal-content"
        >
          <VStack space="md" style={{ height: '100%' }}>
            {/* Modal Header */}
            <HStack space="md" className="items-center justify-between pb-4 border-b border-outline-200">
              <Heading size="lg">{t('cart.selectClient')}</Heading>
              <TouchableOpacity
                onPress={onClose}
                testID="close-client-selector"
              >
                <Text className="text-primary-600 font-semibold">
                  {t('common.close')}
                </Text>
              </TouchableOpacity>
            </HStack>

            {/* Clients List */}
            <FlatList
              data={clients}
              keyExtractor={(item) => item.cliente_id}
              style={{ flex: 1 }}
              contentContainerStyle={{ flexGrow: 1 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => onSelectClient(item)}
                  testID={`client-option-${item.cliente_id}`}
                  style={styles.clientItem}
                >
                  <HStack space="sm" className="items-center">
                    <Box className="bg-primary-100 rounded-full p-3">
                      <User size={20} color="#7c3aed" />
                    </Box>
                    <VStack space="xs" className="flex-1">
                      <Text size="md" className="text-typography-900 font-medium">
                        {item.representante}
                      </Text>
                      <Text size="sm" className="text-typography-600">
                        {item.nombre_institucion}
                      </Text>
                      {item.ciudad && (
                        <Text size="xs" className="text-typography-500">
                          {item.ciudad}
                        </Text>
                      )}
                    </VStack>
                  </HStack>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Box className="p-8 items-center">
                  <Text className="text-typography-600 text-center">
                    {t('clients.emptyState')}
                  </Text>
                </Box>
              }
            />
          </VStack>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    height: '80%',
  },
  clientItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
});
