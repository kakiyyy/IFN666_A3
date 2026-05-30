import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  Alert,
  Share,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { getTutorials, deleteTutorial } from '../services/tutorialService';
import Pagination from '../components/Pagination';
import { colors } from '../constants/colors';
import { buildShareMessage } from '../utils/shareMessages';
import { displayList, displayValue } from '../utils/displayValue';

const SORT_OPTIONS = [
  { label: 'Name A-Z', value: 'title_asc' },
  { label: 'Name Z-A', value: 'title_desc' },
  { label: 'Difficulty: Easy to Hard', value: 'difficulty_asc' },
  { label: 'Difficulty: Hard to Easy', value: 'difficulty_desc' },
  { label: 'Least time spent', value: 'time_asc' },
  { label: 'Most time spent', value: 'time_desc' },
];

const DIFFICULTY_ORDER = { easy: 1, medium: 2, hard: 3 };

function getDifficultyRank(value) {
  if (!value) return Number.MAX_SAFE_INTEGER;
  return DIFFICULTY_ORDER[String(value).toLowerCase()] ?? Number.MAX_SAFE_INTEGER;
}

function getTimeValue(item) {
  const time = Number(item?.AverageTimeSpentMinutes);
  return Number.isFinite(time) ? time : 0;
}

function sortTutorials(items, sortValue) {
  const sorted = [...items];
  switch (sortValue) {
    case 'title_asc':
      return sorted.sort((a, b) => String(a?.title || '').localeCompare(String(b?.title || '')));
    case 'title_desc':
      return sorted.sort((a, b) => String(b?.title || '').localeCompare(String(a?.title || '')));
    case 'difficulty_asc':
      return sorted.sort((a, b) => getDifficultyRank(a?.difficulty) - getDifficultyRank(b?.difficulty));
    case 'difficulty_desc':
      return sorted.sort((a, b) => getDifficultyRank(b?.difficulty) - getDifficultyRank(a?.difficulty));
    case 'time_asc':
      return sorted.sort((a, b) => getTimeValue(a) - getTimeValue(b));
    case 'time_desc':
      return sorted.sort((a, b) => getTimeValue(b) - getTimeValue(a));
    default:
      return sorted;
  }
}

export default function TutorialsScreen({ navigation }) {
  const { token, userId } = useAuth();
  const [tutorials, setTutorials] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('title_asc');
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
      setTutorials(sortTutorials(result.tutorials || [], so));
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

  const handleDelete = (item) => {
    Alert.alert('Delete Tutorial', `Delete "${item.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteTutorial(token, item._id);
            load();
          } catch (e) {
            Alert.alert('Error', e.message);
          }
        },
      },
    ]);
  };

  const handleShare = async (item) => {
    await Share.share({
      title: item.title,
      message: buildShareMessage('tutorial', item),
    });
  };

  const openQuickActions = (item, isOwner) => {
    const options = [{ text: 'View details', onPress: () => navigation.navigate('TutorialDetail', { id: item._id }) }];
    if (isOwner) {
      options.push({ text: 'Edit tutorial', onPress: () => navigation.navigate('TutorialForm', { id: item._id }) });
      options.push({ text: 'Delete tutorial', style: 'destructive', onPress: () => handleDelete(item) });
    }
    options.push({ text: 'Share tutorial', onPress: () => handleShare(item) });
    options.push({ text: 'Cancel', style: 'cancel' });
    Alert.alert(item.title, 'Quick actions', options);
  };

  const renderItem = ({ item }) => {
    const isOwner = Boolean(userId) && String(item.author) === String(userId);
    return (
      <Pressable
        style={styles.card}
        onPress={() => navigation.navigate('TutorialDetail', { id: item._id })}
        onLongPress={() => openQuickActions(item, isOwner)}
        delayLongPress={500}
      >
        <Text style={styles.cardLine}><Text style={styles.cardLabel}>Title:</Text> {displayValue(item.title)}</Text>
        <Text style={styles.cardLine}><Text style={styles.cardLabel}>Difficulty:</Text> {displayValue(item.difficulty)}</Text>
        <Text style={styles.cardLine}><Text style={styles.cardLabel}>Time:</Text> {displayValue(item.AverageTimeSpentMinutes)} minutes</Text>
        <Text style={styles.cardLine} numberOfLines={2}><Text style={styles.cardLabel}>Category:</Text> {displayList(item.categories, (c) => c.name)}</Text>
        {isOwner && (
          <View style={styles.cardActions}>
            <TouchableOpacity onPress={() => navigation.navigate('TutorialForm', { id: item._id })} style={styles.actionBtn}>
              <Text style={styles.editActionText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(item)} style={styles.actionBtn}>
              <Text style={styles.deleteActionText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      </Pressable>
    );
  };

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
        <TouchableOpacity style={styles.sortBtn} onPress={() => setShowSort((v) => !v)}><Text style={styles.sortBtnText}>Sort</Text></TouchableOpacity>
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
        <View style={styles.serverErrorState}>
          <Text style={styles.serverErrorTitle}>Server unavailable</Text>
          <Text style={styles.serverErrorMessage}>
            We could not connect to the server. Please check your internet connection or try again later.
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={load}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
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

      {token ? (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('TutorialForm', {})}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      ) : null}
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
  cardLine: { color: colors.text, fontSize: 14, marginBottom: 4 },
  cardLabel: { fontWeight: '700', color: colors.primary },
  cardActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 8 },
  actionBtn: { paddingHorizontal: 6, paddingVertical: 4 },
  editActionText: { color: colors.primary, fontWeight: '700' },
  deleteActionText: { color: colors.danger, fontWeight: '700' },
  loader: { flex: 1 },
  serverErrorState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  serverErrorTitle: { color: colors.text, fontSize: 20, fontWeight: '700', marginBottom: 8 },
  serverErrorMessage: { color: colors.muted, textAlign: 'center', lineHeight: 20, marginBottom: 16 },
  retryButton: { backgroundColor: colors.primary, borderRadius: 8, paddingHorizontal: 20, paddingVertical: 12 },
  retryButtonText: { color: '#fff', fontWeight: '700' },
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
