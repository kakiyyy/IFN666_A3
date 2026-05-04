import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors } from '../constants/colors';

export default function ProfileScreen({ navigation }) {
  const { token, userId, logout } = useAuth();
  if (!token) return <View style={styles.container}><Text style={styles.text}>You are browsing as a public user.</Text><TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('Login')}><Text style={styles.btnText}>Login</Text></TouchableOpacity><TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('Register')}><Text style={styles.btnText}>Register</Text></TouchableOpacity></View>;
  return <View style={styles.container}><Text style={styles.text}>Logged in user: {userId}</Text><TouchableOpacity style={[styles.btn,{backgroundColor:colors.danger}]} onPress={logout}><Text style={styles.btnText}>Logout</Text></TouchableOpacity></View>;
}
const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: colors.background, padding: 20, justifyContent: 'center' }, text: { color: colors.text, marginBottom: 16, fontSize: 16 }, btn: { backgroundColor: colors.primary, borderRadius: 8, padding: 12, marginBottom: 10 }, btnText: { color: '#fff', textAlign: 'center', fontWeight: '700' } });
