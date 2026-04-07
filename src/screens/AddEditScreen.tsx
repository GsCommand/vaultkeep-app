import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, Alert, Platform, Modal,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { getItem, insertItem, updateItem } from '../store/db';
import { cancelItemNotifications, scheduleItemNotifications } from '../store/notifications';
import { CATEGORIES, defaultItem } from '../utils/itemUtils';
import { colors, spacing, radius, typography } from '../utils/theme';

type Nav = NativeStackNavigationProp<RootStackParamList, 'AddEdit'>;
type Route = RouteProp<RootStackParamList, 'AddEdit'>;

export default function AddEditScreen() {
  const nav = useNavigation<Nav>();
  const route = useRoute<Route>();
  const isEditing = !!route.params?.itemId;

  const def = defaultItem();
  const [name, setName] = useState('');
  const [category, setCategory] = useState(def.category);
  const [retailer, setRetailer] = useState('');
  const [price, setPrice] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date(def.purchaseDate));
  const [warrantyExpiration, setWarrantyExpiration] = useState(new Date(def.warrantyExpiration));
  const [notes, setNotes] = useState('');
  const [contractorName, setContractorName] = useState('');
  const [contractorPhone, setContractorPhone] = useState('');
  const [contractorEmail, setContractorEmail] = useState('');
  const [receiptUri, setReceiptUri] = useState<string | null>(null);
  const [manualUri, setManualUri] = useState<string | null>(null);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showPurchaseDatePicker, setShowPurchaseDatePicker] = useState(false);
  const [showExpiryPicker, setShowExpiryPicker] = useState(false);

  useEffect(() => {
    if (isEditing) {
      const item = getItem(route.params.itemId!);
      if (!item) return;
      setName(item.name);
      setCategory(item.category);
      setRetailer(item.retailer);
      setPrice(item.purchasePrice > 0 ? String(item.purchasePrice) : '');
      setPurchaseDate(new Date(item.purchaseDate));
      setWarrantyExpiration(new Date(item.warrantyExpiration));
      setNotes(item.notes);
      setContractorName(item.contractorName);
      setContractorPhone(item.contractorPhone);
      setContractorEmail(item.contractorEmail);
      setReceiptUri(item.receiptUri);
      setManualUri(item.manualUri);
    }
  }, []);

  async function pickReceipt() {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (!result.canceled) setReceiptUri(result.assets[0].uri);
  }

  async function pickManual() {
    const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
    if (!result.canceled) setManualUri(result.assets[0].uri);
  }

  async function handleSave() {
    if (!name.trim()) { Alert.alert('Name required', 'Please enter an item name.'); return; }
    const data = {
      name: name.trim(), category, retailer: retailer.trim(),
      purchasePrice: parseFloat(price) || 0,
      purchaseDate: purchaseDate.toISOString(),
      warrantyExpiration: warrantyExpiration.toISOString(),
      notes: notes.trim(), receiptUri, manualUri,
      contractorName: contractorName.trim(),
      contractorPhone: contractorPhone.trim(),
      contractorEmail: contractorEmail.trim(),
    };

    if (isEditing) {
      const existing = getItem(route.params.itemId!)!;
      await cancelItemNotifications(existing);
      const updated = { ...existing, ...data };
      updateItem(updated);
      await scheduleItemNotifications(updated);
    } else {
      const created = insertItem(data);
      await scheduleItemNotifications(created);
    }
    nav.goBack();
  }

  function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
      <View style={styles.field}>
        <Text style={styles.fieldLabel}>{label}</Text>
        {children}
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => nav.goBack()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditing ? 'Edit item' : 'Add item'}</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Item</Text>
          <Field label="Name">
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. Samsung Washer WF45" placeholderTextColor={colors.textTertiary} />
          </Field>
          <Field label="Category">
            <TouchableOpacity style={styles.input} onPress={() => setShowCategoryPicker(true)}>
              <Text style={styles.inputText}>{category} ›</Text>
            </TouchableOpacity>
          </Field>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Purchase</Text>
          <Field label="Retailer">
            <TextInput style={styles.input} value={retailer} onChangeText={setRetailer} placeholder="e.g. Home Depot" placeholderTextColor={colors.textTertiary} />
          </Field>
          <Field label="Price">
            <TextInput style={styles.input} value={price} onChangeText={setPrice} placeholder="0.00" placeholderTextColor={colors.textTertiary} keyboardType="decimal-pad" />
          </Field>
          <Field label="Purchase date">
            <TouchableOpacity style={styles.input} onPress={() => setShowPurchaseDatePicker(true)}>
              <Text style={styles.inputText}>{purchaseDate.toLocaleDateString()}</Text>
            </TouchableOpacity>
          </Field>
          <Field label="Warranty expires">
            <TouchableOpacity style={[styles.input, { borderColor: colors.teal }]} onPress={() => setShowExpiryPicker(true)}>
              <Text style={[styles.inputText, { color: colors.teal }]}>{warrantyExpiration.toLocaleDateString()}</Text>
            </TouchableOpacity>
          </Field>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Attachments</Text>
          <TouchableOpacity style={styles.attachBtn} onPress={pickReceipt}>
            <Text style={styles.attachBtnIcon}>{receiptUri ? '✓' : '📷'}</Text>
            <Text style={[styles.attachBtnText, receiptUri && { color: colors.good }]}>
              {receiptUri ? 'Receipt attached' : 'Add receipt photo'}
            </Text>
          </TouchableOpacity>
          {receiptUri && (
            <TouchableOpacity onPress={() => setReceiptUri(null)}>
              <Text style={styles.removeText}>Remove receipt</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.attachBtn} onPress={pickManual}>
            <Text style={styles.attachBtnIcon}>{manualUri ? '✓' : '📄'}</Text>
            <Text style={[styles.attachBtnText, manualUri && { color: colors.good }]}>
              {manualUri ? 'Manual attached' : 'Add PDF manual'}
            </Text>
          </TouchableOpacity>
          {manualUri && (
            <TouchableOpacity onPress={() => setManualUri(null)}>
              <Text style={styles.removeText}>Remove manual</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contractor (optional)</Text>
          <Field label="Name">
            <TextInput style={styles.input} value={contractorName} onChangeText={setContractorName} placeholder="Jake's Appliance Repair" placeholderTextColor={colors.textTertiary} />
          </Field>
          <Field label="Phone">
            <TextInput style={styles.input} value={contractorPhone} onChangeText={setContractorPhone} placeholder="(904) 555-0183" placeholderTextColor={colors.textTertiary} keyboardType="phone-pad" />
          </Field>
          <Field label="Email">
            <TextInput style={styles.input} value={contractorEmail} onChangeText={setContractorEmail} placeholder="contractor@email.com" placeholderTextColor={colors.textTertiary} keyboardType="email-address" autoCapitalize="none" />
          </Field>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <TextInput style={[styles.input, styles.textarea]} value={notes} onChangeText={setNotes} placeholder="Any additional notes..." placeholderTextColor={colors.textTertiary} multiline numberOfLines={4} textAlignVertical="top" />
        </View>
      </ScrollView>

      <Modal visible={showCategoryPicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Category</Text>
            {CATEGORIES.map(cat => (
              <TouchableOpacity key={cat} style={styles.modalOption} onPress={() => { setCategory(cat); setShowCategoryPicker(false); }}>
                <Text style={[styles.modalOptionText, cat === category && { color: colors.teal }]}>{cat}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.modalCancel} onPress={() => setShowCategoryPicker(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {showPurchaseDatePicker && (
        <DateTimePicker value={purchaseDate} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={(_, d) => { setShowPurchaseDatePicker(false); if (d) setPurchaseDate(d); }} maximumDate={new Date()} />
      )}
      {showExpiryPicker && (
        <DateTimePicker value={warrantyExpiration} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={(_, d) => { setShowExpiryPicker(false); if (d) setWarrantyExpiration(d); }} minimumDate={new Date()} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: 0.5, borderBottomColor: colors.border },
  headerTitle: { ...typography.headline, color: colors.textPrimary },
  cancelText: { color: colors.textSecondary, fontSize: 17 },
  saveText: { color: colors.teal, fontSize: 17, fontWeight: '600' },
  scroll: { padding: spacing.lg, gap: spacing.lg, paddingBottom: 60 },
  section: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.md },
  sectionTitle: { ...typography.subhead, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8 },
  field: { gap: spacing.xs },
  fieldLabel: { ...typography.caption, color: colors.textSecondary },
  input: { backgroundColor: colors.surfaceSecondary, borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2, borderWidth: 0.5, borderColor: colors.border },
  inputText: { color: colors.textPrimary, fontSize: 15 },
  textarea: { minHeight: 88, paddingTop: spacing.sm },
  attachBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.surfaceSecondary, borderRadius: radius.sm, padding: spacing.md, borderWidth: 0.5, borderColor: colors.border },
  attachBtnIcon: { fontSize: 20 },
  attachBtnText: { ...typography.body, color: colors.teal },
  removeText: { color: colors.red, fontSize: 13, paddingLeft: spacing.sm },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.surface, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing.xl, gap: spacing.xs },
  modalTitle: { ...typography.headline, color: colors.textPrimary, marginBottom: spacing.md },
  modalOption: { paddingVertical: spacing.md, borderBottomWidth: 0.5, borderBottomColor: colors.border },
  modalOptionText: { ...typography.body, color: colors.textPrimary },
  modalCancel: { marginTop: spacing.md, alignItems: 'center', paddingVertical: spacing.md },
  modalCancelText: { color: colors.red, ...typography.headline },
});
