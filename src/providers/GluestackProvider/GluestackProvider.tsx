import React from 'react';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { config } from '../../../gluestack-ui.config';
import { GluestackProviderProps } from './types';

/**
 * Gluestack UI Provider wrapper
 */
export const GluestackProvider: React.FC<GluestackProviderProps> = ({ children }) => {
  return <GluestackUIProvider config={config}>{children}</GluestackUIProvider>;
};
