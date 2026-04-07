import React, { useState, useEffect } from 'react';
import { View, Text, Switch, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Linking, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { checkPurchase, clearPurchase } from '../store/purchase';
import { getAllItems } from '../store/db';
import { rescheduleAll } from '../store/notifications';
import { colors, spacing, radius, typography } from '../utils/theme';

export default function SettingsScreen() {
  const nav = useNavigation();
  const [unlocked, setUnlocked] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(true);

  useEffect(() => {
    checkPurchase().then(setUnlocked);
    AsyncStorage.getItem('notif_enabled').then(v => setNotifEnabled(v !== 'false'));
  }, []);

  async function toggleNotifications(val: boolean) {
    setNotifEnabled(val);
    await AsyncStorage.setItem('notif_enabled', String(val));
    if (val) {
      const items = getAllItems();
      await rescheduleAll(items);
    }
  }

  function SettingRow({ label, right }: { label: string; right: React.ReactNode }) {
    return (
      <View style={styles.row}>
        <Text style={styles.rowLabel}>{label}</Text>
        {right}
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => nav.goBack()}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <SettingRow
            label="Warranty alerts"
            right={<Switch value={notifEnabled} onValueChange={toggleNotifications} trackColor={{ true: colors.teal }} />}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Purchase</Text>
          <SettingRow
            label="VaultKeep"
            right={<Text style={[styles.rowValue, { color: unlocked ? colors.good : colors.textSecondary }]}>{unlocked ? 'Unlocked ✓' : 'Locked'}</Text>}
          />
          {!unlocked && (
            <TouchableOpacity style={styles.linkRow} onPress={() => (nav as any).navigate('Paywall')}>
              <Text style={styles.linkText}>Unlock VaultKeep →</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          <TouchableOpacity style={styles.linkRow} onPress={() => Linking.openURL('https://vaultkeepapp.com/privacy')}>
            <Text style={styles.linkText}>Privacy policy</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkRow} onPress={() => Linking.openURL('https://www.apple.com/legal/internet-services/itunes/dev/stdeula/')}>
            <Text style={styles.linkText}>Terms of use</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <SettingRow label="Version" right={<Text style={styles.rowValue}>1.0.0</Text>} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  backText: { color: colors.teal, fontSize: 17 },
  headerTitle: { ...typography.headline, color: colors.textPrimary },
  scroll: { padding: spacing.lg, gap: spacing.md, paddingBottom: 60 },
  section: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.sm },
  sectionTitle: { ...typography.subhead, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: spacing.xs },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.xs },
  rowLabel: { ...typography.body, color: colors.textPrimary },
  rowValue: { ...typography.body, color: colors.textSecondary },
  linkRow: { paddingVertical: spacing.sm },
  linkText: { color: colors.teal, ...typography.body },
});
