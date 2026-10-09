import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ShopStack } from './ShopStack';
import { CartScreen } from '@screens/CartScreen';
import { MeScreen } from '@screens/MeScreen';
import { useCartStore } from '@stores/cartStore';
import { VARIANT } from '@constants/student';
import { COLORS } from '@constants/theme';

export type MainTabsParamList = {
  ShopTab: undefined;
  CartTab: undefined;
  MeTab: undefined;
};

const Tab = createBottomTabNavigator<MainTabsParamList>();

export const MainTabs: React.FC = () => {
  const totalQty = useCartStore(state => state.totalQuantity());

  const shopScreen = (
    <Tab.Screen
      key="shop"
      name="ShopTab"
      component={ShopStack}
      options={{
        title: 'Cửa hàng',
        headerShown: false,
      }}
    />
  );

  const cartScreen = (
    <Tab.Screen
      key="cart"
      name="CartTab"
      component={CartScreen}
      options={{
        title: 'Giỏ',
        headerShown: false,
        tabBarBadge: totalQty > 0 ? totalQty : undefined,
        tabBarBadgeStyle: {
          backgroundColor: COLORS.secondary,
          color: '#FFFFFF',
          fontSize: 11,
          fontWeight: 'bold',
        },
      }}
    />
  );

  const meScreen = (
    <Tab.Screen
      key="me"
      name="MeTab"
      component={MeScreen}
      options={{
        title: 'Tôi',
        headerShown: false,
      }}
    />
  );

  const tabScreens =
    VARIANT.tabOrder === 'cartFirst'
      ? [cartScreen, shopScreen, meScreen]
      : [shopScreen, cartScreen, meScreen];

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      {tabScreens}
    </Tab.Navigator>
  );
};
