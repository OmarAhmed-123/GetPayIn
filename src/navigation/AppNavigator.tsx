import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { logout } from '../store/authSlice';
import LoginScreen from '../screens/LoginScreen';
import ProductsScreen from '../screens/ProductsScreen';
import CategoryScreen from '../screens/CategoryScreen';
import { RootStackParamList, MainTabParamList } from '../types';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Move the tabBarIcon component outside to avoid nested component definition
const getTabBarIcon = (routeName: string, color: string, size: number) => {
  let iconName: string;

  if (routeName === 'Products') {
    iconName = 'inventory';
  } else if (routeName === 'SignOut') {
    iconName = 'logout';
  } else {
    iconName = 'category';
  }

  return <Icon name={iconName} size={size} color={color} />;
};

const MainTabNavigator: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const handleSignOut = () => {
    dispatch(logout());
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => getTabBarIcon(route.name, color, size),
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Products"
        component={ProductsScreen}
        options={{
          title: 'All Products',
        }}
      />
      <Tab.Screen
        name="SignOut"
        component={() => null}
        options={{
          title: 'Sign Out',
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            handleSignOut();
          },
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator: React.FC = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabNavigator} />
            <Stack.Screen
              name="Category"
              component={CategoryScreen}
              options={{
                headerShown: true,
                title: 'Category',
                headerStyle: {
                  backgroundColor: '#6366f1',
                },
                headerTintColor: '#ffffff',
                headerTitleStyle: {
                  fontWeight: 'bold',
                },
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
