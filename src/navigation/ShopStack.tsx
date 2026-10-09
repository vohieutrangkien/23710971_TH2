import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '@screens/HomeScreen';
import { DetailScreen } from '@screens/DetailScreen';
import { VARIANT } from '@constants/student';
import { COLORS } from '@constants/theme';

export type ShopStackParamList = {
  Home: undefined;
  Detail: { id: string };
};

const Stack = createNativeStackNavigator<ShopStackParamList>();

export const ShopStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerTintColor: COLORS.primary,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Detail"
        component={DetailScreen}
        options={{
          title: 'Chi tiết món',
          presentation: VARIANT.detailPresentation === 'modal' ? 'modal' : 'card',
        }}
      />
    </Stack.Navigator>
  );
};
