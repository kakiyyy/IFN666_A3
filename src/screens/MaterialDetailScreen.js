import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, Share } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { getMaterial, deleteMaterial } from '../services/materialService';
import { colors } from '../constants/colors';
import { buildShareMessage } from '../utils/shareMessages';
import { displayValue } from '../utils/displayValue';

export default function MaterialDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const { token, userId } = useAuth();
  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setMaterial(await getMaterial(id));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const isOwner = Boolean(userId) && material && String(material.owner) === String(userId);

  const onShare = async () => {
    if (!material) return;
    await Share.share({ title: material.name, message: buildShareMessage('material', material) });
  };

  const onDelete = () => {
    Alert.alert('Delete Material', 'Are you sure you want to delete this material?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteMaterial(token, id);
            navigation.navigate('MaterialsList');
          } catch (e) {
            Alert.alert('Error', e.message);
          }
        },
      },
    ]);
  };

  if (loading) return <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>;
  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.serverErrorTitle}>Server unavailable</Text>
        <Text style={styles.serverErrorMessage}>
          We could not connect to the server. Please check your internet connection or try again later.
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={load}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{displayValue(material.name)}</Text>
      <Text style={styles.text}>Purchase source: {displayValue(material.purchaseSource)}</Text>
      <TouchableOpacity style={styles.share} onPress={onShare}>
        <Text style={styles.shareText}>Share</Text>
      </TouchableOpacity>
      {isOwner && (
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.editBtn]}
            onPress={() => navigation.navigate('MaterialsList', { editMaterial: material })}
          >
            <Text style={styles.actionBtnText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.deleteBtn]}
            onPress={onDelete}
          >
            <Text style={styles.actionBtnText}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { color: colors.text, fontSize: 24, fontWeight: '700', marginBottom: 12 },
  text: { color: colors.text },
  share: { backgroundColor: colors.primary, padding: 12, borderRadius: 8, marginTop: 20 },
  shareText: { color: '#fff', textAlign: 'center', fontWeight: '700' },
  actionsRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  actionBtn: { flex: 1, borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
  editBtn: { backgroundColor: colors.primary },
  deleteBtn: { backgroundColor: colors.danger },
  actionBtnText: { color: '#fff', fontWeight: '700' },
  serverErrorTitle: { color: colors.text, fontSize: 20, fontWeight: '700', marginBottom: 8 },
  serverErrorMessage: { color: colors.muted, textAlign: 'center', lineHeight: 20, marginBottom: 16, paddingHorizontal: 24 },
  retryButton: { backgroundColor: colors.primary, borderRadius: 8, paddingHorizontal: 20, paddingVertical: 12 },
  retryButtonText: { color: '#fff', fontWeight: '700' },
});
