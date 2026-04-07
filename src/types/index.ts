export interface WarrantyItem {
  id: string;
  name: string;
  category: string;
  retailer: string;
  purchasePrice: number;
  purchaseDate: string; // ISO string
  warrantyExpiration: string; // ISO string
  notes: string;
  receiptUri: string | null;
  manualUri: string | null;
  contractorName: string;
  contractorPhone: string;
  contractorEmail: string;
  createdAt: string;
}

export type ExpirationStatus = 'expired' | 'critical' | 'warning' | 'soon' | 'good';

export type RootStackParamList = {
  List: undefined;
  Detail: { itemId: string };
  AddEdit: { itemId?: string };
  Settings: undefined;
  Paywall: undefined;
};
