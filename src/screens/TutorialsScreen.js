import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { getTutorials } from '../services/tutorialService';
import DifficultyBadge from '../components/DifficultyBadge';
import Pagination from '../components/Pagination';
import { colors } from '../constants/colors';

const SORT_OPTIONS = [
  { label: 'Name A-Z', value: 'name_asc' },
  { label: 'Name Z-A', value: 'name_desc' },
  { label: 'Difficulty ↑', value: 'difficulty_asc' },
  { label: 'Difficulty ↓', value: 'difficulty_desc' },
  { label: 'Time ↑', value: 'time_asc' },
  { label: 'Time ↓', value: 'time_desc' },
];

export default function TutorialsScreen({ navigation }) {
  const { token } = useAuth();
  const [tutorials, setTutorials] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('name_asc');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSort, setShowSort] = useState(false);

  const stateRef = useRef({ page, search, sort });
  stateRef.current = { page, search, sort };

  const load = useCallback(async () => {
    const { page: p, search: s, sort: so } = stateRef.current;
    setLoading(true);
    setError('');
    try {
      const result = await getTutorials({ page: p, search: s, sort: so });
      setTutorials(result.tutorials);
      setTotalPages(result.totalPages);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load, page, search, sort])
  );

  const handleSearch = (text) => {
    setSearch(text);
    setPage(1);
  };

  const handleSort = (value) => {
    setSort(value);
    setPage(1);
    setShowSort(false);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('TutorialDetail', { id: item._id })}
    >
      <Text style={styles.cardTitle}>{item.title}</Text>
      <View style={styles.cardRow}>
        <DifficultyBadge difficulty={item.difficulty} />
        <Text style={styles.cardMeta}>{item.AverageTimeSpentMinutes} min</Text>
      </View>
      {item.categories?.length > 0 && (
        <Text style={styles.cardCats} numberOfLines={1}>
          {item.categories.map((c) => c.name).join(', ')}
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search tutorials…"
          placeholderTextColor={colors.muted}
          value={search}
          onChangeText={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.sortBtn} onPress={() => setShowSort((v) => !v)}>
          <Text style={styles.sortBtnText}>Sort</Text>
        </TouchableOpacity> : null}
      </View>

      {showSort && (
        <View style={styles.sortMenu}>
          {SORT_OPTIONS.map((o) => (
            <TouchableOpacity
              key={o.value}
              style={[styles.sortOption, sort === o.value && styles.sortOptionActive]}
              onPress={() => handleSort(o.value)}
            >
              <Text style={[styles.sortOptionText, sort === o.value && styles.sortOptionTextActive]}>
                {o.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {loading ? (
        <ActivityIndicator style={styles.loader} color={colors.primary} size="large" />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <FlatList
          data={tutorials}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.emptyText}>No tutorials found.</Text>}
          ListFooterComponent={
            <Pagination
              page={page}
              totalPages={totalPages}
              onPrev={() => setPage((p) => p - 1)}
              onNext={() => setPage((p) => p + 1)}
            />
          }
        />
      )}

      {token ? <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('TutorialForm', {})}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  toolbar: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: colors.surface,
    color: colors.text,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sortBtn: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingHorizontal: 14,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  sortBtnText: { color: colors.text, fontWeight: '600' },
  sortMenu: {
    backgroundColor: colors.surface,
    marginHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 4,
  },
  sortOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sortOptionActive: { backgroundColor: colors.primary + '33' },
  sortOptionText: { color: colors.text, fontSize: 14 },
  sortOptionTextActive: { color: colors.primary, fontWeight: '600' },
  list: { padding: 12, paddingBottom: 80 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: { color: colors.text, fontSize: 16, fontWeight: '600', marginBottom: 6 },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  cardMeta: { color: colors.muted, fontSize: 12 },
  cardCats: { color: colors.muted, fontSize: 12, marginTop: 2 },
  loader: { flex: 1 },
  errorText: { color: colors.danger, textAlign: 'center', margin: 24 },
  emptyText: { color: colors.muted, textAlign: 'center', marginTop: 40 },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabText: { color: '#fff', fontSize: 28, lineHeight: 32 },
});
