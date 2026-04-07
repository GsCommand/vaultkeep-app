import { WarrantyItem, ExpirationStatus } from '../types';

export function daysUntilExpiration(item: WarrantyItem): number {
  const now = new Date();
  const exp = new Date(item.warrantyExpiration);
  const diff = exp.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function getExpirationStatus(item: WarrantyItem): ExpirationStatus {
  const days = daysUntilExpiration(item);
  if (days < 0) return 'expired';
  if (days <= 7) return 'critical';
  if (days <= 14) return 'warning';
  if (days <= 30) return 'soon';
  return 'good';
}

export function isExpired(item: WarrantyItem): boolean {
  return daysUntilExpiration(item) < 0;
}

export function isExpiringSoon(item: WarrantyItem): boolean {
  const d = daysUntilExpiration(item);
  return d >= 0 && d <= 30;
}

export function expirationLabel(item: WarrantyItem): string {
  const d = daysUntilExpiration(item);
  if (d < 0) return `Expired ${Math.abs(d)} days ago`;
  if (d === 0) return 'Expires today';
  if (d === 1) return 'Expires tomorrow';
  if (d <= 30) return `Expires in ${d} days`;
  const date = new Date(item.warrantyExpiration);
  return `Until ${date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
}

export function statusColor(item: WarrantyItem): string {
  const status = getExpirationStatus(item);
  switch (status) {
    case 'expired': return '#E24B4A';
    case 'critical': return '#E24B4A';
    case 'warning': return '#EF9F27';
    case 'soon': return '#F5C842';
    case 'good': return '#1D9E75';
  }
}

export const CATEGORIES = [
  'Appliance', 'Electronics', 'HVAC', 'Plumbing', 'Roofing',
  'Flooring', 'Windows & Doors', 'Electrical', 'Furniture',
  'Vehicle', 'Tools', 'Other',
];

export function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

export function defaultItem(): Omit<WarrantyItem, 'id' | 'createdAt'> {
  const now = new Date();
  const oneYearOut = new Date(now);
  oneYearOut.setFullYear(oneYearOut.getFullYear() + 1);
  return {
    name: '',
    category: 'Appliance',
    retailer: '',
    purchasePrice: 0,
    purchaseDate: now.toISOString(),
    warrantyExpiration: oneYearOut.toISOString(),
    notes: '',
    receiptUri: null,
    manualUri: null,
    contractorName: '',
    contractorPhone: '',
    contractorEmail: '',
  };
}
