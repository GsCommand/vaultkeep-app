import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { savePurchase } from '../store/purchase';
import { colors, spacing, radius, typography } from '../utils/theme';

const FEATURES = [
  { icon: '📦', text: 'Unlimited items — appliances, HVAC, electronics, and more' },
  { icon: '🔔', text: 'Expiration alerts — 30, 14, 7, and 1 day before expiry' },
  { icon: '📷', text: 'Attach receipts and PDF manuals to every item' },
  { icon: '📤', text: 'Export full inventory as PDF for insurance or home sale' },
  { icon: '📱', text: 'Offline first — your data stays on your device' },
];

export default function PaywallScreen() {
  const nav = useNavigation();
  const [loading, setLoading] = useState(false);

  async function handlePurchase() {
    setLoading(true);
    try {
      // TODO: integrate react-native-iap here for production
      // For now simulate a successful purchase
      await savePurchase();
      Alert.alert('Unlocked!', 'VaultKeep is now fully unlocked.', [
        { text: 'OK', onPress: () => nav.goBack() }
      ]);
    } catch (e) {
      Alert.alert('Purchase failed', 'Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleRestore() {
    Alert.alert('Restore purchase', 'If you previously purchased VaultKeep, it will be restored.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Restore', onPress: async () => {
        // TODO: integrate react-native-iap restore here
        Alert.alert('Nothing to restore', 'No previous purchase found.');
      }}
    ]);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <TouchableOpacity style={styles.closeBtn} onPress={() => nav.goBack()}>
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>

      <View style={styles.hero}>
        <Text style={styles.heroIcon}>🔐</Text>
        <Text style={styles.heroTitle}>Unlock VaultKeep</Text>
        <Text style={styles.heroSub}>One-time purchase. No subscription.{'\n'}Yours forever.</Text>
      </View>

      <View style={styles.features}>
        {FEATURES.map((f, i) => (
          <View key={i} style={styles.featureRow}>
            <Text style={styles.featureIcon}>{f.icon}</Text>
            <Text style={styles.featureText}>{f.text}</Text>
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.purchaseBtn} onPress={handlePurchase} disabled={loading}>
          <Text style={styles.purchaseBtnText}>{loading ? 'Processing...' : 'Unlock for $14.99'}</Text>
          <Text style={styles.purchaseBtnSub}>One-time purchase</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleRestore}>
          <Text style={styles.restoreText}>Restore purchase</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  closeBtn: { position: 'absolute', top: 56, right: spacing.lg, zIndex: 10, width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  closeText: { color: colors.textSecondary, fontSize: 14 },
  hero: { alignItems: 'center', paddingTop: 80, paddingBottom: spacing.xl, gap: spacing.md },
  heroIcon: { fontSize: 64 },
  heroTitle: { ...typography.largeTitle, color: colors.textPrimary, textAlign: 'center' },
  heroSub: { ...typography.body, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  features: { paddingHorizontal: spacing.xl, gap: spacing.md, flex: 1 },
  featureRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  featureIcon: { fontSize: 20, width: 28 },
  featureText: { ...typography.body, color: colors.textPrimary, flex: 1, lineHeight: 22 },
  footer: { padding: spacing.xl, gap: spacing.md },
  purchaseBtn: { backgroundColor: colors.teal, borderRadius: radius.lg, paddingVertical: spacing.lg, alignItems: 'center', gap: 2 },
  purchaseBtnText: { ...typography.headline, color: colors.white },
  purchaseBtnSub: { ...typography.caption, color: 'rgba(255,255,255,0.7)' },
  restoreText: { color: colors.textSecondary, textAlign: 'center', ...typography.subhead },
});
