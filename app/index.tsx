import React from 'react';
import { ScrollView } from 'react-native';
import { Link } from 'expo-router';
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  ButtonText,
  Card,
} from '@gluestack-ui/themed';
import { useTranslation } from '@/i18n';

/**
 * Home screen - Main landing page
 */
export default function HomeScreen() {
  const { t } = useTranslation();

  return (
    <ScrollView>
      <Box p="$6" bg="$backgroundLight50">
        <VStack space="xl">
          <VStack space="sm" alignItems="center">
            <Heading size="2xl" textAlign="center">
              {t('home.title')}
            </Heading>
            <Text size="md" textAlign="center" color="$textLight600">
              {t('home.subtitle')}
            </Text>
          </VStack>

          <Card size="md" variant="elevated">
            <VStack space="md">
              <Heading size="lg">{t('home.quickActions')}</Heading>
              <Link href="/products" asChild>
                <Button>
                  <ButtonText>{t('home.viewProducts')}</ButtonText>
                </Button>
              </Link>
              <Link href="/inventory" asChild>
                <Button action="secondary">
                  <ButtonText>{t('home.manageInventory')}</ButtonText>
                </Button>
              </Link>
              <Link href="/orders" asChild>
                <Button variant="outline">
                  <ButtonText>{t('home.viewOrders')}</ButtonText>
                </Button>
              </Link>
            </VStack>
          </Card>

          <Card size="md" variant="elevated">
            <VStack space="md">
              <Heading size="lg">{t('home.features')}</Heading>
              <VStack space="sm">
                <Text size="md">📦 {t('home.productManagement')}</Text>
                <Text size="md">🏭 {t('home.warehouseInventory')}</Text>
                <Text size="md">📱 {t('home.orderProcessing')}</Text>
                <Text size="md">👥 {t('home.sellerManagement')}</Text>
              </VStack>
            </VStack>
          </Card>
        </VStack>
      </Box>
    </ScrollView>
  );
}
