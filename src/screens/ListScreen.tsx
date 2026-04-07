import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  TextInput, Alert, SafeAreaView, StatusBar,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, WarrantyItem } from '../types';
import { getAllItems, deleteItem } from '../store/db';
import { cancelItemNotifications } from '../store/notifications';
import { checkPurchase } from '../store/purchase';
import { expirationLabel, isExpiringSoon, isExpired, statusColor } from '../utils/itemUtils';
import { colors, spacing, radius, typography } from '../utils/theme';

type Nav = NativeStackNavigationProp<RootStackParamList, 'List'>;

export default function ListScreen() {
  const nav = useNavigation<Nav>();
  const [items, setItems] = useState<WarrantyItem[]>([]);
  const [search, setSearch] = useState('');
  const [unlocked, setUnlocked] = useState(false);

  useFocusEffect(useCallback(() => {
    setItems(getAllItems());
    checkPurchase().then(setUnlocked);
  }, []));

  const filtered = items.filter(i =>
    !search ||
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.category.toLowerCase().includes(search.toLowerCase()) ||
    i.retailer.toLowerCase().includes(search.toLowerCase())
  );

  const needsAttention = filtered.filter(i => isExpiringSoon(i) || isExpired(i));
  const active = filtered.filter(i => !isExpiringSoon(i) && !isExpired(i));

  function handleAdd() {
    if (unlocked || items.length < 1) {
      nav.navigate('AddEdit', {});
    } else {
      nav.navigate('Paywall');
    }
  }

  function handleDelete(item: WarrantyItem) {
    Alert.alert(`Delete ${item.name}?`, 'This will permanently remove the item.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          await cancelItemNotifications(item);
          deleteItem(item.id);
          setItems(getAllItems());
        }
      }
    ]);
  }

  const renderItem = ({ item }: { item: WarrantyItem }) => (
    <TouchableOpacity
      style={styles.itemCard}
      onPress={() => nav.navigate('Detail', { itemId: item.id })}
      onLongPress={() => handleDelete(item)}
      activeOpacity={0.7}
    >
      <View style={[styles.statusDot, { backgroundColor: statusColor(item) }]} />
      <View style={styles.itemBody}>
        <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.itemCategory}>{item.category}{item.retailer ? ` · ${item.retailer}` : ''}</Text>
      </View>
      <View style={styles.itemRight}>
        <Text style={[styles.itemExpiry, { color: statusColor(item) }]} numberOfLines={1}>
          {expirationLabel(item)}
        </Text>
        <Text style={styles.chevron}>›</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.title}>VaultKeep</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => nav.navigate('Settings')} style={styles.iconBtn}>
            <Text style={styles.iconBtnText}>⚙</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleAdd} style={styles.addBtn}>
            <Text style={styles.addBtnText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchWrap}>
        <TextInput
          style={styles.search}
          value={search}
          onChangeText={setSearch}
          placeholder="Search items..."
          placeholderTextColor={colors.textTertiary}
        />
      </View>

      <FlatList
        data={[]}
        renderItem={null}
        ListHeaderComponent={
          <>
            {needsAttention.length > 0 && (
              <View>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionHeaderWarning}>⚠ Needs attention</Text>
                </View>
                {needsAttention.map(item => renderItem({ item }))}
              </View>
            )}
            {active.length > 0 && (
              <View>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionHeaderText}>All items</Text>
                </View>
                {active.map(item => renderItem({ item }))}
              </View>
            )}
            {items.length === 0 && (
              <View style={styles.empty}>
                <Text style={styles.emptyIcon}>🗃</Text>
                <Text style={styles.emptyTitle}>No items yet</Text>
                <Text style={styles.emptyBody}>Tap + to add your first warranty, receipt, or manual.</Text>
                <TouchableOpacity style={styles.emptyBtn} onPress={handleAdd}>
                  <Text style={styles.emptyBtnText}>Add your first item</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        }
        keyExtractor={(_, i) => String(i)}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.md },
  title: { ...typography.largeTitle, color: colors.textPrimary },
  headerActions: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  iconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  iconBtnText: { fontSize: 16 },
  addBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.teal, alignItems: 'center', justifyContent: 'center' },
  addBtnText: { fontSize: 22, color: colors.white, lineHeight: 28 },
  searchWrap: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  search: { backgroundColor: colors.surface, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, color: colors.textPrimary, fontSize: 15 },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  sectionHeader: { paddingVertical: spacing.sm },
  sectionHeaderText: { ...typography.subhead, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8 },
  sectionHeaderWarning: { ...typography.subhead, color: colors.warning, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8 },
  itemCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, gap: spacing.md },
  statusDot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  itemBody: { flex: 1, gap: 2 },
  itemName: { ...typography.headline, color: colors.textPrimary },
  itemCategory: { ...typography.caption, color: colors.textSecondary },
  itemRight: { alignItems: 'flex-end', gap: 2 },
  itemExpiry: { ...typography.caption, fontWeight: '600' },
  chevron: { color: colors.textTertiary, fontSize: 18 },
  empty: { alignItems: 'center', paddingTop: 80, gap: spacing.md },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { ...typography.title, color: colors.textPrimary },
  emptyBody: { ...typography.body, color: colors.textSecondary, textAlign: 'center', paddingHorizontal: spacing.xxl },
  emptyBtn: { marginTop: spacing.lg, backgroundColor: colors.teal, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: radius.lg },
  emptyBtnText: { ...typography.headline, color: colors.white },
});
