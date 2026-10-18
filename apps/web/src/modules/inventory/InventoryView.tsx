import React, { useState, useMemo } from 'react';
import { useI18n } from '../../core/i18n/I18nContext';
import { useTenant } from '../../core/tenant/TenantContext';
import { formatCurrency, toBanglaDigits, formatDate } from '@ngo-erp/shared';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../components/ui/table';
import { Dialog } from '../../components/ui/dialog';
import {
  Boxes,
  PackagePlus,
  PackageMinus,
  HeartHandshake,
  AlertTriangle,
  Warehouse,
  CheckCircle2,
  Check,
  Building2,
  ArrowRightLeft,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Layers,
  Search,
  Filter,
  Printer,
  Receipt,
  ShoppingCart,
  FileText,
  RefreshCw,
  Tag,
  Plus,
  X,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

// ============================================================================
// DATA MODELS
// ============================================================================

export interface InventoryItem {
  id: string;
  itemCode: string;
  nameEn: string;
  nameBn: string;
  category: 'relief' | 'medical' | 'agriculture' | 'social_business' | 'office';
  unit: string;
  branchId: string;
  branchName: string;
  warehouse: string;
  currentStock: number;
  unitCostBDT: number;
  sellingPriceBDT?: number;
  reorderLevel: number;
}

export interface InventoryTransaction {
  id: string;
  date: string;
  type: 'stock_in' | 'internal_use' | 'sale' | 'relief_distribution' | 'branch_transfer';
  itemCode: string;
  itemName: string;
  branchId: string;
  branchName: string;
  targetBranchId?: string;
  targetBranchName?: string;
  quantity: number;
  unit: string;
  unitPriceBDT: number;
  totalAmountBDT: number;
  referenceOrBeneficiary: string;
  voucherNumber?: string;
  isSyncedToAccounts: boolean;
  performedBy: string;
  note?: string;
}

export interface DistributionRecord {
  id: string;
  date: string;
  projectName: string;
  beneficiaryName: string;
  beneficiaryCode: string;
  itemCode: string;
  itemName: string;
  branchName: string;
  quantity: number;
  unitCostBDT: number;
  totalCostBDT: number;
  distributedBy: string;
  voucherNumber?: string;
}

interface BranchOption {
  id: string;
  code: string;
  nameBn: string;
  nameEn: string;
}

// ============================================================================
// INITIAL SEED DATA
// ============================================================================

const DEFAULT_BRANCHES: BranchOption[] = [
  { id: 'b-01', code: 'HO-01', nameBn: 'প্রধান কার্যালয় ও সাভার মূল শাখা', nameEn: 'Head Office & Savar Main Branch' },
  { id: 'b-02', code: 'BR-02', nameBn: 'চট্টগ্রাম আঞ্চলিক শাখা', nameEn: 'Chattogram Regional Branch' },
  { id: 'b-03', code: 'BR-03', nameBn: 'রাজশাহী মাঠ শাখা', nameEn: 'Rajshahi Field Branch' },
  { id: 'b-04', code: 'BR-04', nameBn: 'খুলনা আঞ্চলিক শাখা', nameEn: 'Khulna Regional Branch' }
];

const INITIAL_ITEMS: InventoryItem[] = [
  {
    id: 'it-01',
    itemCode: 'REL-001',
    nameEn: 'Emergency Dry Food Relief Pack (Family)',
    nameBn: 'জরুরি শুকনো খাবার ত্রাণ প্যাকেজ (পারিবারিক)',
    category: 'relief',
    unit: 'Pack',
    branchId: 'b-01',
    branchName: 'প্রধান কার্যালয় ও সাভার মূল শাখা',
    warehouse: 'Dhaka Central Warehouse',
    currentStock: 450,
    unitCostBDT: 1200,
    reorderLevel: 100
  },
  {
    id: 'it-02',
    itemCode: 'WASH-002',
    nameEn: 'Household Water Purification Tablet & Filter',
    nameBn: 'পানি বিশুদ্ধকরণ ট্যাবলেট ও ফিল্টার কিট',
    category: 'medical',
    unit: 'Kit',
    branchId: 'b-01',
    branchName: 'প্রধান কার্যালয় ও সাভার মূল শাখা',
    warehouse: 'Savar Field Depot',
    currentStock: 35, // Low stock alert
    unitCostBDT: 450,
    reorderLevel: 50
  },
  {
    id: 'it-03',
    itemCode: 'AGR-003',
    nameEn: 'High-Yield Vegetable Seed Package',
    nameBn: 'উচ্চফলনশীল সবজি বীজ প্যাকেজ (কৃষি সহায়তা)',
    category: 'agriculture',
    unit: 'Pouch',
    branchId: 'b-03',
    branchName: 'রাজশাহী মাঠ শাখা',
    warehouse: 'Rajshahi Regional Store',
    currentStock: 800,
    unitCostBDT: 250,
    sellingPriceBDT: 320,
    reorderLevel: 150
  },
  {
    id: 'it-04',
    itemCode: 'SB-004',
    nameEn: 'Sukanya Organic Sanitary Napkin (Pack of 8)',
    nameBn: 'সুকন্যা অরগানিক স্যানিটারি ন্যাপকিন (সামাজিক ব্যবসা)',
    category: 'social_business',
    unit: 'Pack',
    branchId: 'b-02',
    branchName: 'চট্টগ্রাম আঞ্চলিক শাখা',
    warehouse: 'Chattogram Store-A',
    currentStock: 1200,
    unitCostBDT: 65,
    sellingPriceBDT: 95,
    reorderLevel: 250
  },
  {
    id: 'it-05',
    itemCode: 'OFF-005',
    nameEn: 'Member Passbook & Loan Agreement Ledger',
    nameBn: 'সদস্য সঞ্চয় পাসবই ও ঋণ চুক্তি ফরম বই',
    category: 'office',
    unit: 'Pcs',
    branchId: 'b-01',
    branchName: 'প্রধান কার্যালয় ও সাভার মূল শাখা',
    warehouse: 'Dhaka Central Warehouse',
    currentStock: 2500,
    unitCostBDT: 22,
    reorderLevel: 500
  },
  {
    id: 'it-06',
    itemCode: 'REL-006',
    nameEn: 'Winter Relief Blanket (Standard)',
    nameBn: 'দুর্যোগকালীন শীতবস্ত্র ও উষ্ণ কম্বল (ত্রাণ সহায়তা)',
    category: 'relief',
    unit: 'Pcs',
    branchId: 'b-03',
    branchName: 'রাজশাহী মাঠ শাখা',
    warehouse: 'Rajshahi Regional Store',
    currentStock: 600,
    unitCostBDT: 350,
    reorderLevel: 100
  },
  {
    id: 'it-07',
    itemCode: 'AGR-007',
    nameEn: 'Organic Vermicompost Fertilizer (25 Kg Bag)',
    nameBn: 'জৈব কেঁচো কম্পোস্ট সার (২৫ কেজি ব্যাগ)',
    category: 'agriculture',
    unit: 'Bag',
    branchId: 'b-04',
    branchName: 'খুলনা আঞ্চলিক শাখা',
    warehouse: 'Khulna Agricultural Depot',
    currentStock: 180,
    unitCostBDT: 480,
    sellingPriceBDT: 600,
    reorderLevel: 40
  }
];

const INITIAL_TRANSACTIONS: InventoryTransaction[] = [
  {
    id: 'tx-01',
    date: '2026-10-14',
    type: 'stock_in',
    itemCode: 'REL-001',
    itemName: 'জরুরি শুকনো খাবার ত্রাণ প্যাকেজ (পারিবারিক)',
    branchId: 'b-01',
    branchName: 'প্রধান কার্যালয় ও সাভার মূল শাখা',
    quantity: 500,
    unit: 'Pack',
    unitPriceBDT: 1200,
    totalAmountBDT: 600000,
    referenceOrBeneficiary: 'সরবরাহকারী: বাংলাদেশ ডমেস্টিক ফুড কর্পোরেশন',
    voucherNumber: 'BP-INV-2026-0038',
    isSyncedToAccounts: true,
    performedBy: 'Sadia Sultana (Store Incharge)'
  },
  {
    id: 'tx-02',
    date: '2026-10-15',
    type: 'relief_distribution',
    itemCode: 'REL-001',
    itemName: 'জরুরি শুকনো খাবার ত্রাণ প্যাকেজ (পারিবারিক)',
    branchId: 'b-01',
    branchName: 'প্রধান কার্যালয় ও সাভার মূল শাখা',
    quantity: 50,
    unit: 'Pack',
    unitPriceBDT: 1200,
    totalAmountBDT: 600000,
    referenceOrBeneficiary: 'বন্যাদুর্গত পরিবার বিতরণ (সাভার মূল কেন্দ্র)',
    voucherNumber: 'JV-REL-2026-0012',
    isSyncedToAccounts: true,
    performedBy: 'Md. Tariqul Islam (Field Officer)'
  },
  {
    id: 'tx-03',
    date: '2026-10-16',
    type: 'sale',
    itemCode: 'SB-004',
    itemName: 'সুকন্যা অরগানিক স্যানিটারি ন্যাপকিন (সামাজিক ব্যবসা)',
    branchId: 'b-02',
    branchName: 'চট্টগ্রাম আঞ্চলিক শাখা',
    quantity: 150,
    unit: 'Pack',
    unitPriceBDT: 95,
    totalAmountBDT: 14250,
    referenceOrBeneficiary: 'ক্রেতা: চট্টগ্রাম নারী উদ্যোক্তা সমিতি (ক্যাশ সেল)',
    voucherNumber: 'CR-INV-2026-0005',
    isSyncedToAccounts: true,
    performedBy: 'Farhana Yasmin (Branch Manager)'
  },
  {
    id: 'tx-04',
    date: '2026-10-17',
    type: 'internal_use',
    itemCode: 'OFF-005',
    itemName: 'সদস্য সঞ্চয় পাসবই ও ঋণ চুক্তি ফরম বই',
    branchId: 'b-01',
    branchName: 'প্রধান কার্যালয় ও সাভার মূল শাখা',
    quantity: 120,
    unit: 'Pcs',
    unitPriceBDT: 22,
    totalAmountBDT: 2640,
    referenceOrBeneficiary: 'ব্যবহার: সুর্যমুখী মহিলা সমিতির নতুন সদস্য রেজিস্ট্রেশন',
    voucherNumber: 'JV-INV-2026-0018',
    isSyncedToAccounts: true,
    performedBy: 'Md. Tariqul Islam (Field Officer)'
  }
];

const INITIAL_DISTRIBUTIONS: DistributionRecord[] = [
  {
    id: 'dst-01',
    date: '2026-10-16',
    projectName: 'WASH & Community Health',
    beneficiaryName: 'Rahima Begum',
    beneficiaryCode: 'MEM-2026-0001',
    itemCode: 'WASH-002',
    itemName: 'পানি বিশুদ্ধকরণ ট্যাবলেট ও ফিল্টার কিট',
    branchName: 'প্রধান কার্যালয় ও সাভার মূল শাখা',
    quantity: 1,
    unitCostBDT: 450,
    totalCostBDT: 450,
    distributedBy: 'Md. Tariqul Islam (Field Officer)',
    voucherNumber: 'JV-REL-2026-0011'
  },
  {
    id: 'dst-02',
    date: '2026-10-15',
    projectName: 'Emergency Flood Relief 2026',
    beneficiaryName: 'Md. Abdul Karim',
    beneficiaryCode: 'MEM-2026-0002',
    itemCode: 'REL-001',
    itemName: 'জরুরি শুকনো খাবার ত্রাণ প্যাকেজ (পারিবারিক)',
    branchName: 'প্রধান কার্যালয় ও সাভার মূল শাখা',
    quantity: 2,
    unitCostBDT: 1200,
    totalCostBDT: 2400,
    distributedBy: 'Md. Tariqul Islam (Field Officer)',
    voucherNumber: 'JV-REL-2026-0012'
  }
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const InventoryView: React.FC = () => {
  const { isBangla } = useI18n();
  const { tenant } = useTenant();

  // Storage Keys
  const itemsKey = `ngo_inventory_items_${tenant?.id || 'default'}`;
  const txKey = `ngo_inventory_tx_${tenant?.id || 'default'}`;
  const dstKey = `ngo_inventory_dst_${tenant?.id || 'default'}`;
  const vouchersKey = `ngo_vouchers_${tenant?.id || 'default'}`;

  // Persistent States
  const [items, setItems] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem(itemsKey);
    return saved ? JSON.parse(saved) : INITIAL_ITEMS;
  });

  const [transactions, setTransactions] = useState<InventoryTransaction[]>(() => {
    const saved = localStorage.getItem(txKey);
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [distributions, setDistributions] = useState<DistributionRecord[]>(() => {
    const saved = localStorage.getItem(dstKey);
    return saved ? JSON.parse(saved) : INITIAL_DISTRIBUTIONS;
  });

  // Dynamic Branches from Organization module with fallback
  const branches = useMemo<BranchOption[]>(() => {
    const savedBranches = localStorage.getItem(`ngo_branches_${tenant?.id}`);
    if (savedBranches) {
      try {
        const parsed = JSON.parse(savedBranches);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((b: any) => ({
            id: b.id,
            code: b.code || 'BR',
            nameBn: b.name?.bn || b.name || 'শাখা',
            nameEn: b.name?.en || b.code || 'Branch'
          }));
        }
      } catch (e) {
        console.error('Failed to parse saved branches', e);
      }
    }
    return DEFAULT_BRANCHES;
  }, [tenant?.id]);

  // Filters & Tabs
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'items' | 'movements' | 'distributions' | 'branch_matrix'>('items');
  const [txTypeFilter, setTxTypeFilter] = useState<string>('all');

  // Success Notification
  const [syncAlert, setSyncAlert] = useState<string | null>(null);

  // Modals
  const [isAddItemOpen, setIsAddItemOpen] = useState<boolean>(false);
  const [isStockInOpen, setIsStockInOpen] = useState<boolean>(false);
  const [isStockOutOpen, setIsStockOutOpen] = useState<boolean>(false);
  const [isTransferOpen, setIsTransferOpen] = useState<boolean>(false);
  const [isPrintReportOpen, setIsPrintReportOpen] = useState<boolean>(false);

  // Form States: New Item
  const [newItemCode, setNewItemCode] = useState<string>('');
  const [newItemNameBn, setNewItemNameBn] = useState<string>('');
  const [newItemNameEn, setNewItemNameEn] = useState<string>('');
  const [newItemCategory, setNewItemCategory] = useState<'relief' | 'medical' | 'agriculture' | 'social_business' | 'office'>('relief');
  const [newItemUnit, setNewItemUnit] = useState<string>('Pack');
  const [newItemBranch, setNewItemBranch] = useState<string>(branches[0]?.id || 'b-01');
  const [newItemWarehouse, setNewItemWarehouse] = useState<string>('Main Central Warehouse');
  const [newItemOpeningStock, setNewItemOpeningStock] = useState<number>(0);
  const [newItemUnitCost, setNewItemUnitCost] = useState<number>(100);
  const [newItemSellingPrice, setNewItemSellingPrice] = useState<number>(0);
  const [newItemReorderLevel, setNewItemReorderLevel] = useState<number>(20);

  // Form States: Stock In
  const [stockInItemCode, setStockInItemCode] = useState<string>(items[0]?.itemCode || '');
  const [stockInBranch, setStockInBranch] = useState<string>(branches[0]?.id || 'b-01');
  const [stockInQty, setStockInQty] = useState<number>(10);
  const [stockInUnitCost, setStockInUnitCost] = useState<number>(items[0]?.unitCostBDT || 100);
  const [stockInSupplier, setStockInSupplier] = useState<string>('');
  const [stockInChallan, setStockInChallan] = useState<string>('');
  const [stockInPaymentHead, setStockInPaymentHead] = useState<'cash' | 'bank' | 'payable'>('cash');
  const [stockInDate, setStockInDate] = useState<string>('2026-10-18');
  const [stockInSyncAccounts, setStockInSyncAccounts] = useState<boolean>(true);

  // Form States: Stock Out (Use / Sale / Relief)
  const [stockOutType, setStockOutType] = useState<'internal_use' | 'sale' | 'relief_distribution'>('internal_use');
  const [stockOutItemCode, setStockOutItemCode] = useState<string>(items[0]?.itemCode || '');
  const [stockOutBranch, setStockOutBranch] = useState<string>(branches[0]?.id || 'b-01');
  const [stockOutQty, setStockOutQty] = useState<number>(1);
  const [stockOutSalePrice, setStockOutSalePrice] = useState<number>(items[0]?.sellingPriceBDT || items[0]?.unitCostBDT || 100);
  const [stockOutDate, setStockOutDate] = useState<string>('2026-10-18');
  const [stockOutSyncAccounts, setStockOutSyncAccounts] = useState<boolean>(true);

  // Specific Sub-fields
  const [stockOutPurpose, setStockOutPurpose] = useState<string>('অফিস ব্যবহার ও ফিল্ড কার্যক্রম');
  const [stockOutCustomer, setStockOutCustomer] = useState<string>('সাধারণ সদস্য / খুচরা ক্রেতা');
  const [stockOutPaymentMethod, setStockOutPaymentMethod] = useState<'cash' | 'bank' | 'bkash'>('cash');
  const [stockOutBeneficiaryName, setStockOutBeneficiaryName] = useState<string>('মোছাঃ রহিমা বেগম');
  const [stockOutBeneficiaryCode, setStockOutBeneficiaryCode] = useState<string>('MEM-2026-0001');
  const [stockOutProject, setStockOutProject] = useState<string>('জরুরি বন্যা ও প্রাকৃতিক দুর্যোগ পুনর্বাসন প্রকল্প');
  const [stockOutOfficer, setStockOutOfficer] = useState<string>('মোঃ তারিকুল ইসলাম (মাঠ কর্মকর্তা)');

  // Form States: Branch Transfer
  const [transferItemCode, setTransferItemCode] = useState<string>(items[0]?.itemCode || '');
  const [transferFromBranch, setTransferFromBranch] = useState<string>(branches[0]?.id || 'b-01');
  const [transferToBranch, setTransferToBranch] = useState<string>(branches[1]?.id || 'b-02');
  const [transferQty, setTransferQty] = useState<number>(10);
  const [transferNote, setTransferNote] = useState<string>('শাখার চাহিদা অনুযায়ী নিয়মিত মালামাল রি-স্টকিং চালান');
  const [transferDate, setTransferDate] = useState<string>('2026-10-18');

  // ============================================================================
  // SYNCHRONIZATION WITH ACCOUNTS LEDGER (Auto Creates Double Entry Voucher)
  // ============================================================================

  const postAccountsVoucher = (
    voucherType: 'cash_payment' | 'bank_payment' | 'receipt' | 'journal',
    prefix: string,
    payeeOrSource: string,
    totalBDT: number,
    entries: Array<{ accountId: string; accountName: string; debit: number; credit: number; narration: string }>,
    preparedBy: string
  ): string => {
    const voucherNumber = `${prefix}-${Date.now().toString().slice(-4)}`;
    const newVoucher = {
      id: `v-inv-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      voucherNumber,
      type: voucherType,
      date: new Date().toISOString().split('T')[0],
      payeeOrSource,
      totalAmount: totalBDT,
      preparedBy,
      approvedBy: 'সিস্টেম স্বয়ংক্রিয় সিঙ্ক (Inventory Sync)',
      status: 'approved',
      entries
    };

    try {
      const existing = localStorage.getItem(vouchersKey);
      const list = existing ? JSON.parse(existing) : [];
      const updated = [newVoucher, ...list];
      localStorage.setItem(vouchersKey, JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to post voucher to accounts', err);
    }

    return voucherNumber;
  };

  // ============================================================================
  // ACTIONS: ADD ITEM, STOCK IN, STOCK OUT, TRANSFER
  // ============================================================================

  // 1. Add New Item
  const handleAddNewItem = () => {
    if (!newItemNameBn || !newItemCode) {
      alert(isBangla ? 'অনুগ্রহ করে আইটেম কোড ও পণ্যের নাম লিখুন।' : 'Item Code and Name are required.');
      return;
    }

    const branchObj = branches.find((b) => b.id === newItemBranch) || branches[0];
    const newItem: InventoryItem = {
      id: `it-${Date.now()}`,
      itemCode: newItemCode.toUpperCase().trim(),
      nameEn: newItemNameEn || newItemNameBn,
      nameBn: newItemNameBn,
      category: newItemCategory,
      unit: newItemUnit,
      branchId: branchObj.id,
      branchName: isBangla ? branchObj.nameBn : branchObj.nameEn,
      warehouse: newItemWarehouse,
      currentStock: Number(newItemOpeningStock) || 0,
      unitCostBDT: Number(newItemUnitCost) || 0,
      sellingPriceBDT: newItemCategory === 'social_business' || newItemCategory === 'agriculture' ? Number(newItemSellingPrice) : undefined,
      reorderLevel: Number(newItemReorderLevel) || 10
    };

    const updated = [newItem, ...items];
    setItems(updated);
    localStorage.setItem(itemsKey, JSON.stringify(updated));

    // If opening stock > 0, record initial transaction
    if (newItem.currentStock > 0) {
      const initialTx: InventoryTransaction = {
        id: `tx-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        type: 'stock_in',
        itemCode: newItem.itemCode,
        itemName: newItem.nameBn,
        branchId: newItem.branchId,
        branchName: newItem.branchName,
        quantity: newItem.currentStock,
        unit: newItem.unit,
        unitPriceBDT: newItem.unitCostBDT,
        totalAmountBDT: newItem.currentStock * newItem.unitCostBDT,
        referenceOrBeneficiary: 'প্রারম্ভিক মজুদ (Opening Stock)',
        voucherNumber: 'OPN-STK-001',
        isSyncedToAccounts: true,
        performedBy: 'সিস্টেম অ্যাডমিন'
      };
      const updatedTx = [initialTx, ...transactions];
      setTransactions(updatedTx);
      localStorage.setItem(txKey, JSON.stringify(updatedTx));
    }

    setIsAddItemOpen(false);
    setNewItemCode('');
    setNewItemNameBn('');
    setNewItemNameEn('');
    setSyncAlert(isBangla ? `নতুন পণ্য '${newItem.nameBn}' ইনভেন্টরিতে যোগ করা হয়েছে!` : `Item added to inventory!`);
    setTimeout(() => setSyncAlert(null), 4000);
  };

  // 2. Stock In (Purchase / Received)
  const handleRecordStockIn = () => {
    const targetItem = items.find((i) => i.itemCode === stockInItemCode);
    if (!targetItem) return;

    const branchObj = branches.find((b) => b.id === stockInBranch) || branches[0];
    const totalCost = Number(stockInQty) * Number(stockInUnitCost);

    let voucherNum: string | undefined = undefined;
    if (stockInSyncAccounts) {
      voucherNum = postAccountsVoucher(
        stockInPaymentHead === 'cash' ? 'cash_payment' : stockInPaymentHead === 'bank' ? 'bank_payment' : 'journal',
        stockInPaymentHead === 'cash' ? 'CP-INV' : stockInPaymentHead === 'bank' ? 'BP-INV' : 'JV-INV',
        `মজুদ ক্রয়: ${stockInSupplier || 'ভেন্ডর'} (${targetItem.nameBn})`,
        totalCost,
        [
          {
            accountId: '1100',
            accountName: 'মজুদ পণ্য ও ইনভেন্টরি সম্পদ (Current Asset)',
            debit: totalCost,
            credit: 0,
            narration: `${targetItem.nameBn} (${stockInQty} ${targetItem.unit} @ ৳${stockInUnitCost}) ক্রয় মজুদ`
          },
          {
            accountId: stockInPaymentHead === 'cash' ? '1110' : stockInPaymentHead === 'bank' ? '1130' : '2110',
            accountName: stockInPaymentHead === 'cash' ? 'হাতে নগদ (Cash in Hand)' : stockInPaymentHead === 'bank' ? 'সোনালী ব্যাংক লিঃ প্রধান হিসাব' : 'প্রদেয় হিসাব / ভেন্ডর (Accounts Payable)',
            debit: 0,
            credit: totalCost,
            narration: `চালান #${stockInChallan || 'N/A'} পরিশোধ - ${branchObj.nameBn}`
          }
        ],
        'ইনভেন্টরি ম্যানেজার'
      );
    }

    // Update stock
    targetItem.currentStock += Number(stockInQty);
    targetItem.unitCostBDT = Number(stockInUnitCost);
    setItems([...items]);
    localStorage.setItem(itemsKey, JSON.stringify(items));

    // Record Transaction
    const newTx: InventoryTransaction = {
      id: `tx-${Date.now()}`,
      date: stockInDate,
      type: 'stock_in',
      itemCode: targetItem.itemCode,
      itemName: targetItem.nameBn,
      branchId: branchObj.id,
      branchName: isBangla ? branchObj.nameBn : branchObj.nameEn,
      quantity: Number(stockInQty),
      unit: targetItem.unit,
      unitPriceBDT: Number(stockInUnitCost),
      totalAmountBDT: totalCost,
      referenceOrBeneficiary: stockInSupplier ? `সরবরাহকারী: ${stockInSupplier} (চালান: ${stockInChallan || 'N/A'})` : `ক্রয় চালান: ${stockInChallan || 'N/A'}`,
      voucherNumber: voucherNum,
      isSyncedToAccounts: !!voucherNum,
      performedBy: 'স্টোর অফিসার'
    };

    const updatedTx = [newTx, ...transactions];
    setTransactions(updatedTx);
    localStorage.setItem(txKey, JSON.stringify(updatedTx));

    setIsStockInOpen(false);
    setSyncAlert(
      isBangla
        ? `স্টক ইন সম্পন্ন হয়েছে! মোট ৳ ${toBanglaDigits(totalCost)} টাকার পণ্য ইনভেন্টরিতে যুক্ত হয়েছে${voucherNum ? ` এবং একাউন্টসে ভাউচার #${voucherNum} সিঙ্ক হয়েছে` : ''}।`
        : `Stock In recorded successfully! Synchronized voucher: ${voucherNum}`
    );
    setTimeout(() => setSyncAlert(null), 5000);
  };

  // 3. Stock Out (Use / Sale / Relief)
  const handleRecordStockOut = () => {
    const targetItem = items.find((i) => i.itemCode === stockOutItemCode);
    if (!targetItem) return;

    if (targetItem.currentStock < Number(stockOutQty)) {
      alert(
        isBangla
          ? `অপর্যাপ্ত স্টক! বর্তমান মজুদ মাত্র ${toBanglaDigits(targetItem.currentStock)} ${targetItem.unit}`
          : `Insufficient stock! Current stock is only ${targetItem.currentStock} ${targetItem.unit}`
      );
      return;
    }

    const branchObj = branches.find((b) => b.id === stockOutBranch) || branches[0];
    let totalBDT = 0;
    let voucherNum: string | undefined = undefined;
    let refOrBen = '';

    if (stockOutType === 'internal_use') {
      totalBDT = Number(stockOutQty) * targetItem.unitCostBDT;
      refOrBen = `উদ্দেশ্য: ${stockOutPurpose}`;

      if (stockOutSyncAccounts) {
        voucherNum = postAccountsVoucher(
          'journal',
          'JV-USE',
          `অভ্যন্তরীণ ব্যবহার: ${targetItem.nameBn}`,
          totalBDT,
          [
            {
              accountId: targetItem.category === 'office' ? '5700' : '5100',
              accountName: targetItem.category === 'office' ? 'মুদ্রণ, স্টেশনারি ও ডাক খরচ' : 'কর্মসূচি ও প্রকল্প প্রত্যক্ষ ব্যয়',
              debit: totalBDT,
              credit: 0,
              narration: `খাত: ${stockOutPurpose} (${stockOutQty} ${targetItem.unit} @ ৳${targetItem.unitCostBDT})`
            },
            {
              accountId: '1100',
              accountName: 'মজুদ পণ্য ও ইনভেন্টরি সম্পদ (Current Asset)',
              debit: 0,
              credit: totalBDT,
              narration: `ইনভেন্টরি হতে সমন্বয় - ${branchObj.nameBn}`
            }
          ],
          'মাঠ কর্মকর্তা'
        );
      }
    } else if (stockOutType === 'sale') {
      totalBDT = Number(stockOutQty) * Number(stockOutSalePrice);
      refOrBen = `ক্রেতা: ${stockOutCustomer} (${stockOutPaymentMethod.toUpperCase()} পেমেন্ট)`;

      if (stockOutSyncAccounts) {
        voucherNum = postAccountsVoucher(
          'receipt',
          'CR-INV',
          `পণ্য বিক্রি: ${stockOutCustomer} (${targetItem.nameBn})`,
          totalBDT,
          [
            {
              accountId: stockOutPaymentMethod === 'bkash' ? '1150' : stockOutPaymentMethod === 'bank' ? '1130' : '1110',
              accountName: stockOutPaymentMethod === 'bkash' ? 'বিকাশ মার্চেন্ট হিসাব' : stockOutPaymentMethod === 'bank' ? 'সোনালী ব্যাংক লিঃ প্রধান হিসাব' : 'হাতে নগদ (Cash in Hand)',
              debit: totalBDT,
              credit: 0,
              narration: `${targetItem.nameBn} বিক্রয়লব্ধ অর্থ গ্রহণ (${stockOutQty} ${targetItem.unit} @ ৳${stockOutSalePrice})`
            },
            {
              accountId: '4400',
              accountName: 'সামাজিক ব্যবসা ও পণ্য বিক্রি রাজস্ব (Sales Income)',
              debit: 0,
              credit: totalBDT,
              narration: `রসিদ: ${stockOutCustomer} - ${branchObj.nameBn}`
            }
          ],
          'শাখা ক্যাশিয়ার'
        );
      }
    } else if (stockOutType === 'relief_distribution') {
      totalBDT = Number(stockOutQty) * targetItem.unitCostBDT;
      refOrBen = `সুফলভোগী: ${stockOutBeneficiaryName} (${stockOutBeneficiaryCode}) | প্রকল্প: ${stockOutProject}`;

      if (stockOutSyncAccounts) {
        voucherNum = postAccountsVoucher(
          'journal',
          'JV-REL',
          `ত্রাণ সামগ্রী বিতরণ: ${stockOutBeneficiaryName} - ${targetItem.nameBn}`,
          totalBDT,
          [
            {
              accountId: '5200',
              accountName: 'ত্রাণ ও সুবিধাভোগী সাহায্য বিতরণ (Relief & Aid Expense)',
              debit: totalBDT,
              credit: 0,
              narration: `${stockOutProject} এর আওতায় ${stockOutBeneficiaryName} (${stockOutBeneficiaryCode}) এর মাঝে বিতরণ`
            },
            {
              accountId: '1100',
              accountName: 'মজুদ পণ্য ও ইনভেন্টরি সম্পদ (Current Asset)',
              debit: 0,
              credit: totalBDT,
              narration: `ত্রাণ সামগ্রী স্টক হতে সমন্বয় - ${branchObj.nameBn}`
            }
          ],
          stockOutOfficer
        );
      }

      // Record in Distribution Log
      const newDst: DistributionRecord = {
        id: `dst-${Date.now()}`,
        date: stockOutDate,
        projectName: stockOutProject,
        beneficiaryName: stockOutBeneficiaryName,
        beneficiaryCode: stockOutBeneficiaryCode,
        itemCode: targetItem.itemCode,
        itemName: targetItem.nameBn,
        branchName: isBangla ? branchObj.nameBn : branchObj.nameEn,
        quantity: Number(stockOutQty),
        unitCostBDT: targetItem.unitCostBDT,
        totalCostBDT: totalBDT,
        distributedBy: stockOutOfficer,
        voucherNumber: voucherNum
      };
      const updatedDst = [newDst, ...distributions];
      setDistributions(updatedDst);
      localStorage.setItem(dstKey, JSON.stringify(updatedDst));
    }

    // Deduct stock
    targetItem.currentStock = Math.max(0, targetItem.currentStock - Number(stockOutQty));
    setItems([...items]);
    localStorage.setItem(itemsKey, JSON.stringify(items));

    // Record Transaction
    const newTx: InventoryTransaction = {
      id: `tx-${Date.now()}`,
      date: stockOutDate,
      type: stockOutType,
      itemCode: targetItem.itemCode,
      itemName: targetItem.nameBn,
      branchId: branchObj.id,
      branchName: isBangla ? branchObj.nameBn : branchObj.nameEn,
      quantity: Number(stockOutQty),
      unit: targetItem.unit,
      unitPriceBDT: stockOutType === 'sale' ? Number(stockOutSalePrice) : targetItem.unitCostBDT,
      totalAmountBDT: totalBDT,
      referenceOrBeneficiary: refOrBen,
      voucherNumber: voucherNum,
      isSyncedToAccounts: !!voucherNum,
      performedBy: stockOutType === 'relief_distribution' ? stockOutOfficer : 'শাখা দায়িত্বপ্রাপ্ত'
    };

    const updatedTx = [newTx, ...transactions];
    setTransactions(updatedTx);
    localStorage.setItem(txKey, JSON.stringify(updatedTx));

    setIsStockOutOpen(false);
    setSyncAlert(
      isBangla
        ? `স্টক আউট সম্পন্ন হয়েছে! ${stockOutType === 'sale' ? 'বিক্রি' : stockOutType === 'internal_use' ? 'ব্যবহার' : 'ত্রাণ বিতরণ'} বাবদ ৳ ${toBanglaDigits(totalBDT)} রেকর্ড করা হয়েছে${voucherNum ? ` এবং একাউন্টসে ভাউচার #${voucherNum} সিঙ্ক হয়েছে` : ''}।`
        : `Stock Out recorded successfully! Voucher: ${voucherNum}`
    );
    setTimeout(() => setSyncAlert(null), 5000);
  };

  // 4. Branch to Branch Transfer
  const handleRecordTransfer = () => {
    if (transferFromBranch === transferToBranch) {
      alert(isBangla ? 'উৎস শাখা ও গন্তব্য শাখা একই হতে পারবে না।' : 'Source and destination branches cannot be the same.');
      return;
    }

    const targetItem = items.find((i) => i.itemCode === transferItemCode);
    if (!targetItem) return;

    if (targetItem.currentStock < Number(transferQty)) {
      alert(
        isBangla
          ? `উৎস শাখায় পর্যাপ্ত স্টক নেই! বর্তমান স্টক: ${toBanglaDigits(targetItem.currentStock)} ${targetItem.unit}`
          : `Insufficient stock in source branch! Current: ${targetItem.currentStock}`
      );
      return;
    }

    const fromBranchObj = branches.find((b) => b.id === transferFromBranch) || branches[0];
    const toBranchObj = branches.find((b) => b.id === transferToBranch) || branches[1];
    const totalBDT = Number(transferQty) * targetItem.unitCostBDT;

    // Deduct from source item
    targetItem.currentStock -= Number(transferQty);

    // Add or increment in target branch
    const existingInTarget = items.find(
      (i) => i.itemCode === targetItem.itemCode && i.branchId === toBranchObj.id
    );

    if (existingInTarget) {
      existingInTarget.currentStock += Number(transferQty);
    } else {
      // Create new branch stock item
      const newBranchItem: InventoryItem = {
        ...targetItem,
        id: `it-${Date.now()}`,
        branchId: toBranchObj.id,
        branchName: isBangla ? toBranchObj.nameBn : toBranchObj.nameEn,
        warehouse: `${toBranchObj.code} Store`,
        currentStock: Number(transferQty)
      };
      items.push(newBranchItem);
    }

    setItems([...items]);
    localStorage.setItem(itemsKey, JSON.stringify(items));

    // Record Transfer Transaction
    const newTx: InventoryTransaction = {
      id: `tx-${Date.now()}`,
      date: transferDate,
      type: 'branch_transfer',
      itemCode: targetItem.itemCode,
      itemName: targetItem.nameBn,
      branchId: fromBranchObj.id,
      branchName: isBangla ? fromBranchObj.nameBn : fromBranchObj.nameEn,
      targetBranchId: toBranchObj.id,
      targetBranchName: isBangla ? toBranchObj.nameBn : toBranchObj.nameEn,
      quantity: Number(transferQty),
      unit: targetItem.unit,
      unitPriceBDT: targetItem.unitCostBDT,
      totalAmountBDT: totalBDT,
      referenceOrBeneficiary: `শাখা ট্রান্সফার: ${fromBranchObj.nameBn} → ${toBranchObj.nameBn} (${transferNote})`,
      voucherNumber: `TRN-CHL-${Date.now().toString().slice(-4)}`,
      isSyncedToAccounts: true,
      performedBy: 'কেন্দ্রীয় স্টোর কিপার'
    };

    const updatedTx = [newTx, ...transactions];
    setTransactions(updatedTx);
    localStorage.setItem(txKey, JSON.stringify(updatedTx));

    setIsTransferOpen(false);
    setSyncAlert(
      isBangla
        ? `শাখা ট্রান্সফার সফল হয়েছে! ${fromBranchObj.nameBn} হতে ${toBranchObj.nameBn}-এ ${toBanglaDigits(transferQty)} ${targetItem.unit} স্থানান্তর সম্পন্ন।`
        : `Branch transfer completed successfully!`
    );
    setTimeout(() => setSyncAlert(null), 5000);
  };

  // ============================================================================
  // FILTERED DATA & CALCULATED VALUATION METRICS
  // ============================================================================

  // Filtered Items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchBranch = selectedBranch === 'all' || item.branchId === selectedBranch;
      const matchCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchSearch =
        item.itemCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.nameBn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.warehouse.toLowerCase().includes(searchQuery.toLowerCase());
      return matchBranch && matchCategory && matchSearch;
    });
  }, [items, selectedBranch, selectedCategory, searchQuery]);

  // Overall & Branch Valuation
  const totalValuationBDT = useMemo(() => {
    return filteredItems.reduce((acc, curr) => acc + curr.currentStock * curr.unitCostBDT, 0);
  }, [filteredItems]);

  const totalPhysicalUnits = useMemo(() => {
    return filteredItems.reduce((acc, curr) => acc + curr.currentStock, 0);
  }, [filteredItems]);

  const lowStockCount = useMemo(() => {
    return filteredItems.filter((i) => i.currentStock <= i.reorderLevel).length;
  }, [filteredItems]);

  // Monthly Stock In & Out
  const monthlyStockInBDT = useMemo(() => {
    return transactions
      .filter((t) => (selectedBranch === 'all' || t.branchId === selectedBranch) && t.type === 'stock_in')
      .reduce((acc, curr) => acc + curr.totalAmountBDT, 0);
  }, [transactions, selectedBranch]);

  const monthlyStockOutBDT = useMemo(() => {
    return transactions
      .filter(
        (t) =>
          (selectedBranch === 'all' || t.branchId === selectedBranch) &&
          (t.type === 'sale' || t.type === 'internal_use' || t.type === 'relief_distribution')
      )
      .reduce((acc, curr) => acc + curr.totalAmountBDT, 0);
  }, [transactions, selectedBranch]);

  // Filtered Transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchBranch = selectedBranch === 'all' || tx.branchId === selectedBranch || tx.targetBranchId === selectedBranch;
      const matchType = txTypeFilter === 'all' || tx.type === txTypeFilter;
      return matchBranch && matchType;
    });
  }, [transactions, selectedBranch, txTypeFilter]);

  // Category labels helper
  const getCategoryBadge = (cat: InventoryItem['category']) => {
    switch (cat) {
      case 'relief':
        return <Badge className="bg-amber-100 text-amber-800 border-amber-300">ত্রাণ সামগ্রী</Badge>;
      case 'medical':
        return <Badge className="bg-rose-100 text-rose-800 border-rose-300">স্বাস্থ্য ও চিকিৎসা</Badge>;
      case 'agriculture':
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">কৃষি উপকরণ</Badge>;
      case 'social_business':
        return <Badge className="bg-sky-100 text-sky-800 border-sky-300">সামাজিক ব্যবসা</Badge>;
      case 'office':
        return <Badge className="bg-slate-100 text-slate-800 border-slate-300">অফিস স্টেশনারি</Badge>;
    }
  };

  // Transaction type badge helper
  const getTxBadge = (type: InventoryTransaction['type']) => {
    switch (type) {
      case 'stock_in':
        return <Badge className="bg-emerald-600 text-white font-bold">স্টক ইন (ক্রয়)</Badge>;
      case 'sale':
        return <Badge className="bg-blue-600 text-white font-bold">পণ্য বিক্রি (Sale)</Badge>;
      case 'internal_use':
        return <Badge className="bg-amber-600 text-white font-bold">ব্যবহার (অফিস/প্রকল্প)</Badge>;
      case 'relief_distribution':
        return <Badge className="bg-purple-600 text-white font-bold">ত্রাণ বিতরণ</Badge>;
      case 'branch_transfer':
        return <Badge className="bg-indigo-600 text-white font-bold">শাখা ট্রান্সফার</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & QUICK ACTION BUTTONS                                      */}
      {/* ========================================================================= */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <Boxes className="w-6 h-6 text-emerald-600" />
              <span>{isBangla ? 'শাখাভিত্তিক ইনভেন্টরি, মজুদ পণ্য ও হিসাব সিঙ্ক' : 'Branch Inventory, Stock & Accounts Sync'}</span>
            </h2>
            <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-300 font-semibold">
              ERP v2.4
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {isBangla
              ? 'শাখাভিত্তিক মজুদ ভ্যালুয়েশন, স্টক ইন/আউট/সেল/ইউজ ট্র্যাকিং এবং একাউন্টসের সাথে স্বয়ংক্রিয় ভাউচার সমন্বয়।'
              : 'Branch-wise inventory valuation, stock movements (in/use/sale/relief), and automatic ledger sync.'}
          </p>
        </div>

        {/* Global Action CTAs */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => setIsAddItemOpen(true)}
            variant="outline"
            className="text-xs h-9 font-bold border-slate-300 hover:border-emerald-500"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            {isBangla ? 'নতুন আইটেম যোগ' : 'Add Item'}
          </Button>

          <Button
            onClick={() => setIsStockInOpen(true)}
            className="text-xs h-9 font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
          >
            <PackagePlus className="w-4 h-4 mr-1.5" />
            {isBangla ? 'স্টক ইন (ক্রয়)' : 'Stock In'}
          </Button>

          <Button
            onClick={() => setIsStockOutOpen(true)}
            className="text-xs h-9 font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
          >
            <PackageMinus className="w-4 h-4 mr-1.5" />
            {isBangla ? 'স্টক আউট (ইউজ/সেল/ত্রাণ)' : 'Stock Out'}
          </Button>

          <Button
            onClick={() => setIsTransferOpen(true)}
            variant="outline"
            className="text-xs h-9 font-bold border-indigo-300 text-indigo-700 hover:bg-indigo-50"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 mr-1" />
            {isBangla ? 'শাখা ট্রান্সফার' : 'Transfer'}
          </Button>

          <Button
            onClick={() => setIsPrintReportOpen(true)}
            variant="outline"
            className="text-xs h-9 font-bold border-slate-300 text-slate-700 hover:bg-slate-100"
          >
            <Printer className="w-3.5 h-3.5 mr-1" />
            {isBangla ? 'ভ্যালুয়েশন প্রিন্ট' : 'Print Report'}
          </Button>
        </div>
      </div>

      {/* Sync Alert Banner */}
      {syncAlert && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{syncAlert}</span>
          </div>
          <button onClick={() => setSyncAlert(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. BRANCH SELECTOR & HIGH-LEVEL VALUATION METRICS CARDS                    */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-card p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        {/* Branch Filter Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-600" />
            <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
              {isBangla ? 'শাখা নির্বাচন করুন:' : 'Select Branch:'}
            </label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="text-xs font-bold h-9 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">{isBangla ? '🏢 সকল শাখা (সকল ওয়্যারহাউস ও ডিপো)' : '🏢 All Branches (Consolidated)'}</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.code} — {isBangla ? b.nameBn : b.nameEn}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              {isBangla
                ? `প্রদর্শিত হচ্ছে: ${selectedBranch === 'all' ? 'সংস্থার সকল শাখার সম্মিলিত মজুদ' : branches.find((b) => b.id === selectedBranch)?.nameBn}`
                : `Scope: ${selectedBranch === 'all' ? 'All Organization Stores' : branches.find((b) => b.id === selectedBranch)?.nameEn}`}
            </span>
          </div>
        </div>

        {/* 4 Key Valuation Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Card 1: Total Valuation BDT */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/20 border border-emerald-200 dark:border-emerald-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                {isBangla ? 'মোট ইনভেন্টরি আর্থিক মূল্য' : 'Total Inventory Valuation'}
              </span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono text-emerald-900 dark:text-emerald-100">
              {formatCurrency(totalValuationBDT, { useBanglaNumerals: isBangla })}
            </div>
            <p className="text-[10px] text-emerald-700/80 dark:text-emerald-400 font-medium">
              {isBangla ? `${toBanglaDigits(filteredItems.length)} টি আইটেমের মজুদ মূল্য` : `${filteredItems.length} active SKUs valuation`}
            </p>
          </div>

          {/* Card 2: Total Units & SKUs */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                {isBangla ? 'বর্তমান মোট মজুদ পরিমাণ' : 'Total Stock Units in Hand'}
              </span>
              <Boxes className="w-4 h-4 text-slate-500" />
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white">
              {isBangla ? toBanglaDigits(totalPhysicalUnits) : totalPhysicalUnits.toLocaleString()}
            </div>
            <p className="text-[10px] text-muted-foreground font-medium">
              {isBangla ? `মোট ${toBanglaDigits(filteredItems.length)} টি ক্যাটাগরি সামগ্রী` : `Across ${filteredItems.length} product lines`}
            </p>
          </div>

          {/* Card 3: Monthly In & Out Value */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                {isBangla ? 'স্টক ইন ও আউট প্রবাহ' : 'Stock Flow (In / Out)'}
              </span>
              <RefreshCw className="w-3.5 h-3.5 text-sky-600" />
            </div>
            <div className="text-xs font-mono font-bold space-y-0.5">
              <div className="flex items-center justify-between text-emerald-600">
                <span>In:</span>
                <span>{formatCurrency(monthlyStockInBDT, { useBanglaNumerals: isBangla })}</span>
              </div>
              <div className="flex items-center justify-between text-rose-600">
                <span>Out:</span>
                <span>{formatCurrency(monthlyStockOutBDT, { useBanglaNumerals: isBangla })}</span>
              </div>
            </div>
          </div>

          {/* Card 4: Low Stock Alert */}
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300">
                {isBangla ? 'স্বল্প মজুদ সতর্কবার্তা' : 'Low Stock Reorder Alert'}
              </span>
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono text-amber-900 dark:text-amber-200">
              {isBangla ? toBanglaDigits(lowStockCount) : lowStockCount}
            </div>
            <p className="text-[10px] text-amber-700 font-medium">
              {lowStockCount > 0
                ? isBangla
                  ? 'অবিলম্বে রি-অর্ডার / পারচেজ প্রয়োজন'
                  : 'Items below threshold'
                : isBangla
                ? 'সব পণ্যের পর্যাপ্ত মজুদ আছে'
                : 'All items healthy'}
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. NAVIGATION TABS                                                        */}
      {/* ========================================================================= */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('items')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
            activeTab === 'items'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>{isBangla ? 'মজুদ পণ্যের তালিকা ও আর্থিক মূল্য' : 'Stock Items & Valuation'}</span>
          <span className="ml-1 text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full">
            {isBangla ? toBanglaDigits(filteredItems.length) : filteredItems.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('movements')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
            activeTab === 'movements'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <RefreshCw className="w-4 h-4" />
          <span>{isBangla ? 'স্টক ইন/আউট ও মুভমেন্ট লগ' : 'Movement Log (In/Out/Sale)'}</span>
          <span className="ml-1 text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full">
            {isBangla ? toBanglaDigits(transactions.length) : transactions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('distributions')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
            activeTab === 'distributions'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <HeartHandshake className="w-4 h-4" />
          <span>{isBangla ? 'সুফলভোগী ত্রাণ বিতরণ রেজিস্টার' : 'Relief Aid Register'}</span>
          <span className="ml-1 text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full">
            {isBangla ? toBanglaDigits(distributions.length) : distributions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('branch_matrix')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
            activeTab === 'branch_matrix'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>{isBangla ? 'শাখাভিত্তিক মজুদ ম্যাট্রিক্স ও বিবরণী' : 'Branch-wise Matrix'}</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: STOCK ITEMS & VALUATION                                            */}
      {/* ========================================================================= */}
      {activeTab === 'items' && (
        <Card className="border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          {/* Sub Filter Toolbar */}
          <div className="p-4 bg-slate-50/70 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isBangla ? 'কোড, পণ্যের নাম, ওয়্যারহাউস সার্চ...' : 'Search items...'}
                  className="pl-8 text-xs h-9"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-xs h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium"
              >
                <option value="all">{isBangla ? 'সকল ক্যাটাগরি' : 'All Categories'}</option>
                <option value="relief">ত্রাণ সামগ্রী (Relief)</option>
                <option value="medical">চিকিৎসা ও স্বাস্থ্য (Medical)</option>
                <option value="agriculture">কৃষি উপকরণ (Agri)</option>
                <option value="social_business">সামাজিক ব্যবসা (Social Biz)</option>
                <option value="office">অফিস স্টেশনারি (Office)</option>
              </select>
            </div>

            <div className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 self-end sm:self-auto">
              {isBangla
                ? `মোট ভ্যালু: ${formatCurrency(totalValuationBDT, { useBanglaNumerals: true })}`
                : `Total Val: ${formatCurrency(totalValuationBDT)}`}
            </div>
          </div>

          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-900 text-xs font-bold">
                  <TableHead>{isBangla ? 'আইটেম কোড' : 'Item Code'}</TableHead>
                  <TableHead>{isBangla ? 'পণ্যের নাম ও বিবরণ' : 'Item Name & Details'}</TableHead>
                  <TableHead>{isBangla ? 'শাখা ও ওয়্যারহাউস' : 'Branch & Warehouse'}</TableHead>
                  <TableHead className="text-right">{isBangla ? 'একক ক্রয় মূল্য' : 'Unit Cost'}</TableHead>
                  <TableHead className="text-right">{isBangla ? 'বিক্রয় মূল্য' : 'Sale Price'}</TableHead>
                  <TableHead className="text-right">{isBangla ? 'বর্তমান মজুদ' : 'Current Stock'}</TableHead>
                  <TableHead className="text-right">{isBangla ? 'মোট মজুদ মূল্য (BDT)' : 'Total Valuation'}</TableHead>
                  <TableHead>{isBangla ? 'মজুদ অবস্থা' : 'Stock Alert'}</TableHead>
                  <TableHead className="text-center">{isBangla ? 'অ্যাকশন' : 'Action'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-xs text-muted-foreground">
                      {isBangla ? 'কোনো পণ্য পাওয়া যায়নি।' : 'No inventory items found.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item) => {
                    const isLow = item.currentStock <= item.reorderLevel;
                    const itemTotalValue = item.currentStock * item.unitCostBDT;

                    return (
                      <TableRow key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        {/* Code */}
                        <TableCell className="font-mono font-bold text-xs text-emerald-700 dark:text-emerald-400">
                          {item.itemCode}
                        </TableCell>

                        {/* Name */}
                        <TableCell>
                          <div className="font-bold text-sm text-slate-900 dark:text-white">
                            {isBangla ? item.nameBn : item.nameEn}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            {getCategoryBadge(item.category)}
                            <span className="text-[11px] text-muted-foreground font-mono">
                              Unit: {item.unit}
                            </span>
                          </div>
                        </TableCell>

                        {/* Branch & Warehouse */}
                        <TableCell className="text-xs">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">{item.branchName}</div>
                          <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
                            <Warehouse className="w-3 h-3 text-slate-400" />
                            <span>{item.warehouse}</span>
                          </div>
                        </TableCell>

                        {/* Unit Cost */}
                        <TableCell className="text-right font-mono text-xs font-semibold">
                          {formatCurrency(item.unitCostBDT, { useBanglaNumerals: isBangla })}
                        </TableCell>

                        {/* Selling Price */}
                        <TableCell className="text-right font-mono text-xs text-slate-500">
                          {item.sellingPriceBDT ? formatCurrency(item.sellingPriceBDT, { useBanglaNumerals: isBangla }) : '—'}
                        </TableCell>

                        {/* In Stock */}
                        <TableCell className="text-right font-mono font-bold text-sm text-slate-900 dark:text-white">
                          {isBangla ? toBanglaDigits(item.currentStock) : item.currentStock.toLocaleString()}{' '}
                          <span className="text-xs font-normal text-muted-foreground">{item.unit}</span>
                        </TableCell>

                        {/* Total Value */}
                        <TableCell className="text-right font-mono font-black text-sm text-emerald-700 dark:text-emerald-300">
                          {formatCurrency(itemTotalValue, { useBanglaNumerals: isBangla })}
                        </TableCell>

                        {/* Alert */}
                        <TableCell>
                          {isLow ? (
                            <Badge variant="destructive" className="text-[10px] flex items-center gap-1 w-fit animate-pulse">
                              <AlertTriangle className="w-3 h-3" />
                              <span>{isBangla ? 'স্বল্প মজুদ (Reorder)' : 'Low Stock'}</span>
                            </Badge>
                          ) : (
                            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px]">
                              {isBangla ? 'পর্যাপ্ত মজুদ' : 'Healthy'}
                            </Badge>
                          )}
                        </TableCell>

                        {/* Quick Actions */}
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => {
                                setStockInItemCode(item.itemCode);
                                setStockInBranch(item.branchId);
                                setStockInUnitCost(item.unitCostBDT);
                                setIsStockInOpen(true);
                              }}
                              title="স্টক ইন / ক্রয়"
                              className="p-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            >
                              <PackagePlus className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => {
                                setStockOutItemCode(item.itemCode);
                                setStockOutBranch(item.branchId);
                                setStockOutSalePrice(item.sellingPriceBDT || item.unitCostBDT);
                                setIsStockOutOpen(true);
                              }}
                              title="স্টক আউট (ইউজ/বিক্রি/বিতরণ)"
                              className="p-1 rounded bg-rose-50 text-rose-700 hover:bg-rose-100"
                            >
                              <PackageMinus className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => {
                                setTransferItemCode(item.itemCode);
                                setTransferFromBranch(item.branchId);
                                setIsTransferOpen(true);
                              }}
                              title="শাখা ট্রান্সফার"
                              className="p-1 rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                            >
                              <ArrowRightLeft className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: STOCK MOVEMENT & TRANSACTION LOG                                   */}
      {/* ========================================================================= */}
      {activeTab === 'movements' && (
        <Card className="border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50/70 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {isBangla ? 'মুভমেন্ট ফিল্টার:' : 'Filter Movement:'}
              </span>
              <select
                value={txTypeFilter}
                onChange={(e) => setTxTypeFilter(e.target.value)}
                className="text-xs h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium"
              >
                <option value="all">{isBangla ? 'সকল ট্রানজেকশন' : 'All Transactions'}</option>
                <option value="stock_in">স্টক ইন (Purchase / In)</option>
                <option value="sale">পণ্য বিক্রি (Product Sale)</option>
                <option value="internal_use">ব্যবহার (Office & Program Use)</option>
                <option value="relief_distribution">ত্রাণ বিতরণ (Relief Aid)</option>
                <option value="branch_transfer">শাখা ট্রান্সফার (Transfer)</option>
              </select>
            </div>

            <Badge variant="outline" className="text-xs font-mono">
              {isBangla
                ? `মোট ${toBanglaDigits(filteredTransactions.length)} টি মুভমেন্ট রেকর্ড`
                : `${filteredTransactions.length} movement records`}
            </Badge>
          </div>

          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-900 text-xs font-bold">
                  <TableHead>{isBangla ? 'তারিখ' : 'Date'}</TableHead>
                  <TableHead>{isBangla ? 'ধরণ' : 'Type'}</TableHead>
                  <TableHead>{isBangla ? 'পণ্যের নাম ও কোড' : 'Item Name & SKU'}</TableHead>
                  <TableHead>{isBangla ? 'সংশ্লিষ্ট শাখা' : 'Branch Scope'}</TableHead>
                  <TableHead className="text-right">{isBangla ? 'পরিমাণ' : 'Quantity'}</TableHead>
                  <TableHead className="text-right">{isBangla ? 'মোট আর্থিক মূল্য' : 'Total BDT'}</TableHead>
                  <TableHead>{isBangla ? 'রেফারেন্স / ক্রেতা / সুফলভোগী' : 'Reference / Remarks'}</TableHead>
                  <TableHead>{isBangla ? 'একাউন্টস ভাউচার ও সিঙ্ক' : 'Accounts Sync'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-xs text-muted-foreground">
                      {isBangla ? 'কোনো মুভমেন্ট হিস্ট্রি পাওয়া যায়নি।' : 'No transaction movements found.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((tx) => (
                    <TableRow key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 text-xs">
                      {/* Date */}
                      <TableCell className="font-mono text-slate-700 dark:text-slate-300">
                        {formatDate(tx.date)}
                      </TableCell>

                      {/* Type Badge */}
                      <TableCell>{getTxBadge(tx.type)}</TableCell>

                      {/* Item */}
                      <TableCell>
                        <div className="font-bold text-slate-900 dark:text-white">{tx.itemName}</div>
                        <div className="font-mono text-[11px] text-emerald-600">{tx.itemCode}</div>
                      </TableCell>

                      {/* Branch */}
                      <TableCell>
                        <div className="font-semibold text-slate-800 dark:text-slate-200">{tx.branchName}</div>
                        {tx.targetBranchName && (
                          <div className="text-[11px] text-indigo-600 font-medium">
                            → {tx.targetBranchName}
                          </div>
                        )}
                      </TableCell>

                      {/* Qty */}
                      <TableCell className="text-right font-mono font-bold text-slate-900 dark:text-white">
                        {tx.type === 'stock_in' ? (
                          <span className="text-emerald-600">
                            +{isBangla ? toBanglaDigits(tx.quantity) : tx.quantity} {tx.unit}
                          </span>
                        ) : tx.type === 'branch_transfer' ? (
                          <span className="text-indigo-600">
                            ⇄ {isBangla ? toBanglaDigits(tx.quantity) : tx.quantity} {tx.unit}
                          </span>
                        ) : (
                          <span className="text-rose-600">
                            -{isBangla ? toBanglaDigits(tx.quantity) : tx.quantity} {tx.unit}
                          </span>
                        )}
                      </TableCell>

                      {/* Total Amount BDT */}
                      <TableCell className="text-right font-mono font-bold text-slate-900 dark:text-white">
                        {formatCurrency(tx.totalAmountBDT, { useBanglaNumerals: isBangla })}
                      </TableCell>

                      {/* Reference */}
                      <TableCell className="text-slate-600 dark:text-slate-300 max-w-xs truncate">
                        {tx.referenceOrBeneficiary}
                      </TableCell>

                      {/* Accounts Sync Status */}
                      <TableCell>
                        {tx.isSyncedToAccounts ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-300">
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>সিঙ্কড (Synced)</span>
                            </span>
                            {tx.voucherNumber && (
                              <div className="font-mono text-[10px] text-slate-500 font-semibold">
                                {tx.voucherNumber}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                            অপেক্ষমান
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: RELIEF & BENEFICIARY AID REGISTER                                  */}
      {/* ========================================================================= */}
      {activeTab === 'distributions' && (
        <Card className="border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50/70 dark:bg-slate-900/40 p-4 border-b flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-emerald-600" />
              <span>{isBangla ? 'সুফলভোগীদের মাঝে বিতরণকৃত ত্রাণ ও সামগ্রীর অডিট হিসেব' : 'Beneficiary Relief Register'}</span>
            </CardTitle>
            <Button
              onClick={() => {
                setStockOutType('relief_distribution');
                setIsStockOutOpen(true);
              }}
              size="sm"
              className="text-xs bg-emerald-600 hover:bg-emerald-700 font-bold"
            >
              <HeartHandshake className="w-3.5 h-3.5 mr-1" />
              {isBangla ? '+ নতুন ত্রাণ বিতরণ' : 'Distribute Relief'}
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-900 text-xs font-bold">
                  <TableHead>{isBangla ? 'তারিখ' : 'Date'}</TableHead>
                  <TableHead>{isBangla ? 'সুফলভোগী ও কোড' : 'Beneficiary'}</TableHead>
                  <TableHead>{isBangla ? 'প্রকল্পের নাম' : 'Project'}</TableHead>
                  <TableHead>{isBangla ? 'বিতরণকৃত পণ্য' : 'Item Distributed'}</TableHead>
                  <TableHead>{isBangla ? 'শাখা' : 'Branch'}</TableHead>
                  <TableHead className="text-right">{isBangla ? 'পরিমাণ' : 'Quantity'}</TableHead>
                  <TableHead className="text-right">{isBangla ? 'বিতরণ ব্যয় (BDT)' : 'Aid Cost'}</TableHead>
                  <TableHead>{isBangla ? 'দায়িত্বপ্রাপ্ত কর্মকর্তা' : 'Officer'}</TableHead>
                  <TableHead>{isBangla ? 'ভাউচার' : 'Voucher'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {distributions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-xs text-muted-foreground">
                      {isBangla ? 'কোনো ত্রাণ বিতরণের এন্ট্রি নেই।' : 'No relief records found.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  distributions.map((dst) => (
                    <TableRow key={dst.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 text-xs">
                      <TableCell className="font-mono text-slate-700 dark:text-slate-300">
                        {formatDate(dst.date)}
                      </TableCell>
                      <TableCell>
                        <div className="font-bold text-slate-900 dark:text-white">{dst.beneficiaryName}</div>
                        <div className="font-mono text-[11px] text-emerald-600">{dst.beneficiaryCode}</div>
                      </TableCell>
                      <TableCell className="font-medium text-slate-700 dark:text-slate-300">
                        {dst.projectName}
                      </TableCell>
                      <TableCell className="font-semibold text-slate-900 dark:text-white">
                        {dst.itemName}
                      </TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-400">
                        {dst.branchName}
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold text-emerald-600">
                        {isBangla ? toBanglaDigits(dst.quantity) : dst.quantity}
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold text-slate-900 dark:text-white">
                        {formatCurrency(dst.totalCostBDT, { useBanglaNumerals: isBangla })}
                      </TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-400">
                        {dst.distributedBy}
                      </TableCell>
                      <TableCell className="font-mono text-[11px] text-slate-500 font-bold">
                        {dst.voucherNumber || '—'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: BRANCH-WISE MATRIX & SUMMARY                                       */}
      {/* ========================================================================= */}
      {activeTab === 'branch_matrix' && (
        <Card className="border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50/70 dark:bg-slate-900/40 p-4 border-b">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span>{isBangla ? 'শাখাভিত্তিক মজুদ ভ্যালুয়েশন ও ডিপো সামারি' : 'Branch Inventory Matrix & Store Valuation'}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-900 text-xs font-bold">
                  <TableHead>{isBangla ? 'শাখা কোড' : 'Code'}</TableHead>
                  <TableHead>{isBangla ? 'শাখার নাম' : 'Branch Name'}</TableHead>
                  <TableHead className="text-right">{isBangla ? 'আইটেম সংখ্যা (SKU)' : 'Total SKUs'}</TableHead>
                  <TableHead className="text-right">{isBangla ? 'মোট মজুদ ইউনিট' : 'Total Units'}</TableHead>
                  <TableHead className="text-right">{isBangla ? 'মোট ইনভেন্টরি মূল্য (BDT)' : 'Branch Valuation'}</TableHead>
                  <TableHead className="text-right">{isBangla ? 'স্বল্প মজুদ আইটেম' : 'Low Stock SKUs'}</TableHead>
                  <TableHead className="text-center">{isBangla ? 'অ্যাকশন' : 'Action'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {branches.map((b) => {
                  const branchItems = items.filter((i) => i.branchId === b.id);
                  const bValuation = branchItems.reduce((acc, curr) => acc + curr.currentStock * curr.unitCostBDT, 0);
                  const bUnits = branchItems.reduce((acc, curr) => acc + curr.currentStock, 0);
                  const bLow = branchItems.filter((i) => i.currentStock <= i.reorderLevel).length;

                  return (
                    <TableRow key={b.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 text-xs">
                      <TableCell className="font-mono font-bold text-emerald-700">{b.code}</TableCell>
                      <TableCell className="font-bold text-slate-900 dark:text-white">
                        {isBangla ? b.nameBn : b.nameEn}
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold">
                        {isBangla ? toBanglaDigits(branchItems.length) : branchItems.length}
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold">
                        {isBangla ? toBanglaDigits(bUnits) : bUnits.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-mono font-black text-sm text-emerald-700 dark:text-emerald-300">
                        {formatCurrency(bValuation, { useBanglaNumerals: isBangla })}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {bLow > 0 ? (
                          <span className="text-rose-600 font-bold">{isBangla ? toBanglaDigits(bLow) : bLow} (Alert)</span>
                        ) : (
                          <span className="text-emerald-600 font-semibold">{isBangla ? '০' : '0'}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          onClick={() => {
                            setSelectedBranch(b.id);
                            setActiveTab('items');
                          }}
                          size="sm"
                          variant="outline"
                          className="text-[11px] h-7"
                        >
                          {isBangla ? 'মজুদ দেখুন' : 'View Stock'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ADD NEW INVENTORY ITEM                                           */}
      {/* ========================================================================= */}
      <Dialog
        isOpen={isAddItemOpen}
        onClose={() => setIsAddItemOpen(false)}
        title={isBangla ? 'নতুন ইনভেন্টরি পণ্য নিবন্ধন' : 'Add New Inventory Item'}
        maxWidth="lg"
      >
        <div className="space-y-4 pt-2 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                {isBangla ? 'আইটেম কোড / SKU *' : 'Item Code *'}
              </label>
              <Input
                value={newItemCode}
                onChange={(e) => setNewItemCode(e.target.value)}
                placeholder="যেমন: REL-008 বা MED-010"
                className="font-mono uppercase font-bold text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                {isBangla ? 'ক্যাটাগরি *' : 'Category *'}
              </label>
              <select
                value={newItemCategory}
                onChange={(e) => setNewItemCategory(e.target.value as any)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-xs font-semibold"
              >
                <option value="relief">ত্রাণ সামগ্রী (Relief Goods)</option>
                <option value="medical">চিকিৎসা ও ওষুধ (Medical/WASH)</option>
                <option value="agriculture">কৃষি ও বীজ উপকরণ (Agri)</option>
                <option value="social_business">সামাজিক ব্যবসা ও পণ্য (Social Biz)</option>
                <option value="office">অফিস সামগ্রী ও স্টেশনারি (Office)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              {isBangla ? 'পণ্যের নাম (বাংলা) *' : 'Item Name (Bangla) *'}
            </label>
            <Input
              value={newItemNameBn}
              onChange={(e) => setNewItemNameBn(e.target.value)}
              placeholder="যেমন: জরুরি বিশুদ্ধ খাবার পানি জেরিক্যান (১০ লিটার)"
              className="text-xs"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              {isBangla ? 'পণ্যের নাম (ইংরেজি)' : 'Item Name (English)'}
            </label>
            <Input
              value={newItemNameEn}
              onChange={(e) => setNewItemNameEn(e.target.value)}
              placeholder="e.g. Emergency Drinking Water Jerrican (10L)"
              className="text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                {isBangla ? 'প্রাথমিক নির্ধারিত শাখা *' : 'Assigned Branch *'}
              </label>
              <select
                value={newItemBranch}
                onChange={(e) => setNewItemBranch(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-xs font-semibold"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.code} - {isBangla ? b.nameBn : b.nameEn}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                {isBangla ? 'গুদাম / ওয়্যারহাউস নাম' : 'Warehouse / Depot Name'}
              </label>
              <Input
                value={newItemWarehouse}
                onChange={(e) => setNewItemWarehouse(e.target.value)}
                placeholder="যেমন: Savar Main Depot বা Central Store"
                className="text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                {isBangla ? 'পরিমাপক একক *' : 'Unit *'}
              </label>
              <select
                value={newItemUnit}
                onChange={(e) => setNewItemUnit(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-xs font-semibold"
              >
                <option value="Pack">Pack (প্যাকেট)</option>
                <option value="Pcs">Pcs (পিস)</option>
                <option value="Bag">Bag (ব্যাগ)</option>
                <option value="Kg">Kg (কেজি)</option>
                <option value="Kit">Kit (কিট)</option>
                <option value="Pouch">Pouch (পাউচ)</option>
                <option value="Box">Box (বক্স)</option>
                <option value="Ream">Ream (রিম)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                {isBangla ? 'একক ক্রয় মূল্য (BDT) *' : 'Unit Cost (BDT) *'}
              </label>
              <Input
                type="number"
                min={0}
                value={newItemUnitCost}
                onChange={(e) => setNewItemUnitCost(Number(e.target.value))}
                className="text-xs font-mono font-bold"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                {isBangla ? 'বিক্রয় মূল্য (BDT)' : 'Selling Price'}
              </label>
              <Input
                type="number"
                min={0}
                value={newItemSellingPrice}
                onChange={(e) => setNewItemSellingPrice(Number(e.target.value))}
                placeholder="যদি পণ্য বিক্রি করা হয়"
                className="text-xs font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                {isBangla ? 'রি-অর্ডার সতর্কতা মাত্রা' : 'Reorder Level'}
              </label>
              <Input
                type="number"
                min={0}
                value={newItemReorderLevel}
                onChange={(e) => setNewItemReorderLevel(Number(e.target.value))}
                className="text-xs font-mono font-bold text-amber-600"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              {isBangla ? 'প্রারম্ভিক মজুদ স্টক (যদি থাকে)' : 'Opening Stock (Optional)'}
            </label>
            <Input
              type="number"
              min={0}
              value={newItemOpeningStock}
              onChange={(e) => setNewItemOpeningStock(Number(e.target.value))}
              className="text-xs font-mono"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button variant="outline" onClick={() => setIsAddItemOpen(false)} className="text-xs">
              {isBangla ? 'বাতিল' : 'Cancel'}
            </Button>
            <Button onClick={handleAddNewItem} className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700">
              <Check className="w-4 h-4 mr-1.5" />
              {isBangla ? 'আইটেম সংরক্ষণ করুন' : 'Save Item'}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL 2: STOCK IN (PURCHASE / RECEIVED)                                   */}
      {/* ========================================================================= */}
      <Dialog
        isOpen={isStockInOpen}
        onClose={() => setIsStockInOpen(false)}
        title={isBangla ? 'স্টক ইন / পণ্য ক্রয় ভুক্তকরণ' : 'Stock In / Purchase Entry'}
        maxWidth="lg"
      >
        <div className="space-y-4 pt-2 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                {isBangla ? 'শাখা নির্বাচন *' : 'Target Branch *'}
              </label>
              <select
                value={stockInBranch}
                onChange={(e) => setStockInBranch(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-xs font-semibold"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.code} - {isBangla ? b.nameBn : b.nameEn}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                {isBangla ? 'ক্রয় / প্রাপ্তির তারিখ *' : 'Date *'}
              </label>
              <Input
                type="date"
                value={stockInDate}
                onChange={(e) => setStockInDate(e.target.value)}
                className="text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              {isBangla ? 'মজুদযোগ্য পণ্য নির্বাচন করুন *' : 'Select Item *'}
            </label>
            <select
              value={stockInItemCode}
              onChange={(e) => {
                setStockInItemCode(e.target.value);
                const found = items.find((i) => i.itemCode === e.target.value);
                if (found) setStockInUnitCost(found.unitCostBDT);
              }}
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-xs font-semibold"
            >
              {items.map((i) => (
                <option key={i.id} value={i.itemCode}>
                  [{i.itemCode}] {i.nameBn} (বর্তমান স্টক: {i.currentStock} {i.unit})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                {isBangla ? 'ইন / ক্রয়ের পরিমাণ *' : 'Quantity *'}
              </label>
              <Input
                type="number"
                min={1}
                value={stockInQty}
                onChange={(e) => setStockInQty(Number(e.target.value))}
                className="text-xs font-mono font-bold"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                {isBangla ? 'একক ক্রয় মূল্য (BDT) *' : 'Unit Cost (BDT) *'}
              </label>
              <Input
                type="number"
                min={0}
                value={stockInUnitCost}
                onChange={(e) => setStockInUnitCost(Number(e.target.value))}
                className="text-xs font-mono font-bold"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                {isBangla ? 'মোট ক্রয় মূল্য (BDT)' : 'Total BDT'}
              </label>
              <div className="h-10 px-3 rounded-md border border-input bg-slate-100 dark:bg-slate-900 flex items-center font-mono font-bold text-emerald-700 text-sm">
                ৳ {(Number(stockInQty) * Number(stockInUnitCost)).toLocaleString()}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                {isBangla ? 'সরবরাহকারী / দাতা সংস্থার নাম' : 'Supplier / Vendor'}
              </label>
              <Input
                value={stockInSupplier}
                onChange={(e) => setStockInSupplier(e.target.value)}
                placeholder="যেমন: ঢাকা ফার্মাসিউটিক্যালস বা লোকাল বাজার"
                className="text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                {isBangla ? 'চালান / বিল নম্বর' : 'Challan / Bill No'}
              </label>
              <Input
                value={stockInChallan}
                onChange={(e) => setStockInChallan(e.target.value)}
                placeholder="CHL-2026-9901"
                className="text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              {isBangla ? 'পেমেন্ট খাত / অর্থ প্রদান মাধ্যম *' : 'Payment Source / Account *'}
            </label>
            <select
              value={stockInPaymentHead}
              onChange={(e) => setStockInPaymentHead(e.target.value as any)}
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-xs font-semibold"
            >
              <option value="cash">হাতে নগদ (Cash in Hand - 1110 / 1120)</option>
              <option value="bank">সোনালী ব্যাংক লিঃ প্রধান হিসাব (Bank Payment - 1130)</option>
              <option value="payable">বাকিতে ক্রয় / প্রদেয় হিসাব (Accounts Payable - 2110)</option>
            </select>
          </div>

          {/* Accounts Auto Sync Checkbox */}
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-start gap-2.5">
            <input
              type="checkbox"
              id="syncIn"
              checked={stockInSyncAccounts}
              onChange={(e) => setStockInSyncAccounts(e.target.checked)}
              className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
            />
            <label htmlFor="syncIn" className="text-xs font-semibold text-emerald-900 dark:text-emerald-200 cursor-pointer">
              {isBangla
                ? 'একাউন্টে স্বয়ংক্রিয় ভাউচার সিঙ্ক করুন (Auto Create Payment/Journal Voucher in Accounts)'
                : 'Automatically sync this transaction with Accounts Ledger'}
              <p className="text-[11px] font-normal text-emerald-700 dark:text-emerald-400 mt-0.5">
                এটি একাউন্টস লেজারে ডেবিট (ইনভেন্টরি সম্পদ ১১০০) ও ক্রেডিট (নগদ/ব্যাংক) ভাউচার তৈরি করবে।
              </p>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button variant="outline" onClick={() => setIsStockInOpen(false)} className="text-xs">
              {isBangla ? 'বাতিল' : 'Cancel'}
            </Button>
            <Button onClick={handleRecordStockIn} className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700">
              <PackagePlus className="w-4 h-4 mr-1.5" />
              {isBangla ? 'স্টক ইন সম্পন্ন করুন' : 'Confirm Stock In'}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL 3: STOCK OUT (USE / SALE / RELIEF DISTRIBUTION)                     */}
      {/* ========================================================================= */}
      <Dialog
        isOpen={isStockOutOpen}
        onClose={() => setIsStockOutOpen(false)}
        title={isBangla ? 'স্টক আউট (ব্যবহার / বিক্রি / ত্রাণ বিতরণ)' : 'Record Stock Out'}
        maxWidth="lg"
      >
        <div className="space-y-4 pt-2 text-xs">
          {/* Toggle Stock Out Purpose */}
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
              {isBangla ? 'স্টক আউটের ধরণ নির্বাচন করুন *' : 'Select Stock Out Type *'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setStockOutType('internal_use')}
                className={`py-2 px-3 rounded-xl border text-center font-bold transition-all ${
                  stockOutType === 'internal_use'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {isBangla ? 'অভ্যন্তরীণ ব্যবহার (Use)' : 'Internal Use'}
              </button>
              <button
                type="button"
                onClick={() => setStockOutType('sale')}
                className={`py-2 px-3 rounded-xl border text-center font-bold transition-all ${
                  stockOutType === 'sale'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {isBangla ? 'পণ্য বিক্রি (Sale)' : 'Product Sale'}
              </button>
              <button
                type="button"
                onClick={() => setStockOutType('relief_distribution')}
                className={`py-2 px-3 rounded-xl border text-center font-bold transition-all ${
                  stockOutType === 'relief_distribution'
                    ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {isBangla ? 'ত্রাণ বিতরণ (Relief)' : 'Relief Aid'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                {isBangla ? 'শাখা *' : 'Branch *'}
              </label>
              <select
                value={stockOutBranch}
                onChange={(e) => setStockOutBranch(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-xs font-semibold"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.code} - {isBangla ? b.nameBn : b.nameEn}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                {isBangla ? 'তারিখ *' : 'Date *'}
              </label>
              <Input
                type="date"
                value={stockOutDate}
                onChange={(e) => setStockOutDate(e.target.value)}
                className="text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              {isBangla ? 'পণ্য নির্বাচন করুন *' : 'Select Item *'}
            </label>
            <select
              value={stockOutItemCode}
              onChange={(e) => {
                setStockOutItemCode(e.target.value);
                const found = items.find((i) => i.itemCode === e.target.value);
                if (found) setStockOutSalePrice(found.sellingPriceBDT || found.unitCostBDT);
              }}
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-xs font-semibold"
            >
              {items.map((i) => (
                <option key={i.id} value={i.itemCode}>
                  [{i.itemCode}] {i.nameBn} (বর্তমান মজুদ: {i.currentStock} {i.unit} • একক মূল্য: ৳{i.unitCostBDT})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                {isBangla ? 'পরিমাণ *' : 'Quantity *'}
              </label>
              <Input
                type="number"
                min={1}
                value={stockOutQty}
                onChange={(e) => setStockOutQty(Number(e.target.value))}
                className="text-xs font-mono font-bold"
              />
            </div>

            {stockOutType === 'sale' ? (
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  {isBangla ? 'একক বিক্রয় মূল্য (BDT) *' : 'Unit Sale Price *'}
                </label>
                <Input
                  type="number"
                  min={0}
                  value={stockOutSalePrice}
                  onChange={(e) => setStockOutSalePrice(Number(e.target.value))}
                  className="text-xs font-mono font-bold text-blue-600"
                />
              </div>
            ) : (
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  {isBangla ? 'একক ক্রয়/মজুদ মূল্য (BDT)' : 'Unit Cost (BDT)'}
                </label>
                <div className="h-10 px-3 rounded-md border border-input bg-slate-100 dark:bg-slate-900 flex items-center font-mono font-bold text-xs">
                  ৳ {(items.find((i) => i.itemCode === stockOutItemCode)?.unitCostBDT || 0).toLocaleString()}
                </div>
              </div>
            )}

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                {isBangla ? 'মোট টাকার পরিমাণ' : 'Total BDT'}
              </label>
              <div className="h-10 px-3 rounded-md border border-input bg-slate-100 dark:bg-slate-900 flex items-center font-mono font-bold text-sm text-slate-900 dark:text-white">
                ৳{' '}
                {(
                  Number(stockOutQty) *
                  (stockOutType === 'sale'
                    ? Number(stockOutSalePrice)
                    : items.find((i) => i.itemCode === stockOutItemCode)?.unitCostBDT || 0)
                ).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Conditional Sub-fields based on type */}
          {stockOutType === 'internal_use' && (
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                {isBangla ? 'ব্যবহারের খাত ও বিবরণ *' : 'Purpose / Details *'}
              </label>
              <Input
                value={stockOutPurpose}
                onChange={(e) => setStockOutPurpose(e.target.value)}
                placeholder="যেমন: সাভার শাখার সদস্য জরিপ ও নতুন পাসবই বিতরণ"
                className="text-xs"
              />
            </div>
          )}

          {stockOutType === 'sale' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  {isBangla ? 'ক্রেতার নাম / সদস্য কোড *' : 'Customer Name / Member ID *'}
                </label>
                <Input
                  value={stockOutCustomer}
                  onChange={(e) => setStockOutCustomer(e.target.value)}
                  placeholder="রহিমা বেগম (MEM-001) বা সাধারণ ক্রেতা"
                  className="text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  {isBangla ? 'টাকা গ্রহণের মাধ্যম *' : 'Payment Method *'}
                </label>
                <select
                  value={stockOutPaymentMethod}
                  onChange={(e) => setStockOutPaymentMethod(e.target.value as any)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-xs font-semibold"
                >
                  <option value="cash">নগদ ক্যাশ গ্রহণ (Cash in Hand - 1110)</option>
                  <option value="bkash">বিকাশ মার্চেন্ট (bKash - 1150)</option>
                  <option value="bank">ব্যাংক একাউন্ট (Bank Deposit - 1130)</option>
                </select>
              </div>
            </div>
          )}

          {stockOutType === 'relief_distribution' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    {isBangla ? 'সুফলভোগীর নাম *' : 'Beneficiary Name *'}
                  </label>
                  <Input
                    value={stockOutBeneficiaryName}
                    onChange={(e) => setStockOutBeneficiaryName(e.target.value)}
                    placeholder="মোছাঃ রহিমা বেগম"
                    className="text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    {isBangla ? 'সুফলভোগী কোড / আইডি' : 'Beneficiary Code'}
                  </label>
                  <Input
                    value={stockOutBeneficiaryCode}
                    onChange={(e) => setStockOutBeneficiaryCode(e.target.value)}
                    placeholder="MEM-2026-0001"
                    className="text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    {isBangla ? 'উন্নয়ন প্রকল্পের নাম *' : 'Project Name *'}
                  </label>
                  <Input
                    value={stockOutProject}
                    onChange={(e) => setStockOutProject(e.target.value)}
                    className="text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    {isBangla ? 'বিতরণকারী কর্মকর্তা' : 'Officer Incharge'}
                  </label>
                  <Input
                    value={stockOutOfficer}
                    onChange={(e) => setStockOutOfficer(e.target.value)}
                    className="text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Accounts Auto Sync Checkbox */}
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-start gap-2.5">
            <input
              type="checkbox"
              id="syncOut"
              checked={stockOutSyncAccounts}
              onChange={(e) => setStockOutSyncAccounts(e.target.checked)}
              className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
            />
            <label htmlFor="syncOut" className="text-xs font-semibold text-emerald-900 dark:text-emerald-200 cursor-pointer">
              {isBangla
                ? 'একাউন্টে স্বয়ংক্রিয় ভাউচার সিঙ্ক করুন (Auto Create Journal/Receipt Voucher in Accounts)'
                : 'Automatically sync this transaction with Accounts Ledger'}
              <p className="text-[11px] font-normal text-emerald-700 dark:text-emerald-400 mt-0.5">
                {stockOutType === 'sale'
                  ? 'ক্যাশ রিসিট ও সেলস রেভিনিউ ভাউচার একাউন্টসে অন্তর্ভুক্ত হবে।'
                  : stockOutType === 'relief_distribution'
                  ? 'ত্রাণ বিতরণ খরচ (Account 5200) ও ইনভেন্টরি হ্রাস ভাউচার তৈরি হবে।'
                  : 'প্রকল্প/স্টেশনারি ব্যয় ও ইনভেন্টরি সমন্বয় জার্নাল ভাউচার তৈরি হবে।'}
              </p>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button variant="outline" onClick={() => setIsStockOutOpen(false)} className="text-xs">
              {isBangla ? 'বাতিল' : 'Cancel'}
            </Button>
            <Button onClick={handleRecordStockOut} className="text-xs font-bold bg-rose-600 hover:bg-rose-700">
              <PackageMinus className="w-4 h-4 mr-1.5" />
              {isBangla ? 'স্টক আউট সম্পন্ন করুন' : 'Confirm Stock Out'}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL 4: BRANCH TO BRANCH TRANSFER                                        */}
      {/* ========================================================================= */}
      <Dialog
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        title={isBangla ? 'শাখা টু শাখা পণ্য স্থানান্তর (Inter-Branch Transfer)' : 'Inter-Branch Stock Transfer'}
        maxWidth="md"
      >
        <div className="space-y-4 pt-2 text-xs">
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              {isBangla ? 'স্থানান্তরযোগ্য পণ্য নির্বাচন করুন *' : 'Select Item *'}
            </label>
            <select
              value={transferItemCode}
              onChange={(e) => setTransferItemCode(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-xs font-semibold"
            >
              {items.map((i) => (
                <option key={i.id} value={i.itemCode}>
                  [{i.itemCode}] {i.nameBn} ({i.branchName} • মজুদ: {i.currentStock} {i.unit})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                {isBangla ? 'উৎস শাখা (From Branch) *' : 'Source Branch *'}
              </label>
              <select
                value={transferFromBranch}
                onChange={(e) => setTransferFromBranch(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-xs font-semibold"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.code} - {isBangla ? b.nameBn : b.nameEn}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                {isBangla ? 'গন্তব্য শাখা (To Branch) *' : 'Destination Branch *'}
              </label>
              <select
                value={transferToBranch}
                onChange={(e) => setTransferToBranch(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-xs font-semibold"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.code} - {isBangla ? b.nameBn : b.nameEn}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                {isBangla ? 'স্থানান্তর পরিমাণ *' : 'Transfer Quantity *'}
              </label>
              <Input
                type="number"
                min={1}
                value={transferQty}
                onChange={(e) => setTransferQty(Number(e.target.value))}
                className="text-xs font-mono font-bold"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                {isBangla ? 'চালানের তারিখ *' : 'Date *'}
              </label>
              <Input
                type="date"
                value={transferDate}
                onChange={(e) => setTransferDate(e.target.value)}
                className="text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              {isBangla ? 'ট্রান্সফার রেফারেন্স / নোট' : 'Transfer Note / Gate Pass'}
            </label>
            <Input
              value={transferNote}
              onChange={(e) => setTransferNote(e.target.value)}
              placeholder="গেট পাস ও কুরিয়ার / ড্রাইভারের তথ্য"
              className="text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button variant="outline" onClick={() => setIsTransferOpen(false)} className="text-xs">
              {isBangla ? 'বাতিল' : 'Cancel'}
            </Button>
            <Button onClick={handleRecordTransfer} className="text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white">
              <ArrowRightLeft className="w-4 h-4 mr-1.5" />
              {isBangla ? 'স্থানান্তর সম্পন্ন করুন' : 'Confirm Transfer'}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL 5: PRINT INVENTORY VALUATION STATEMENT REPORT                        */}
      {/* ========================================================================= */}
      <Dialog
        isOpen={isPrintReportOpen}
        onClose={() => setIsPrintReportOpen(false)}
        title={isBangla ? 'মজুদ পণ্য ভ্যালুয়েশন ও অডিট প্রতিবেদন' : 'Inventory Valuation Statement'}
        maxWidth="xl"
      >
        <div className="space-y-4 pt-2 text-xs">
          {/* Printable Container */}
          <div className="p-6 bg-white text-slate-900 border border-slate-200 rounded-xl space-y-5">
            {/* Header */}
            <div className="text-center border-b pb-4 space-y-1">
              <h3 className="font-black text-lg text-emerald-800">
                {tenant?.name?.bn || 'জাগরণী উন্নয়ন ফাউন্ডেশন'}
              </h3>
              <p className="text-[11px] text-slate-600">
                {selectedBranch === 'all'
                  ? 'সকল শাখা ও ডিপো সমন্বিত ইনভেন্টরি স্টক ও আর্থিক মূল্যায়ন বিবরণী'
                  : `${branches.find((b) => b.id === selectedBranch)?.nameBn} — ইনভেন্টরি স্টক মূল্যায়ন`}
              </p>
              <div className="text-[10px] text-slate-500 font-mono">
                তারিখ: {formatDate(new Date().toISOString().split('T')[0])} | প্রিন্ট সময়: {new Date().toLocaleTimeString()}
              </div>
            </div>

            {/* Summary Block */}
            <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <div>
                <span className="text-[10px] text-slate-500 block">মোট পণ্যের ধরণ (SKUs)</span>
                <span className="font-bold text-sm font-mono">{toBanglaDigits(filteredItems.length)} টি</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">মোট মজুদ পরিমাণ</span>
                <span className="font-bold text-sm font-mono">{toBanglaDigits(totalPhysicalUnits)} ইউনিট</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">মোট ইনভেন্টরি আর্থিক মূল্য</span>
                <span className="font-black text-sm font-mono text-emerald-700">
                  {formatCurrency(totalValuationBDT, { useBanglaNumerals: true })}
                </span>
              </div>
            </div>

            {/* Table */}
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-300 font-bold text-slate-700">
                  <th className="py-2">কোড</th>
                  <th className="py-2">পণ্যের বিবরণ</th>
                  <th className="py-2">শাখা ও গুদাম</th>
                  <th className="py-2 text-right">একক মূল্য</th>
                  <th className="py-2 text-right">মজুদ</th>
                  <th className="py-2 text-right">মোট মূল্য (BDT)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map((item) => (
                  <tr key={item.id}>
                    <td className="py-2 font-mono font-bold text-emerald-700">{item.itemCode}</td>
                    <td className="py-2">{item.nameBn}</td>
                    <td className="py-2 text-[11px] text-slate-600">{item.branchName}</td>
                    <td className="py-2 text-right font-mono">৳ {item.unitCostBDT.toLocaleString()}</td>
                    <td className="py-2 text-right font-mono font-bold">{toBanglaDigits(item.currentStock)} {item.unit}</td>
                    <td className="py-2 text-right font-mono font-black text-slate-900">
                      ৳ {(item.currentStock * item.unitCostBDT).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-400 font-bold bg-slate-50">
                  <td colSpan={4} className="py-2 text-right font-black">সর্বমোট মজুদ মূল্য:</td>
                  <td className="py-2 text-right font-mono font-bold">{toBanglaDigits(totalPhysicalUnits)}</td>
                  <td className="py-2 text-right font-mono font-black text-emerald-800">
                    {formatCurrency(totalValuationBDT, { useBanglaNumerals: true })}
                  </td>
                </tr>
              </tfoot>
            </table>

            {/* Signatures */}
            <div className="pt-8 flex justify-between text-center text-xs text-slate-600">
              <div className="border-t border-slate-400 w-36 pt-1">
                স্টোর কিপারের স্বাক্ষর
              </div>
              <div className="border-t border-slate-400 w-36 pt-1">
                শাখা ব্যবস্থাপক
              </div>
              <div className="border-t border-slate-400 w-36 pt-1">
                নির্বাহী পরিচালক / নিরীক্ষক
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button variant="outline" onClick={() => setIsPrintReportOpen(false)} className="text-xs">
              {isBangla ? 'বন্ধ করুন' : 'Close'}
            </Button>
            <Button
              onClick={() => {
                window.print();
              }}
              className="text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white"
            >
              <Printer className="w-4 h-4 mr-1.5" />
              {isBangla ? 'প্রিন্ট দিন' : 'Print Now'}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default InventoryView;
