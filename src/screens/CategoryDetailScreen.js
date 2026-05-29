import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Share,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { getCategory, getCategoryTutorials } from '../services/categoryService';
import DifficultyBadge from '../components/DifficultyBadge';
import Pagination from '../components/Pagination';
import { colors } from '../constants/colors';
import { buildShareMessage } from '../utils/shareMessages';
import { displayValue } from '../utils/displayValue';

export default function CategoryDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const { token } = useAuth();
  const [category, setCategory] = useState(null);
  const [tutorials, setTutorials] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [cat, tutsResult] = await Promise.all([
        getCategory(id),
        getCategoryTutorials(id, { page }),
      ]);
      setCategory(cat);
      setTutorials(tutsResult.tutorials);
      setTotalPages(tutsResult.totalPages);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [token, id, page]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onShare = async () => {
    if (!category) return;
    await Share.share({
      title: category.name,
      message: buildShareMessage('category', { ...category, tutorials }),
    });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('Tutorials', {
        screen: 'TutorialDetail',
        params: { id: item._id },
      })}
    >
      <Text style={styles.cardTitle}>{displayValue(item.title)}</Text>
      <View style={styles.cardRow}>
        <DifficultyBadge difficulty={item.difficulty} />
        <Text style={styles.cardMeta}>{displayValue(item.AverageTimeSpentMinutes)} min</Text>
      </View>
    </TouchableOpacity>
  );

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

  return (
    <View style={styles.container}>
      {category && (
        <View style={styles.header}>
          <Text style={styles.title}>{displayValue(category.name)}</Text>
          <Text style={styles.desc}>{displayValue(category.description)}</Text>
          <TouchableOpacity style={styles.shareBtn} onPress={onShare}>
            <Text style={styles.shareBtnText}>Share</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.sectionLabel}>Tutorials in this category</Text>

      <FlatList
        data={tutorials}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.emptyText}>No tutorials in this category.</Text>}
        ListFooterComponent={
          <Pagination
            page={page}
            totalPages={totalPages}
            onPrev={() => setPage((p) => p - 1)}
            onNext={() => setPage((p) => p + 1)}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: { fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: 4 },
  desc: { color: colors.muted, fontSize: 14, marginBottom: 10 },
  shareBtn: { backgroundColor: colors.primary, borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  shareBtnText: { color: '#fff', fontWeight: '700' },
  sectionLabel: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 12,
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    letterSpacing: 0.5,
  },
  list: { padding: 12, paddingBottom: 40 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: { color: colors.text, fontSize: 16, fontWeight: '600', marginBottom: 6 },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardMeta: { color: colors.muted, fontSize: 12 },
  emptyText: { color: colors.muted, textAlign: 'center', marginTop: 40 },
  errorText: { color: colors.danger },
});
