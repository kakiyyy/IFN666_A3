import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Share,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { getTutorial, deleteTutorial } from '../services/tutorialService';
import DifficultyBadge from '../components/DifficultyBadge';
import { colors } from '../constants/colors';

export default function TutorialDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const { token, userId } = useAuth();
  const [tutorial, setTutorial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getTutorial(id);
      setTutorial(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [token, id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const isOwner = tutorial && String(tutorial.author) === String(userId);

  const handleDelete = () => {
    Alert.alert('Delete Tutorial', 'Are you sure you want to delete this tutorial?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteTutorial(token, id);
            navigation.goBack();
          } catch (e) {
            Alert.alert('Error', e.message);
          }
        },
      },
    ]);
  };

  const handleShare = async () => {
    if (!tutorial) return;
    const cats = tutorial.categories?.map((c) => c.name).join(', ') || 'None';
    const message =
      `${tutorial.title}\n` +
      `Difficulty: ${tutorial.difficulty}\n` +
      `Time: ${tutorial.AverageTimeSpentMinutes} min\n` +
      `Categories: ${cats}\n\n` +
      `${tutorial.description}`;
    await Share.share({ title: tutorial.title, message });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!tutorial) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{tutorial.title}</Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
          <Ionicons name="share-outline" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.metaRow}>
        <DifficultyBadge difficulty={tutorial.difficulty} />
        <Text style={styles.metaText}>{tutorial.AverageTimeSpentMinutes} min</Text>
      </View>

      {tutorial.categories?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Categories</Text>
          <View style={styles.tagRow}>
            {tutorial.categories.map((c) => (
              <Text key={c._id} style={styles.tag}>
                {c.name}
              </Text>
            ))}
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Description</Text>
        <Text style={styles.body}>{tutorial.description}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Instructions</Text>
        <Text style={styles.body}>{tutorial.instructions}</Text>
      </View>

      {tutorial.material?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Materials</Text>
          {tutorial.material.map((m, i) => (
            <View key={i} style={styles.materialRow}>
              <Text style={styles.materialName}>{m.material?.name}</Text>
              <Text style={styles.materialDetail}>
                {m.quantity} {m.unit}
                {m.note ? ` — ${m.note}` : ''}
              </Text>
              {m.material?.purchaseSource ? (
                <Text style={styles.materialSource}>{m.material.purchaseSource}</Text>
              ) : null}
            </View>
          ))}
        </View>
      )}

      {isOwner && (
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.editBtn]}
            onPress={() => navigation.navigate('TutorialForm', { id: tutorial._id })}
          >
            <Text style={styles.actionBtnText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.deleteBtn]}
            onPress={handleDelete}
          >
            <Text style={styles.actionBtnText}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 },
  title: { flex: 1, fontSize: 22, fontWeight: '700', color: colors.text, marginRight: 8 },
  shareBtn: { padding: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  metaText: { color: colors.muted, fontSize: 14 },
  section: { marginBottom: 20 },
  sectionLabel: { color: colors.primary, fontWeight: '600', fontSize: 13, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  body: { color: colors.text, fontSize: 15, lineHeight: 22 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    backgroundColor: colors.surface,
    color: colors.text,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 13,
    borderWidth: 1,
    borderColor: colors.border,
  },
  materialRow: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  materialName: { color: colors.text, fontWeight: '600', fontSize: 14 },
  materialDetail: { color: colors.muted, fontSize: 13, marginTop: 2 },
  materialSource: { color: colors.primary, fontSize: 12, marginTop: 2 },
  actionsRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  actionBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  editBtn: { backgroundColor: colors.primary },
  deleteBtn: { backgroundColor: colors.danger },
  actionBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  errorText: { color: colors.danger },
});
