import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Pressable,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getTutorial, createTutorial, updateTutorial } from '../services/tutorialService';
import { getCategories } from '../services/categoryService';
import { getMaterials } from '../services/materialService';
import ErrorMessage from '../components/ErrorMessage';
import { colors } from '../constants/colors';

const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'];

export default function TutorialFormScreen({ route, navigation }) {
  const { id } = route.params ?? {};
  const isEdit = Boolean(id);
  const { token } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [time, setTime] = useState('');
  const [difficulty, setDifficulty] = useState('Beginner');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [materialEntries, setMaterialEntries] = useState([]);

  const [allCategories, setAllCategories] = useState([]);
  const [allMaterials, setAllMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [showDifficulty, setShowDifficulty] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showMaterialPicker, setShowMaterialPicker] = useState(false);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const [catsResult, matsResult] = await Promise.all([
          getCategories(token, { page: 1, sort: 'name_asc' }),
          getMaterials(token, { page: 1, sort: 'name_asc' }),
        ]);
        setAllCategories(catsResult.categories);
        setAllMaterials(matsResult.materials);

        if (isEdit) {
          const t = await getTutorial(token, id);
          setTitle(t.title ?? '');
          setDescription(t.description ?? '');
          setInstructions(t.instructions ?? '');
          setTime(String(t.AverageTimeSpentMinutes ?? ''));
          setDifficulty(t.difficulty ?? 'Beginner');
          setSelectedCategories(t.categories?.map((c) => c._id) ?? []);
          setMaterialEntries(
            t.material?.map((m) => ({
              materialId: m.material?._id,
              quantity: String(m.quantity ?? ''),
              unit: m.unit ?? '',
              note: m.note ?? '',
            })) ?? []
          );
        }
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [token, id, isEdit]);

  const toggleCategory = (catId) => {
    setSelectedCategories((prev) =>
      prev.includes(catId) ? prev.filter((c) => c !== catId) : [...prev, catId]
    );
  };

  const addMaterial = (mat) => {
    if (materialEntries.find((e) => e.materialId === mat._id)) return;
    setMaterialEntries((prev) => [...prev, { materialId: mat._id, quantity: '', unit: '', note: '' }]);
    setShowMaterialPicker(false);
  };

  const updateEntry = (idx, field, value) => {
    setMaterialEntries((prev) =>
      prev.map((e, i) => (i === idx ? { ...e, [field]: value } : e))
    );
  };

  const removeEntry = (idx) => {
    setMaterialEntries((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    setError('');
    if (!title.trim()) { setError('Title is required.'); return; }
    if (!description.trim()) { setError('Description is required.'); return; }
    if (!instructions.trim()) { setError('Instructions are required.'); return; }
    if (!time.trim() || isNaN(Number(time))) { setError('Valid time (minutes) is required.'); return; }
    if (selectedCategories.length === 0) { setError('At least one category is required.'); return; }
    if (materialEntries.length === 0) { setError('At least one material is required.'); return; }

    setSaving(true);
    try {
      const body = {
        title: title.trim(),
        description: description.trim(),
        instructions: instructions.trim(),
        AverageTimeSpentMinutes: Number(time),
        difficulty,
        categories: selectedCategories,
        material: materialEntries
          .filter((e) => e.materialId)
          .map((e) => ({
            material: e.materialId,
            quantity: Number(e.quantity) || 0,
            unit: e.unit,
            note: e.note,
          })),
      };
      if (isEdit) {
        await updateTutorial(token, id, body);
      } else {
        await createTutorial(token, body);
      }
      navigation.goBack();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.label}>Title *</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Tutorial title" placeholderTextColor={colors.muted} />

      <Text style={styles.label}>Description *</Text>
      <TextInput style={[styles.input, styles.multiline]} value={description} onChangeText={setDescription} placeholder="Brief description" placeholderTextColor={colors.muted} multiline numberOfLines={3} />

      <Text style={styles.label}>Instructions *</Text>
      <TextInput style={[styles.input, styles.multiline]} value={instructions} onChangeText={setInstructions} placeholder="Step-by-step instructions" placeholderTextColor={colors.muted} multiline numberOfLines={5} />

      <Text style={styles.label}>Time (minutes) *</Text>
      <TextInput style={styles.input} value={time} onChangeText={setTime} placeholder="e.g. 60" placeholderTextColor={colors.muted} keyboardType="numeric" />

      <Text style={styles.label}>Difficulty</Text>
      <TouchableOpacity style={styles.picker} onPress={() => setShowDifficulty(true)}>
        <Text style={styles.pickerText}>{difficulty}</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Categories</Text>
      <TouchableOpacity style={styles.picker} onPress={() => setShowCategoryPicker(true)}>
        <Text style={styles.pickerText}>
          {selectedCategories.length === 0
            ? 'Select categories…'
            : allCategories
                .filter((c) => selectedCategories.includes(c._id))
                .map((c) => c.name)
                .join(', ')}
        </Text>
      </TouchableOpacity>

      <Text style={styles.label}>Materials</Text>
      {materialEntries.map((entry, idx) => {
        const mat = allMaterials.find((m) => m._id === entry.materialId);
        return (
          <View key={idx} style={styles.matEntry}>
            <View style={styles.matHeader}>
              <Text style={styles.matName}>{mat?.name ?? 'Unknown'}</Text>
              <TouchableOpacity onPress={() => removeEntry(idx)}>
                <Text style={styles.removeBtn}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.matFields}>
              <TextInput
                style={[styles.input, styles.matInput]}
                value={entry.quantity}
                onChangeText={(v) => updateEntry(idx, 'quantity', v)}
                placeholder="Qty"
                placeholderTextColor={colors.muted}
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.input, styles.matInput]}
                value={entry.unit}
                onChangeText={(v) => updateEntry(idx, 'unit', v)}
                placeholder="Unit"
                placeholderTextColor={colors.muted}
              />
              <TextInput
                style={[styles.input, styles.matInput]}
                value={entry.note}
                onChangeText={(v) => updateEntry(idx, 'note', v)}
                placeholder="Note"
                placeholderTextColor={colors.muted}
              />
            </View>
          </View>
        );
      })}
      <TouchableOpacity style={styles.addMatBtn} onPress={() => setShowMaterialPicker(true)}>
        <Text style={styles.addMatBtnText}>+ Add Material</Text>
      </TouchableOpacity>

      <ErrorMessage message={error} />

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
        <Text style={styles.saveBtnText}>{saving ? 'Saving…' : isEdit ? 'Update Tutorial' : 'Create Tutorial'}</Text>
      </TouchableOpacity>

      {/* Difficulty Modal */}
      <Modal visible={showDifficulty} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowDifficulty(false)}>
          <Pressable style={styles.modalBox} onPress={() => {}}>
            <Text style={styles.modalTitle}>Select Difficulty</Text>
            {DIFFICULTIES.map((d) => (
              <TouchableOpacity
                key={d}
                style={[styles.modalOption, difficulty === d && styles.modalOptionActive]}
                onPress={() => { setDifficulty(d); setShowDifficulty(false); }}
              >
                <Text style={[styles.modalOptionText, difficulty === d && styles.modalOptionTextActive]}>{d}</Text>
              </TouchableOpacity>
            ))}
          </Pressable>
        </Pressable>
      </Modal>

      {/* Category Modal */}
      <Modal visible={showCategoryPicker} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowCategoryPicker(false)}>
          <Pressable style={styles.modalBox} onPress={() => {}}>
            <Text style={styles.modalTitle}>Select Categories</Text>
            <ScrollView style={{ maxHeight: 300 }}>
              {allCategories.map((c) => (
                <TouchableOpacity
                  key={c._id}
                  style={[styles.modalOption, selectedCategories.includes(c._id) && styles.modalOptionActive]}
                  onPress={() => toggleCategory(c._id)}
                >
                  <Text style={[styles.modalOptionText, selectedCategories.includes(c._id) && styles.modalOptionTextActive]}>
                    {selectedCategories.includes(c._id) ? '✓ ' : ''}{c.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.modalDone} onPress={() => setShowCategoryPicker(false)}>
              <Text style={styles.modalDoneText}>Done</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Material Picker Modal */}
      <Modal visible={showMaterialPicker} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowMaterialPicker(false)}>
          <Pressable style={styles.modalBox} onPress={() => {}}>
            <Text style={styles.modalTitle}>Add Material</Text>
            <ScrollView style={{ maxHeight: 300 }}>
              {allMaterials.map((m) => (
                <TouchableOpacity
                  key={m._id}
                  style={styles.modalOption}
                  onPress={() => addMaterial(m)}
                >
                  <Text style={styles.modalOptionText}>{m.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.modalDone} onPress={() => setShowMaterialPicker(false)}>
              <Text style={styles.modalDoneText}>Cancel</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' },
  label: { color: colors.muted, fontSize: 12, fontWeight: '600', textTransform: 'uppercase', marginBottom: 4, marginTop: 12 },
  input: {
    backgroundColor: colors.surface,
    color: colors.text,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  picker: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pickerText: { color: colors.text, fontSize: 15 },
  matEntry: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  matHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  matName: { color: colors.text, fontWeight: '600', fontSize: 14 },
  removeBtn: { color: colors.danger, fontSize: 16, paddingHorizontal: 4 },
  matFields: { flexDirection: 'row', gap: 8 },
  matInput: { flex: 1, paddingVertical: 8 },
  addMatBtn: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 4,
  },
  addMatBtnText: { color: colors.primary, fontWeight: '600' },
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
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
  modalOption: { paddingVertical: 12, paddingHorizontal: 8, borderRadius: 8 },
  modalOptionActive: { backgroundColor: colors.primary + '33' },
  modalOptionText: { color: colors.text, fontSize: 15 },
  modalOptionTextActive: { color: colors.primary, fontWeight: '600' },
  modalDone: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  modalDoneText: { color: '#fff', fontWeight: '600' },
});
