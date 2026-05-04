import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

const palette = {
  Beginner: '#30d158',
  Intermediate: '#ffd60a',
  Advanced: '#ff453a',
};

export default function DifficultyBadge({ difficulty }) {
  const bg = palette[difficulty] ?? colors.muted;
  return <Text style={[styles.badge, { backgroundColor: bg }]}>{difficulty}</Text>;
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    fontSize: 11,
    fontWeight: '600',
    color: '#000',
    overflow: 'hidden',
  },
});
