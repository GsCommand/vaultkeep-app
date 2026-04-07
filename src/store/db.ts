import * as SQLite from 'expo-sqlite';
import { WarrantyItem } from '../types';
import { generateId } from '../utils/itemUtils';

const db = SQLite.openDatabaseSync('vaultkeep.db');

export function initDB(): void {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS items (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'Appliance',
      retailer TEXT NOT NULL DEFAULT '',
      purchasePrice REAL NOT NULL DEFAULT 0,
      purchaseDate TEXT NOT NULL,
      warrantyExpiration TEXT NOT NULL,
      notes TEXT NOT NULL DEFAULT '',
      receiptUri TEXT,
      manualUri TEXT,
      contractorName TEXT NOT NULL DEFAULT '',
      contractorPhone TEXT NOT NULL DEFAULT '',
      contractorEmail TEXT NOT NULL DEFAULT '',
      createdAt TEXT NOT NULL
    );
  `);
}

export function getAllItems(): WarrantyItem[] {
  return db.getAllSync<WarrantyItem>(
    'SELECT * FROM items ORDER BY warrantyExpiration ASC'
  );
}

export function getItem(id: string): WarrantyItem | null {
  return db.getFirstSync<WarrantyItem>('SELECT * FROM items WHERE id = ?', [id]) ?? null;
}

export function insertItem(item: Omit<WarrantyItem, 'id' | 'createdAt'>): WarrantyItem {
  const now = new Date().toISOString();
  const id = generateId();
  db.runSync(
    `INSERT INTO items (id, name, category, retailer, purchasePrice, purchaseDate,
     warrantyExpiration, notes, receiptUri, manualUri, contractorName,
     contractorPhone, contractorEmail, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, item.name, item.category, item.retailer, item.purchasePrice,
     item.purchaseDate, item.warrantyExpiration, item.notes,
     item.receiptUri ?? null, item.manualUri ?? null,
     item.contractorName, item.contractorPhone, item.contractorEmail, now]
  );
  return { ...item, id, createdAt: now };
}

export function updateItem(item: WarrantyItem): void {
  db.runSync(
    `UPDATE items SET name=?, category=?, retailer=?, purchasePrice=?,
     purchaseDate=?, warrantyExpiration=?, notes=?, receiptUri=?, manualUri=?,
     contractorName=?, contractorPhone=?, contractorEmail=? WHERE id=?`,
    [item.name, item.category, item.retailer, item.purchasePrice,
     item.purchaseDate, item.warrantyExpiration, item.notes,
     item.receiptUri ?? null, item.manualUri ?? null,
     item.contractorName, item.contractorPhone, item.contractorEmail, item.id]
  );
}

export function deleteItem(id: string): void {
  db.runSync('DELETE FROM items WHERE id = ?', [id]);
}
