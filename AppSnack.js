import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, SafeAreaView, StatusBar, Modal, Alert,
} from 'react-native';

const C = {
  bg: '#0F2140', surface: '#1B3A6B', deep: '#0C2E58',
  teal: '#0DBFB0', gold: '#F5C842', white: '#FFFFFF',
  text: '#FFFFFF', textSub: 'rgba(255,255,255,0.6)',
  textFaint: 'rgba(255,255,255,0.3)', border: 'rgba(255,255,255,0.1)',
  red: '#E24B4A', orange: '#EF9F27', green: '#1D9E75',
};

const CATEGORIES = ['Appliance','Electronics','HVAC','Plumbing','Roofing','Flooring','Furniture','Vehicle','Tools','Other'];

function daysUntil(iso) {
  return Math.ceil((new Date(iso) - new Date()) / 86400000);
}

function statusColor(days) {
  if (days < 0) return C.red;
  if (days <= 7) return C.red;
  if (days <= 14) return C.orange;
  if (days <= 30) return C.gold;
  return C.green;
}

function expiryLabel(days) {
  if (days < 0) return `Expired ${Math.abs(days)}d ago`;
  if (days === 0) return 'Expires today';
  if (days === 1) return 'Expires tomorrow';
  if (days <= 30) return `Expires in ${days} days`;
  return `${Math.floor(days / 30)} months left`;
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const SAMPLE_ITEMS = [
  { id: '1', name: 'Samsung Washer WF45', category: 'Appliance', retailer: 'Home Depot', purchasePrice: 899, purchaseDate: '2022-03-14', warrantyExpiration: '2025-04-21', contractorName: "Jake's Appliance Repair", contractorPhone: '(904) 555-0183', contractorEmail: 'jake@appliancerepair.com', notes: 'Extended warranty through Home Depot Protection Plan.' },
  { id: '2', name: 'Lennox HVAC Unit', category: 'HVAC', retailer: 'ARS Rescue Rooter', purchasePrice: 4200, purchaseDate: '2023-01-10', warrantyExpiration: '2029-01-10', contractorName: '', contractorPhone: '', contractorEmail: '', notes: '' },
  { id: '3', name: 'LG Refrigerator', category: 'Appliance', retailer: 'Best Buy', purchasePrice: 1299, purchaseDate: '2022-08-01', warrantyExpiration: '2027-08-01', contractorName: '', contractorPhone: '', contractorEmail: '', notes: '' },
  { id: '4', name: 'Roof — GAF Timberline', category: 'Roofing', retailer: 'All American Roofing', purchasePrice: 12500, purchaseDate: '2021-06-15', warrantyExpiration: '2046-06-15', contractorName: 'All American Roofing', contractorPhone: '(904) 555-9021', contractorEmail: '', notes: '25-year shingle warranty.' },
];

// ── SCREENS ──────────────────────────────────────────────

function ListScreen({ items, onAdd, onSelect, unlocked }) {
  const [search, setSearch] = useState('');
  const filtered = items.filter(i =>
    !search || i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.category.toLowerCase().includes(search.toLowerCase())
  );
  const urgent = filtered.filter(i => daysUntil(i.warrantyExpiration) <= 30);
  const rest = filtered.filter(i => daysUntil(i.warrantyExpiration) > 30);

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" />
      <View style={s.listHeader}>
        <Text style={s.appTitle}>VaultKeep</Text>
        <TouchableOpacity style={s.addBtn} onPress={onAdd}>
          <Text style={s.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>
      <View style={s.searchWrap}>
        <TextInput style={s.search} value={search} onChangeText={setSearch} placeholder="Search items..." placeholderTextColor={C.textFaint} />
      </View>
      <ScrollView contentContainerStyle={s.listContent}>
        {urgent.length > 0 && (
          <>
            <Text style={s.sectionWarn}>⚠ Needs attention</Text>
            {urgent.map(item => <ItemRow key={item.id} item={item} onPress={() => onSelect(item)} />)}
          </>
        )}
        {rest.length > 0 && (
          <>
            <Text style={s.sectionLabel}>All items</Text>
            {rest.map(item => <ItemRow key={item.id} item={item} onPress={() => onSelect(item)} />)}
          </>
        )}
        {items.length === 0 && (
          <View style={s.empty}>
            <Text style={s.emptyIcon}>🗃</Text>
            <Text style={s.emptyTitle}>No items yet</Text>
            <Text style={s.emptySub}>Tap + to add your first warranty</Text>
            <TouchableOpacity style={s.emptyBtn} onPress={onAdd}>
              <Text style={s.emptyBtnText}>Add first item</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function ItemRow({ item, onPress }) {
  const days = daysUntil(item.warrantyExpiration);
  const color = statusColor(days);
  return (
    <TouchableOpacity style={s.itemCard} onPress={onPress} activeOpacity={0.75}>
      <View style={[s.dot, { backgroundColor: color }]} />
      <View style={s.itemBody}>
        <Text style={s.itemName} numberOfLines={1}>{item.name}</Text>
        <Text style={s.itemMeta}>{item.category}{item.retailer ? ` · ${item.retailer}` : ''}</Text>
      </View>
      <View style={s.itemRight}>
        <Text style={[s.itemExpiry, { color }]}>{expiryLabel(days)}</Text>
        {item.purchasePrice > 0 && <Text style={s.itemPrice}>${item.purchasePrice.toLocaleString()}</Text>}
      </View>
      <Text style={s.chevron}>›</Text>
    </TouchableOpacity>
  );
}

function DetailScreen({ item, onBack, onEdit, onDelete }) {
  const days = daysUntil(item.warrantyExpiration);
  const color = statusColor(days);
  return (
    <SafeAreaView style={s.safe}>
      <View style={s.navBar}>
        <TouchableOpacity onPress={onBack}><Text style={s.navBack}>‹ Back</Text></TouchableOpacity>
        <TouchableOpacity onPress={onEdit}><Text style={s.navAction}>Edit</Text></TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={s.detailContent}>
        <View style={s.heroCard}>
          <Text style={s.heroName}>{item.name}</Text>
          <Text style={s.heroCategory}>{item.category}</Text>
          <View style={[s.statusPill, { backgroundColor: color + '22' }]}>
            <View style={[s.dot, { backgroundColor: color }]} />
            <Text style={[s.statusPillText, { color }]}>{expiryLabel(days)}</Text>
          </View>
        </View>
        <View style={s.card}>
          <Text style={s.cardTitle}>Purchase details</Text>
          {item.retailer ? <Row label="Retailer" value={item.retailer} /> : null}
          {item.purchasePrice > 0 ? <Row label="Price" value={`$${item.purchasePrice.toLocaleString()}`} /> : null}
          <Row label="Purchased" value={formatDate(item.purchaseDate)} />
          <Row label="Expires" value={formatDate(item.warrantyExpiration)} accent={days <= 30} />
        </View>
        {item.contractorName ? (
          <View style={s.card}>
            <Text style={s.cardTitle}>Contractor</Text>
            <Row label="Name" value={item.contractorName} />
            {item.contractorPhone ? <Row label="Phone" value={item.contractorPhone} teal /> : null}
            {item.contractorEmail ? <Row label="Email" value={item.contractorEmail} teal /> : null}
          </View>
        ) : null}
        {item.notes ? (
          <View style={s.card}>
            <Text style={s.cardTitle}>Notes</Text>
            <Text style={s.notesText}>{item.notes}</Text>
          </View>
        ) : null}
        <TouchableOpacity style={s.deleteBtn} onPress={() => {
          Alert.alert(`Delete ${item.name}?`, 'This cannot be undone.', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: onDelete },
          ]);
        }}>
          <Text style={s.deleteBtnText}>Delete item</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value, accent, teal }) {
  return (
    <View style={s.row}>
      <Text style={s.rowLabel}>{label}</Text>
      <Text style={[s.rowValue, accent && { color: C.orange }, teal && { color: C.teal }]} numberOfLines={1}>{value}</Text>
    </View>
  );
}

function AddEditScreen({ item, onSave, onCancel }) {
  const isEdit = !!item;
  const [name, setName] = useState(item?.name ?? '');
  const [category, setCategory] = useState(item?.category ?? 'Appliance');
  const [retailer, setRetailer] = useState(item?.retailer ?? '');
  const [price, setPrice] = useState(item?.purchasePrice ? String(item.purchasePrice) : '');
  const [expiry, setExpiry] = useState(item?.warrantyExpiration ?? new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0]);
  const [purchased, setPurchased] = useState(item?.purchaseDate ?? new Date().toISOString().split('T')[0]);
  const [contractor, setContractor] = useState(item?.contractorName ?? '');
  const [phone, setPhone] = useState(item?.contractorPhone ?? '');
  const [email, setEmail] = useState(item?.contractorEmail ?? '');
  const [notes, setNotes] = useState(item?.notes ?? '');
  const [showCat, setShowCat] = useState(false);

  function save() {
    if (!name.trim()) { Alert.alert('Name required'); return; }
    onSave({
      id: item?.id ?? String(Date.now()),
      name: name.trim(), category, retailer: retailer.trim(),
      purchasePrice: parseFloat(price) || 0,
      purchaseDate: purchased, warrantyExpiration: expiry,
      contractorName: contractor.trim(), contractorPhone: phone.trim(),
      contractorEmail: email.trim(), notes: notes.trim(),
    });
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.navBar}>
        <TouchableOpacity onPress={onCancel}><Text style={s.navBack}>Cancel</Text></TouchableOpacity>
        <Text style={s.navTitle}>{isEdit ? 'Edit item' : 'Add item'}</Text>
        <TouchableOpacity onPress={save}><Text style={s.navAction}>Save</Text></TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={s.formContent} keyboardShouldPersistTaps="handled">
        <View style={s.formSection}>
          <Text style={s.formSectionTitle}>Item</Text>
          <F label="Name"><TextInput style={s.input} value={name} onChangeText={setName} placeholder="e.g. Samsung Washer WF45" placeholderTextColor={C.textFaint} /></F>
          <F label="Category">
            <TouchableOpacity style={s.input} onPress={() => setShowCat(true)}>
              <Text style={s.inputText}>{category} ›</Text>
            </TouchableOpacity>
          </F>
        </View>
        <View style={s.formSection}>
          <Text style={s.formSectionTitle}>Purchase</Text>
          <F label="Retailer"><TextInput style={s.input} value={retailer} onChangeText={setRetailer} placeholder="Home Depot" placeholderTextColor={C.textFaint} /></F>
          <F label="Price"><TextInput style={s.input} value={price} onChangeText={setPrice} placeholder="0.00" placeholderTextColor={C.textFaint} keyboardType="decimal-pad" /></F>
          <F label="Purchase date (YYYY-MM-DD)"><TextInput style={s.input} value={purchased} onChangeText={setPurchased} placeholder="2024-01-01" placeholderTextColor={C.textFaint} /></F>
          <F label="Warranty expires (YYYY-MM-DD)"><TextInput style={[s.input, { borderColor: C.teal }]} value={expiry} onChangeText={setExpiry} placeholder="2027-01-01" placeholderTextColor={C.textFaint} /></F>
        </View>
        <View style={s.formSection}>
          <Text style={s.formSectionTitle}>Contractor (optional)</Text>
          <F label="Name"><TextInput style={s.input} value={contractor} onChangeText={setContractor} placeholder="Jake's Appliance Repair" placeholderTextColor={C.textFaint} /></F>
          <F label="Phone"><TextInput style={s.input} value={phone} onChangeText={setPhone} placeholder="(904) 555-0183" placeholderTextColor={C.textFaint} keyboardType="phone-pad" /></F>
          <F label="Email"><TextInput style={s.input} value={email} onChangeText={setEmail} placeholder="contractor@email.com" placeholderTextColor={C.textFaint} keyboardType="email-address" autoCapitalize="none" /></F>
        </View>
        <View style={s.formSection}>
          <Text style={s.formSectionTitle}>Notes</Text>
          <TextInput style={[s.input, { minHeight: 80, textAlignVertical: 'top', paddingTop: 10 }]} value={notes} onChangeText={setNotes} placeholder="Additional notes..." placeholderTextColor={C.textFaint} multiline />
        </View>
      </ScrollView>
      <Modal visible={showCat} transparent animationType="slide">
        <View style={s.modalBg}>
          <View style={s.modalBox}>
            <Text style={s.modalTitle}>Category</Text>
            {CATEGORIES.map(c => (
              <TouchableOpacity key={c} style={s.modalOption} onPress={() => { setCategory(c); setShowCat(false); }}>
                <Text style={[s.modalOptionText, c === category && { color: C.teal }]}>{c}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={s.modalCancel} onPress={() => setShowCat(false)}>
              <Text style={{ color: C.red, fontSize: 16, textAlign: 'center' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function F({ label, children }) {
  return <View style={s.field}><Text style={s.fieldLabel}>{label}</Text>{children}</View>;
}

function PaywallScreen({ onClose, onUnlock }) {
  return (
    <SafeAreaView style={s.safe}>
      <TouchableOpacity style={s.closeX} onPress={onClose}><Text style={{ color: C.textSub, fontSize: 18 }}>✕</Text></TouchableOpacity>
      <ScrollView contentContainerStyle={s.paywallContent}>
        <Text style={s.paywallIcon}>🔐</Text>
        <Text style={s.paywallTitle}>Unlock VaultKeep</Text>
        <Text style={s.paywallSub}>One-time purchase. No subscription. Yours forever.</Text>
        {[
          ['📦', 'Unlimited items — appliances, HVAC, electronics, and more'],
          ['🔔', 'Expiration alerts — 30, 14, 7, and 1 day before expiry'],
          ['📷', 'Attach receipts and PDF manuals to every item'],
          ['📤', 'Export full inventory as PDF for insurance or home sale'],
          ['📱', 'Offline first — your data stays on your device'],
        ].map(([icon, text], i) => (
          <View key={i} style={s.feature}>
            <Text style={s.featureIcon}>{icon}</Text>
            <Text style={s.featureText}>{text}</Text>
          </View>
        ))}
        <TouchableOpacity style={s.unlockBtn} onPress={onUnlock}>
          <Text style={s.unlockBtnText}>Unlock for $14.99</Text>
          <Text style={s.unlockBtnSub}>One-time purchase</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ marginTop: 12 }} onPress={onClose}>
          <Text style={{ color: C.textSub, textAlign: 'center', fontSize: 14 }}>Restore purchase</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── ROOT ─────────────────────────────────────────────────

export default function App() {
  const [items, setItems] = useState(SAMPLE_ITEMS);
  const [screen, setScreen] = useState('list'); // list | detail | add | paywall
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const [unlocked, setUnlocked] = useState(false);

  function handleAdd() {
    if (unlocked || items.length < 1) { setEditing(null); setScreen('add'); }
    else setScreen('paywall');
  }

  function handleSave(item) {
    if (editing) {
      setItems(prev => prev.map(i => i.id === item.id ? item : i));
      setSelected(item);
      setScreen('detail');
    } else {
      setItems(prev => [...prev, item]);
      setScreen('list');
    }
    setEditing(null);
  }

  function handleDelete() {
    setItems(prev => prev.filter(i => i.id !== selected.id));
    setSelected(null);
    setScreen('list');
  }

  if (screen === 'paywall') return (
    <PaywallScreen
      onClose={() => setScreen('list')}
      onUnlock={() => { setUnlocked(true); setScreen('add'); }}
    />
  );

  if (screen === 'add') return (
    <AddEditScreen
      item={editing}
      onSave={handleSave}
      onCancel={() => { setEditing(null); setScreen(editing ? 'detail' : 'list'); }}
    />
  );

  if (screen === 'detail' && selected) return (
    <DetailScreen
      item={selected}
      onBack={() => { setSelected(null); setScreen('list'); }}
      onEdit={() => { setEditing(selected); setScreen('add'); }}
      onDelete={handleDelete}
    />
  );

  return (
    <ListScreen
      items={items}
      unlocked={unlocked}
      onAdd={handleAdd}
      onSelect={item => { setSelected(item); setScreen('detail'); }}
    />
  );
}

// ── STYLES ───────────────────────────────────────────────

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  appTitle: { fontSize: 28, fontWeight: '700', color: C.text },
  addBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.teal, alignItems: 'center', justifyContent: 'center' },
  addBtnText: { fontSize: 24, color: C.white, lineHeight: 30 },
  searchWrap: { paddingHorizontal: 16, paddingBottom: 8 },
  search: { backgroundColor: C.surface, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, color: C.text, fontSize: 15 },
  listContent: { paddingHorizontal: 16, paddingBottom: 40 },
  sectionLabel: { fontSize: 11, fontWeight: '600', color: C.textSub, textTransform: 'uppercase', letterSpacing: 0.8, paddingVertical: 8 },
  sectionWarn: { fontSize: 11, fontWeight: '600', color: C.orange, textTransform: 'uppercase', letterSpacing: 0.8, paddingVertical: 8 },
  itemCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderRadius: 10, padding: 12, marginBottom: 8, gap: 10 },
  dot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  itemBody: { flex: 1, gap: 2 },
  itemName: { fontSize: 15, fontWeight: '600', color: C.text },
  itemMeta: { fontSize: 11, color: C.textSub },
  itemRight: { alignItems: 'flex-end', gap: 2 },
  itemExpiry: { fontSize: 11, fontWeight: '600' },
  itemPrice: { fontSize: 10, color: C.textFaint },
  chevron: { color: C.textFaint, fontSize: 20 },
  empty: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: C.text },
  emptySub: { fontSize: 14, color: C.textSub, textAlign: 'center', paddingHorizontal: 32 },
  emptyBtn: { marginTop: 16, backgroundColor: C.teal, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 16 },
  emptyBtnText: { fontSize: 15, fontWeight: '600', color: C.white },
  navBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  navBack: { color: C.teal, fontSize: 17 },
  navTitle: { fontSize: 16, fontWeight: '600', color: C.text },
  navAction: { color: C.teal, fontSize: 17, fontWeight: '600' },
  detailContent: { paddingHorizontal: 16, paddingBottom: 40, gap: 12 },
  heroCard: { backgroundColor: C.surface, borderRadius: 16, padding: 20, gap: 8 },
  heroName: { fontSize: 22, fontWeight: '700', color: C.text },
  heroCategory: { fontSize: 14, color: C.textSub },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginTop: 4 },
  statusPillText: { fontSize: 13, fontWeight: '600' },
  card: { backgroundColor: C.surface, borderRadius: 16, padding: 16, gap: 4 },
  cardTitle: { fontSize: 11, fontWeight: '600', color: C.textSub, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 0.5, borderBottomColor: C.border },
  rowLabel: { fontSize: 14, color: C.textSub, flex: 1 },
  rowValue: { fontSize: 14, color: C.text, flex: 2, textAlign: 'right' },
  notesText: { fontSize: 14, color: C.textSub, lineHeight: 20 },
  deleteBtn: { backgroundColor: C.red + '22', borderRadius: 10, padding: 16, alignItems: 'center', borderWidth: 0.5, borderColor: C.red + '44', marginTop: 8 },
  deleteBtnText: { color: C.red, fontSize: 16, fontWeight: '600' },
  formContent: { padding: 16, gap: 12, paddingBottom: 60 },
  formSection: { backgroundColor: C.surface, borderRadius: 16, padding: 16, gap: 10 },
  formSectionTitle: { fontSize: 11, fontWeight: '600', color: C.textSub, textTransform: 'uppercase', letterSpacing: 0.8 },
  field: { gap: 4 },
  fieldLabel: { fontSize: 11, color: C.textSub },
  input: { backgroundColor: C.deep, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 9, color: C.text, fontSize: 15, borderWidth: 0.5, borderColor: C.border },
  inputText: { color: C.text, fontSize: 15 },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: C.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, gap: 4 },
  modalTitle: { fontSize: 16, fontWeight: '600', color: C.text, marginBottom: 12 },
  modalOption: { paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: C.border },
  modalOptionText: { fontSize: 15, color: C.text },
  modalCancel: { marginTop: 12, paddingVertical: 12 },
  paywallContent: { padding: 24, alignItems: 'center', paddingTop: 60, gap: 12 },
  paywallIcon: { fontSize: 64 },
  paywallTitle: { fontSize: 28, fontWeight: '700', color: C.text, textAlign: 'center' },
  paywallSub: { fontSize: 15, color: C.textSub, textAlign: 'center', lineHeight: 22 },
  feature: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, alignSelf: 'stretch' },
  featureIcon: { fontSize: 20, width: 28 },
  featureText: { fontSize: 14, color: C.text, flex: 1, lineHeight: 20 },
  unlockBtn: { backgroundColor: C.teal, borderRadius: 16, paddingVertical: 16, paddingHorizontal: 32, alignItems: 'center', marginTop: 12, alignSelf: 'stretch' },
  unlockBtnText: { fontSize: 17, fontWeight: '600', color: C.white },
  unlockBtnSub: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  closeX: { position: 'absolute', top: 56, right: 16, zIndex: 10, width: 32, height: 32, borderRadius: 16, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center' },
});
