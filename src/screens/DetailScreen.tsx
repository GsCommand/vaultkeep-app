import React, { useCallback, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Alert, Linking, SafeAreaView,
} from 'react-native';
import { useFocusEffect, useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { getItem, deleteItem } from '../store/db';
import { cancelItemNotifications } from '../store/notifications';
import { expirationLabel, statusColor, formatDate, formatCurrency } from '../utils/itemUtils';
import { colors, spacing, radius, typography } from '../utils/theme';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Detail'>;
type Route = RouteProp<RootStackParamList, 'Detail'>;

function DetailRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, accent && { color: colors.teal }]} numberOfLines={2}>{value}</Text>
    </View>
  );
}

export default function DetailScreen() {
  const nav = useNavigation<Nav>();
  const route = useRoute<Route>();
  const [item, setItem] = useState(() => getItem(route.params.itemId));

  useFocusEffect(useCallback(() => {
    const fresh = getItem(route.params.itemId);
    if (!fresh) { nav.goBack(); return; }
    setItem(fresh);
  }, [route.params.itemId]));

  if (!item) return null;

  const sc = statusColor(item);

  function handleDelete() {
    Alert.alert(`Delete ${item!.name}?`, 'This will permanently remove the item and all attachments.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          await cancelItemNotifications(item!);
          deleteItem(item!.id);
          nav.goBack();
        }
      }
    ]);
  }

  function callContractor() {
    if (!item?.contractorPhone) return;
    Linking.openURL(`tel:${item.contractorPhone.replace(/\D/g, '')}`);
  }

  function emailContractor() {
    if (!item?.contractorEmail) return;
    Linking.openURL(`mailto:${item.contractorEmail}`);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => nav.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => nav.navigate('AddEdit', { itemId: item.id })}>
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <Text style={styles.heroName}>{item.name}</Text>
          <Text style={styles.heroCategory}>{item.category}</Text>
          <View style={[styles.statusBadge, { backgroundColor: `${sc}22` }]}>
            <View style={[styles.statusDot, { backgroundColor: sc }]} />
            <Text style={[styles.statusText, { color: sc }]}>{expirationLabel(item)}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Purchase details</Text>
          {item.retailer ? <DetailRow label="Retailer" value={item.retailer} /> : null}
          {item.purchasePrice > 0 ? <DetailRow label="Price" value={formatCurrency(item.purchasePrice)} /> : null}
          <DetailRow label="Purchased" value={formatDate(item.purchaseDate)} />
          <DetailRow label="Warranty expires" value={formatDate(item.warrantyExpiration)} />
        </View>

        {(item.receiptUri || item.manualUri) && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Attachments</Text>
            {item.receiptUri && (
              <View style={styles.attachRow}>
                <View style={styles.attachIcon}><Text style={styles.attachIconText}>📄</Text></View>
                <Text style={styles.attachLabel}>Receipt attached</Text>
              </View>
            )}
            {item.manualUri && (
              <View style={styles.attachRow}>
                <View style={[styles.attachIcon, { backgroundColor: '#FCEBEB' }]}><Text style={styles.attachIconText}>📋</Text></View>
                <Text style={styles.attachLabel}>PDF manual attached</Text>
              </View>
            )}
          </View>
        )}

        {item.contractorName ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Contractor</Text>
            <DetailRow label="Name" value={item.contractorName} />
            {item.contractorPhone ? (
              <TouchableOpacity onPress={callContractor}>
                <DetailRow label="Phone" value={item.contractorPhone} accent />
              </TouchableOpacity>
            ) : null}
            {item.contractorEmail ? (
              <TouchableOpacity onPress={emailContractor}>
                <DetailRow label="Email" value={item.contractorEmail} accent />
              </TouchableOpacity>
            ) : null}
          </View>
        ) : null}

        {item.notes ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Notes</Text>
            <Text style={styles.notes}>{item.notes}</Text>
          </View>
        ) : null}

        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
          <Text style={styles.deleteBtnText}>Delete item</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  backBtn: { padding: spacing.sm },
  backText: { color: colors.teal, fontSize: 17 },
  editText: { color: colors.teal, fontSize: 17, fontWeight: '600' },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.md },
  heroCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.xl, gap: spacing.sm },
  heroName: { ...typography.title, color: colors.textPrimary },
  heroCategory: { ...typography.body, color: colors.textSecondary },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, alignSelf: 'flex-start', paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.xl, marginTop: spacing.sm },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { ...typography.subhead, fontWeight: '600' },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.sm },
  cardTitle: { ...typography.subhead, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: spacing.xs },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.xs, borderBottomWidth: 0.5, borderBottomColor: colors.border, gap: spacing.md },
  detailLabel: { ...typography.body, color: colors.textSecondary, flex: 1 },
  detailValue: { ...typography.body, color: colors.textPrimary, flex: 2, textAlign: 'right' },
  attachRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm },
  attachIcon: { width: 40, height: 40, borderRadius: radius.sm, backgroundColor: '#E1F5EE', alignItems: 'center', justifyContent: 'center' },
  attachIconText: { fontSize: 20 },
  attachLabel: { ...typography.body, color: colors.textPrimary },
  notes: { ...typography.body, color: colors.textSecondary, lineHeight: 22 },
  deleteBtn: { marginTop: spacing.lg, backgroundColor: `${colors.red}22`, borderRadius: radius.md, padding: spacing.lg, alignItems: 'center', borderWidth: 0.5, borderColor: `${colors.red}44` },
  deleteBtnText: { color: colors.red, ...typography.headline },
});
