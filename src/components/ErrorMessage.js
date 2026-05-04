import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

export default function ErrorMessage({ message }) {
  if (!message) return null;
  return <Text style={styles.text}>{message}</Text>;
}

const styles = StyleSheet.create({
  text: {
    color: colors.danger,
    fontSize: 13,
    marginVertical: 6,
    textAlign: 'center',
  },
});
