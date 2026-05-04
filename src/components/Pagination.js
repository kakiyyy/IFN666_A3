import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

export default function Pagination({ page, totalPages, onPrev, onNext }) {
  if (totalPages <= 1) return null;
  return (
    <View style={styles.row}>
      <TouchableOpacity
        style={[styles.btn, page <= 1 && styles.disabled]}
        onPress={onPrev}
        disabled={page <= 1}
      >
        <Text style={styles.btnText}>‹ Prev</Text>
      </TouchableOpacity>
      <Text style={styles.info}>
        {page} / {totalPages}
      </Text>
      <TouchableOpacity
        style={[styles.btn, page >= totalPages && styles.disabled]}
        onPress={onNext}
        disabled={page >= totalPages}
      >
        <Text style={styles.btnText}>Next ›</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 12,
  },
  btn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  disabled: { opacity: 0.35 },
  btnText: { color: '#fff', fontWeight: '600' },
  info: { color: colors.muted, fontSize: 14 },
});
