import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Handcraft Tutorial</Text>
      <Text style={styles.desc}>Browse handcraft tutorials, categories, and materials.</Text>
      <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('Tutorials')}><Text style={styles.btnText}>Browse Tutorials</Text></TouchableOpacity>
      <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('Categories')}><Text style={styles.btnText}>Browse Categories</Text></TouchableOpacity>
      <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('Materials')}><Text style={styles.btnText}>Browse Materials</Text></TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: colors.background, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '700', color: colors.text, marginBottom: 8 },
  desc: { fontSize: 15, color: colors.muted, marginBottom: 24 },
  btn: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 10, padding: 14, marginBottom: 12 },
  btnText: { color: colors.text, fontWeight: '600' },
});
