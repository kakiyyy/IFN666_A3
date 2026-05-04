import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { colors } from '../constants/colors';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import TutorialsScreen from '../screens/TutorialsScreen';
import TutorialDetailScreen from '../screens/TutorialDetailScreen';
import TutorialFormScreen from '../screens/TutorialFormScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import CategoryDetailScreen from '../screens/CategoryDetailScreen';
import MaterialsScreen from '../screens/MaterialsScreen';
import MaterialDetailScreen from '../screens/MaterialDetailScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator(); const Tab = createBottomTabNavigator();
const linking = { prefixes: [Linking.createURL('/'), 'ifn666://', 'https://ifn666.com'], config: { screens: { MainTabs: { screens: { Home: '', Tutorials: { screens: { TutorialsList: 'tutorials', TutorialDetail: 'tutorials/:id' } }, Categories: { screens: { CategoriesList: 'categories', CategoryDetail: 'categories/:id' } }, Materials: { screens: { MaterialsList: 'materials', MaterialDetail: 'materials/:id' } }, Profile: { screens: { ProfileMain: 'profile', Login: 'login', Register: 'register' } } } } } } };
const screenOptions = { headerStyle: { backgroundColor: colors.surface }, headerTintColor: colors.text, contentStyle: { backgroundColor: colors.background } };
function TutorialsStack(){return <Stack.Navigator screenOptions={screenOptions}><Stack.Screen name="TutorialsList" component={TutorialsScreen} options={{title:'Tutorials'}}/><Stack.Screen name="TutorialDetail" component={TutorialDetailScreen}/><Stack.Screen name="TutorialForm" component={TutorialFormScreen}/></Stack.Navigator>;}
function CategoriesStack(){return <Stack.Navigator screenOptions={screenOptions}><Stack.Screen name="CategoriesList" component={CategoriesScreen}/><Stack.Screen name="CategoryDetail" component={CategoryDetailScreen}/></Stack.Navigator>;}
function MaterialsStack(){return <Stack.Navigator screenOptions={screenOptions}><Stack.Screen name="MaterialsList" component={MaterialsScreen}/><Stack.Screen name="MaterialDetail" component={MaterialDetailScreen}/></Stack.Navigator>;}
function ProfileStack(){return <Stack.Navigator screenOptions={screenOptions}><Stack.Screen name="ProfileMain" component={ProfileScreen} options={{title:'Profile'}}/><Stack.Screen name="Login" component={LoginScreen}/><Stack.Screen name="Register" component={RegisterScreen}/></Stack.Navigator>;}
export default function AppNavigator(){return <NavigationContainer linking={linking}><Tab.Navigator screenOptions={({route})=>({headerShown:false,tabBarIcon:({color,size,focused})=>{const m={Home:focused?'home':'home-outline',Tutorials:focused?'book':'book-outline',Categories:focused?'folder':'folder-outline',Materials:focused?'cube':'cube-outline',Profile:focused?'person':'person-outline'};return <Ionicons name={m[route.name]} color={color} size={size}/>;}})}><Tab.Screen name="Home" component={HomeScreen}/><Tab.Screen name="Tutorials" component={TutorialsStack}/><Tab.Screen name="Categories" component={CategoriesStack}/><Tab.Screen name="Materials" component={MaterialsStack}/><Tab.Screen name="Profile" component={ProfileStack}/></Tab.Navigator></NavigationContainer>;}
