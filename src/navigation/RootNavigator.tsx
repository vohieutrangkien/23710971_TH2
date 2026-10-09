import React from 'react';
import { AuthStack } from './AuthStack';
import { MainTabs } from './MainTabs';
import { useAuthStore } from '@stores/authStore';

export const RootNavigator: React.FC = () => {
  const token = useAuthStore(state => state.token);

  return token ? <MainTabs /> : <AuthStack />;
};
