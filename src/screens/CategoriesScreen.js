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
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../services/categoryService';
import Pagination from '../components/Pagination';
import ErrorMessage from '../components/ErrorMessage';
import { colors } from '../constants/colors';

export default function CategoriesScreen({ navigation }) {
  const { token, userId } = useAuth();
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('name_asc');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [modalVisible, setModalVisible] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const stateRef = useRef({ page, search, sort });
  stateRef.current = { page, search, sort };

  const load = useCallback(async () => {
    const { page: p, search: s, sort: so } = stateRef.current;
    setLoading(true);
    setError('');
    try {
      const result = await getCategories({ page: p, search: s, sort: so });
      setCategories(result.categories);
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

  const openCreate = () => {
    setEditTarget(null);
    setFormName('');
    setFormDesc('');
    setFormError('');
    setModalVisible(true);
  };

  const openEdit = (cat) => {
    setEditTarget(cat);
    setFormName(cat.name);
    setFormDesc(cat.description ?? '');
    setFormError('');
    setModalVisible(true);
  };

  const handleSave = async () => {
    setFormError('');
    if (!formName.trim()) { setFormError('Name is required.'); return; }
    setSaving(true);
    try {
      if (editTarget) {
        await updateCategory(token, editTarget._id, { name: formName.trim(), description: formDesc.trim() });
      } else {
        await createCategory(token, { name: formName.trim(), description: formDesc.trim() });
      }
      setModalVisible(false);
      setPage(1);
      load();
    } catch (e) {
      setFormError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (cat) => {
    Alert.alert('Delete Category', `Delete "${cat.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteCategory(token, cat._id);
            load();
          } catch (e) {
            Alert.alert('Error', e.message);
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }) => {
    const isOwner = String(item.owner) === String(userId);
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('CategoryDetail', { id: item._id, name: item.name })}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          {isOwner && (
            <View style={styles.cardActions}>
              <TouchableOpacity onPress={() => openEdit(item)} style={styles.iconBtn}>
                <Text style={styles.editIcon}>✎</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item)} style={styles.iconBtn}>
                <Text style={styles.deleteIcon}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        {item.description ? (
          <Text style={styles.cardDesc} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}
      </TouchableOpacity>
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
          placeholder="Search categories…"
          placeholderTextColor={colors.muted}
          value={search}
          onChangeText={(t) => { setSearch(t); setPage(1); }}
        />
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loader} color={colors.primary} size="large" />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.emptyText}>No categories found.</Text>}
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
            <Text style={styles.modalTitle}>{editTarget ? 'Edit Category' : 'New Category'}</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Name *"
              placeholderTextColor={colors.muted}
              value={formName}
              onChangeText={setFormName}
            />
            <TextInput
              style={[styles.modalInput, styles.modalTextarea]}
              placeholder="Description"
              placeholderTextColor={colors.muted}
              value={formDesc}
              onChangeText={setFormDesc}
              multiline
              numberOfLines={3}
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
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle: { color: colors.text, fontSize: 16, fontWeight: '600', flex: 1 },
  cardActions: { flexDirection: 'row', gap: 8 },
  iconBtn: { padding: 4 },
  editIcon: { color: colors.primary, fontSize: 16 },
  deleteIcon: { color: colors.danger, fontSize: 16 },
  cardDesc: { color: colors.muted, fontSize: 13, marginTop: 4 },
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
  modalTextarea: { minHeight: 70, textAlignVertical: 'top' },
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
