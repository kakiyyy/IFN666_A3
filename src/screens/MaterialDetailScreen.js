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

  const isOwner = material && String(material.owner) === String(userId);

  const onShare = async () => {
    if (!material) return;
    await Share.share({ title: material.name, message: buildShareMessage('material', material) });
  };

  const onDelete = () => {
    Alert.alert('Delete Material', 'Are you sure?', [
      { text: 'Cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteMaterial(token, id);
            navigation.goBack();
          } catch (e) {
            Alert.alert('Error', e.message);
          }
        },
      },
    ]);
  };

  if (loading) return <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>;
  if (error) return <View style={styles.center}><Text style={styles.error}>{error}</Text></View>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{displayValue(material.name)}</Text>
      <Text style={styles.text}>Purchase source: {displayValue(material.purchaseSource)}</Text>
      <TouchableOpacity style={styles.share} onPress={onShare}>
        <Text style={styles.shareText}>Share</Text>
      </TouchableOpacity>
      {isOwner && (
        <TouchableOpacity style={styles.delete} onPress={onDelete}>
          <Text style={styles.shareText}>Delete</Text>
        </TouchableOpacity>
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
  delete: { backgroundColor: colors.danger, padding: 12, borderRadius: 8, marginTop: 10 },
  shareText: { color: '#fff', textAlign: 'center', fontWeight: '700' },
  error: { color: colors.danger },
});
