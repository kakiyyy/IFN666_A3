import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Pressable,
  Alert,
  Share,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import {
  getMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial,
} from '../services/materialService';
import Pagination from '../components/Pagination';
import ErrorMessage from '../components/ErrorMessage';
import { colors } from '../constants/colors';
import { buildShareMessage } from '../utils/shareMessages';
import { displayValue } from '../utils/displayValue';

const getText = (value) => String(value || '').trim().toLowerCase();

const sortMaterials = (items, sortOption) => {
  const sorted = [...items];

  if (sortOption === 'name_asc') {
    return sorted.sort((a, b) => getText(a?.name).localeCompare(getText(b?.name)));
  }

  if (sortOption === 'name_desc') {
    return sorted.sort((a, b) => getText(b?.name).localeCompare(getText(a?.name)));
  }

  return sorted;
};

export default function MaterialsScreen({ route, navigation }) {
  const { token, userId } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('name_asc');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [modalVisible, setModalVisible] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [formName, setFormName] = useState('');
  const [formSource, setFormSource] = useState('');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const stateRef = useRef({ page, search, sort });
  stateRef.current = { page, search, sort };

  const load = useCallback(async (requestedPage) => {
    const { page: currentPage, search: s, sort: so } = stateRef.current;
    const p = requestedPage ?? currentPage;
    setLoading(true);
    setError('');
    try {
      const firstPage = await getMaterials({ page: 1, search: s, sort: so });
      const remainingPages = await Promise.all(
        Array.from({ length: firstPage.totalPages - 1 }, (_, index) =>
          getMaterials({ page: index + 2, search: s, sort: so })
        )
      );
      const pageSize = Math.max((firstPage.materials || []).length, 1);
      const allMaterials = [firstPage, ...remainingPages].flatMap((result) => result.materials || []);
      const sortedMaterials = sortMaterials(allMaterials, so);
      const nextTotalPages = Math.max(Math.ceil(sortedMaterials.length / pageSize), 1);
      const nextPage = Math.min(p, nextTotalPages);
      const start = (nextPage - 1) * pageSize;

      setMaterials(sortedMaterials.slice(start, start + pageSize));
      setTotalPages(nextTotalPages);
      if (nextPage !== currentPage) setPage(nextPage);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      const editMaterial = route.params?.editMaterial;
      if (editMaterial) {
        const canEdit = Boolean(userId) && String(editMaterial.owner) === String(userId);
        if (canEdit) openEdit(editMaterial);
        navigation.setParams({ editMaterial: undefined });
      }
      load();
    }, [load, page, search, sort, route.params?.editMaterial])
  );

  const openCreate = () => {
    setEditTarget(null);
    setFormName('');
    setFormSource('');
    setFormError('');
    setModalVisible(true);
  };

  const openEdit = (mat) => {
    setEditTarget(mat);
    setFormName(mat.name);
    setFormSource(mat.purchaseSource ?? '');
    setFormError('');
    setModalVisible(true);
  };

  const handleSave = async () => {
    setFormError('');
    if (!formName.trim()) { setFormError('Name is required.'); return; }
    setSaving(true);
    try {
      if (editTarget) {
        await updateMaterial(token, editTarget._id, { name: formName.trim(), purchaseSource: formSource.trim() });
      } else {
        await createMaterial(token, { name: formName.trim(), purchaseSource: formSource.trim() });
      }
      setModalVisible(false);
      setPage(1);
      load(1);
    } catch (e) {
      setFormError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (mat) => {
    Alert.alert('Delete Material', `Delete "${mat.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteMaterial(token, mat._id);
            load();
          } catch (e) {
            Alert.alert('Error', e.message);
          }
        },
      },
    ]);
  };

  const handleShare = async (mat) => {
    await Share.share({
      title: mat.name,
      message: buildShareMessage('material', mat),
    });
  };

  const openQuickActions = (mat, isOwner) => {
    const options = [{ text: 'View details', onPress: () => navigation.navigate('MaterialDetail', { id: mat._id }) }];
    if (isOwner) {
      options.push({ text: 'Edit material', onPress: () => openEdit(mat) });
      options.push({ text: 'Delete material', style: 'destructive', onPress: () => handleDelete(mat) });
    }
    options.push({ text: 'Share material', onPress: () => handleShare(mat) });
    options.push({ text: 'Cancel', style: 'cancel' });
    Alert.alert(mat.name, 'Quick actions', options);
  };

  const renderItem = ({ item }) => {
    const isOwner = Boolean(userId) && String(item.owner) === String(userId);
    return (
      <Pressable
        style={styles.card}
        onPress={() => navigation.navigate('MaterialDetail', { id: item._id })}
        onLongPress={() => openQuickActions(item, isOwner)}
        delayLongPress={500}
      >
        <Text style={styles.cardLine}><Text style={styles.cardLabel}>Title:</Text> {displayValue(item.name)}</Text>
        <Text style={styles.cardLine} numberOfLines={1}><Text style={styles.cardLabel}>Purchase source:</Text> {displayValue(item.purchaseSource)}</Text>
        {isOwner && (
          <View style={styles.cardActions}>
            <TouchableOpacity onPress={() => openEdit(item)} style={styles.actionBtn}>
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
        <View style={styles.sortRow}>
          <Text style={styles.sortLabel}>Sort:</Text>
          <TouchableOpacity
            style={[styles.sortBtn, sort === 'name_asc' && styles.sortBtnActive]}
            onPress={() => { setSort('name_asc'); setPage(1); }}
          >
            <Text style={[styles.sortBtnText, sort === 'name_asc' && styles.sortBtnTextActive]}>Name A-Z</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortBtn, sort === 'name_desc' && styles.sortBtnActive]}
            onPress={() => { setSort('name_desc'); setPage(1); }}
          >
            <Text style={[styles.sortBtnText, sort === 'name_desc' && styles.sortBtnTextActive]}>Name Z-A</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.searchInput}
          placeholder="Search materials…"
          placeholderTextColor={colors.muted}
          value={search}
          onChangeText={(t) => { setSearch(t); setPage(1); }}
        />
      </View>

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
          data={materials}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.emptyText}>No materials found.</Text>}
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

      {token ? <TouchableOpacity style={styles.fab} onPress={openCreate}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity> : null}

      <Modal visible={modalVisible} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <Pressable style={styles.modalBox} onPress={() => {}}>
            <Text style={styles.modalTitle}>{editTarget ? 'Edit Material' : 'New Material'}</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Name *"
              placeholderTextColor={colors.muted}
              value={formName}
              onChangeText={setFormName}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Purchase Source"
              placeholderTextColor={colors.muted}
              value={formSource}
              onChangeText={setFormSource}
            />
            <ErrorMessage message={formError} />
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
              <Text style={styles.saveBtnText}>{saving ? 'Saving…' : 'Save'}</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  toolbar: { padding: 12, gap: 10 },
  sortRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sortLabel: { color: colors.muted, fontSize: 14 },
  sortBtn: { borderWidth: 1, borderColor: colors.border, borderRadius: 16, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: colors.surface },
  sortBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  sortBtnText: { color: colors.text, fontSize: 13 },
  sortBtnTextActive: { color: '#fff' },
  searchInput: {
    backgroundColor: colors.surface,
    color: colors.text,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 24,
  },
  modalBox: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
  },
  modalTitle: { color: colors.text, fontWeight: '700', fontSize: 16, marginBottom: 12 },
  modalInput: {
    backgroundColor: colors.background,
    color: colors.text,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
