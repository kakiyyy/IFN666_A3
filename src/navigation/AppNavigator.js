import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';

import { useAuth } from '../context/AuthContext';
import { colors } from '../constants/colors';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import TutorialsScreen from '../screens/TutorialsScreen';
import TutorialDetailScreen from '../screens/TutorialDetailScreen';
import TutorialFormScreen from '../screens/TutorialFormScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import CategoryDetailScreen from '../screens/CategoryDetailScreen';
import MaterialsScreen from '../screens/MaterialsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const linking = {
  prefixes: [Linking.createURL('/'), 'kaki://'],
  config: {
    screens: {
      MainTabs: {
        screens: {
          Tutorials: {
            screens: {
              TutorialsList: 'tutorials',
              TutorialDetail: 'tutorials/:id',
            },
          },
          Categories: {
            screens: {
              CategoriesList: 'categories',
              CategoryDetail: 'categories/:id',
            },
          },
        },
      },
    },
  },
};

const screenOptions = {
  headerStyle: { backgroundColor: colors.surface },
  headerTintColor: colors.text,
  headerTitleStyle: { fontWeight: '700' },
  contentStyle: { backgroundColor: colors.background },
};

function TutorialsStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="TutorialsList" component={TutorialsScreen} options={{ title: 'Tutorials' }} />
      <Stack.Screen name="TutorialDetail" component={TutorialDetailScreen} options={{ title: 'Tutorial' }} />
      <Stack.Screen name="TutorialForm" component={TutorialFormScreen} options={({ route }) => ({ title: route.params?.id ? 'Edit Tutorial' : 'New Tutorial' })} />
    </Stack.Navigator>
  );
}

function CategoriesStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="CategoriesList" component={CategoriesScreen} options={{ title: 'Categories' }} />
      <Stack.Screen name="CategoryDetail" component={CategoryDetailScreen} options={({ route }) => ({ title: route.params?.name ?? 'Category' })} />
    </Stack.Navigator>
  );
}

function MaterialsStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="MaterialsList" component={MaterialsScreen} options={{ title: 'Materials' }} />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            Tutorials: focused ? 'book' : 'book-outline',
            Categories: focused ? 'folder' : 'folder-outline',
            Materials: focused ? 'cube' : 'cube-outline',
            Profile: focused ? 'person' : 'person-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Tutorials" component={TutorialsStack} />
      <Tab.Screen name="Categories" component={CategoriesStack} />
      <Tab.Screen name="Materials" component={MaterialsStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ ...screenOptions, headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: true, title: 'Register' }} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { token, loading } = useAuth();

  if (loading) return null;

  return (
    <NavigationContainer linking={linking}>
      {token ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="MainTabs" component={MainTabs} />
        </Stack.Navigator>
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
}
