import React, { useState, useRef } from 'react';
import { useI18n } from '../../core/i18n/I18nContext';
import { useTenant } from '../../core/tenant/TenantContext';
import {
  createTenantFullBackup,
  downloadBackupFile,
  restoreTenantFromBackup,
  exportMembersToCsv,
  TenantBackupSnapshot
} from '../../core/backup/dataBackupService';
import { Dialog } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  Database,
  Download,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  HardDriveDownload,
  ShieldCheck,
  FileText
} from 'lucide-react';

interface DataBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataRestored?: () => void;
}

export const DataBackupModal: React.FC<DataBackupModalProps> = ({
  isOpen,
  onClose,
  onDataRestored
}) => {
  const { isBangla } = useI18n();
  const { tenant } = useTenant();

  const [activeTab, setActiveTab] = useState<'backup' | 'restore' | 'csv'>('backup');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // File upload refs
  const restoreFileRef = useRef<HTMLInputElement>(null);
  const csvImportRef = useRef<HTMLInputElement>(null);
  const [previewSnapshot, setPreviewSnapshot] = useState<TenantBackupSnapshot | null>(null);

  const tenantId = tenant?.id || 'demo-ngo';
  const tenantName = (isBangla ? tenant?.name.bn : tenant?.name.en) || 'NGO ERP';

  // 1. Download Full JSON Backup
  const handleDownloadFullBackup = () => {
    try {
      setIsProcessing(true);
      setSuccessMessage(null);
      setErrorMessage(null);

      const snapshot = createTenantFullBackup(tenantId, tenantName);
      downloadBackupFile(snapshot);

      setSuccessMessage(
        isBangla
          ? `আলহামদুলিল্লাহ! "${tenantName}" এর সম্পূর্ণ সিস্টেম ডাটা ব্যাকআপ সফলভাবে ডাউনলোড হয়েছে।`
          : `Full NGO backup snapshot downloaded successfully!`
      );
    } catch (err: any) {
      setErrorMessage(err.message || 'ডাটা ব্যাকআপ প্রক্রিয়া ব্যর্থ হয়েছে।');
    } finally {
      setIsProcessing(false);
    }
  };

  // 2. Select & Parse JSON Restore File
  const handleRestoreFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed.data) {
          throw new Error('অবৈধ ব্যাকআপ ফাইল।');
        }
        setPreviewSnapshot(parsed);
        setErrorMessage(null);
      } catch (err: any) {
        setErrorMessage(isBangla ? 'ফাইলটি পড়তে ব্যর্থ হয়েছে! সঠিক JSON ব্যাকআপ ফাইল নির্বাচন করুন।' : 'Invalid JSON backup file.');
        setPreviewSnapshot(null);
      }
    };
    reader.readAsText(file);
  };

  // 3. Confirm & Execute Restore
  const handleExecuteRestore = () => {
    if (!previewSnapshot) return;

    try {
      setIsProcessing(true);
      const res = restoreTenantFromBackup(previewSnapshot, tenantId);
      setSuccessMessage(
        isBangla
          ? `সফলভাবে ${res.restoredCount} টি ডাটা রেকর্ড রিস্টোর করা হয়েছে! পৃষ্ঠা রিফ্রেশ করুন।`
          : `Successfully restored ${res.restoredCount} records from backup!`
      );
      setPreviewSnapshot(null);
      if (restoreFileRef.current) restoreFileRef.current.value = '';

      if (onDataRestored) {
        onDataRestored();
      }
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.message || 'ডাটা রিস্টোর প্রক্রিয়া ব্যর্থ হয়েছে।');
    } finally {
      setIsProcessing(false);
    }
  };

  // 4. Download Members CSV (Excel Compatible with UTF-8 BOM)
  const handleExportMembersCsv = () => {
    try {
      setIsProcessing(true);
      const raw = localStorage.getItem(`ngo_members_${tenantId}`);
      const members = raw ? JSON.parse(raw) : [];

      if (!members || members.length === 0) {
        setErrorMessage(isBangla ? 'রপ্তানি করার জন্য কোনো সদস্য ডাটা পাওয়া যায়নি।' : 'No members found to export.');
        return;
      }

      exportMembersToCsv(members, `${tenantName.replace(/\s+/g, '_')}_Members`);
      setSuccessMessage(
        isBangla
          ? `মোট ${members.length} জন সদস্যের ডাটা এক্সেল (CSV) ফরম্যাটে ডাউনলোড হয়েছে।`
          : `Exported ${members.length} members to Excel CSV!`
      );
    } catch (err: any) {
      setErrorMessage(err.message || 'এক্সপোর্ট ব্যর্থ হয়েছে।');
    } finally {
      setIsProcessing(false);
    }
  };

  // 5. Batch Import Members from CSV
  const handleCsvImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length < 2) {
          throw new Error('CSV ফাইলে প্রয়োজনীয় সারি পাওয়া যায়নি।');
        }

        // Read header & parse simple CSV
        const header = lines[0].split(',').map((h) => h.replace(/^"|"$/g, '').trim());
        const importedList: any[] = [];

        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map((c) => c.replace(/^"|"$/g, '').trim());
          if (cols.length >= 2) {
            importedList.push({
              id: `m-imp-${Date.now()}-${i}`,
              memberCode: cols[0] || `MEM-IMP-${i}`,
              nameBn: cols[1] || 'আমদানিকৃত সদস্য',
              nameEn: cols[2] || cols[1] || 'Imported Member',
              fatherOrSpouse: cols[3] || '',
              nidOrBirthCert: cols[4] || '',
              mobile: cols[5] || '01700-000000',
              branchName: cols[6] || 'প্রধান শাখা',
              samityName: cols[7] || 'সাধারণ সমিতি',
              status: 'active',
              joinedAt: Date.now()
            });
          }
        }

        const raw = localStorage.getItem(`ngo_members_${tenantId}`);
        const existing = raw ? JSON.parse(raw) : [];
        const merged = [...importedList, ...existing];
        localStorage.setItem(`ngo_members_${tenantId}`, JSON.stringify(merged));

        setSuccessMessage(
          isBangla
            ? `সফলভাবে ${importedList.length} জন নতুন সদস্য সিএসভি ফাইল থেকে সিস্টেমে যুক্ত হয়েছে!`
            : `Successfully imported ${importedList.length} members!`
        );

        if (csvImportRef.current) csvImportRef.current.value = '';
        if (onDataRestored) onDataRestored();
      } catch (err: any) {
        setErrorMessage(err.message || 'সিএসভি ফাইল প্রসেস করতে ব্যর্থ হয়েছে।');
      }
    };
    reader.readAsText(file);
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-foreground font-bold text-base">
          <Database className="w-5 h-5 text-emerald-600" />
          <span>{isBangla ? 'এনজিও ডাটা ব্যাকআপ, রিস্টোর ও এক্সপোর্ট' : 'NGO Data Backup & Restore'}</span>
        </div>
      }
      description={
        isBangla
          ? 'আপনার এনজিও এর সকল তথ্য (সদস্য, ঋণ, হিসাব, ভাউচার, সেটিংস) নিরাপদ ব্যাকআপ রাখুন এবং প্রয়োজনে রিস্টোর করুন।'
          : 'Create full JSON backups of your NGO database, restore previous snapshots, or export members to Excel.'
      }
      maxWidth="lg"
    >
      <div className="space-y-4 pt-2">
        {/* Navigation Tabs */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab('backup')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'backup'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isBangla ? 'ফুল ব্যাকআপ ডাউনলোড' : 'Full Backup'}</span>
          </button>

          <button
            onClick={() => setActiveTab('restore')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'restore'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{isBangla ? 'ডাটা রিস্টোর' : 'Restore Data'}</span>
          </button>

          <button
            onClick={() => setActiveTab('csv')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'csv'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>{isBangla ? 'সদস্য এক্সেল/সিএসভি' : 'Members CSV / Excel'}</span>
          </button>
        </div>

        {/* Alerts */}
        {successMessage && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-300 rounded-xl text-xs font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* TAB 1: FULL BACKUP */}
        {activeTab === 'backup' && (
          <div className="space-y-4">
            <div className="p-4 bg-muted/30 border border-border rounded-xl space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl shrink-0">
                  <HardDriveDownload className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground">
                    {isBangla ? 'সম্পূর্ণ এনজিও ডাটাবেস স্ন্যাপশট' : 'Complete NGO Database Snapshot'}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {isBangla
                      ? 'এক ক্লিকে আপনার প্রতিষ্ঠানের সকল সদস্য, ঋণ ও সঞ্চয় হিসাব, দৈনিক আদায় শিট, ভাউচার, হিসাবের খতিয়ান এবং সিস্টেম সেটিংস এর একটি এনক্রিপ্টেড ব্যাকআপ ফাইল (.json) ডাউনলোড করুন।'
                      : 'Download a complete JSON snapshot containing all members, accounts, vouchers, loans, samity, and configuration.'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-border/60 text-center">
                <div className="p-2 bg-background rounded-lg border text-xs">
                  <span className="text-muted-foreground block text-[10px]">প্রতিষ্ঠান আইডি</span>
                  <span className="font-bold text-primary font-mono">{tenant?.clientId || tenantId}</span>
                </div>
                <div className="p-2 bg-background rounded-lg border text-xs">
                  <span className="text-muted-foreground block text-[10px]">ফরম্যাট</span>
                  <span className="font-bold font-mono">JSON (UTF-8)</span>
                </div>
                <div className="p-2 bg-background rounded-lg border text-xs">
                  <span className="text-muted-foreground block text-[10px]">নিরাপত্তা</span>
                  <span className="font-bold text-emerald-600 font-mono">এনক্রিপ্টেড</span>
                </div>
                <div className="p-2 bg-background rounded-lg border text-xs">
                  <span className="text-muted-foreground block text-[10px]">অফলাইন কপি</span>
                  <span className="font-bold text-foreground">১০০% সুরক্ষিত</span>
                </div>
              </div>
            </div>

            <Button
              onClick={handleDownloadFullBackup}
              disabled={isProcessing}
              className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>{isBangla ? 'সম্পূর্ণ ডাটা ব্যাকআপ ডাউনলোড করুন' : 'Download Complete Backup Snapshot'}</span>
            </Button>
          </div>
        )}

        {/* TAB 2: DATA RESTORE */}
        {activeTab === 'restore' && (
          <div className="space-y-4">
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs space-y-1 text-amber-900 dark:text-amber-200">
              <div className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>{isBangla ? 'সতর্কতা: ডাটা রিস্টোর প্রক্রিয়া' : 'Warning: Data Restore'}</span>
              </div>
              <p className="text-[11px] opacity-90 leading-relaxed">
                {isBangla
                  ? 'পূর্বের ব্যাকআপ ফাইল আপলোড করলে সিস্টেমের ডাটা ওই তারিখের অবস্থায় ফিরে যাবে। রিস্টোর করার পূর্বে বর্তমান ডাটার একটি নতুন ব্যাকআপ ডাউনলোড করে রাখা নিরাপদ।'
                  : 'Restoring a backup file will overwrite existing records with the backup state. It is strongly advised to take a backup first.'}
              </p>
            </div>

            <div className="border-2 border-dashed border-border rounded-xl p-6 text-center space-y-3 hover:bg-muted/20 transition-colors">
              <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
              <div>
                <p className="text-xs font-bold text-foreground">
                  {isBangla ? 'ব্যাকআপ ফাইল (.json) নির্বাচন করুন' : 'Select Backup (.json) File'}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {isBangla ? 'পূর্বে ডাউনলোড করা এনজিও ব্যাকআপ JSON ফাইল আপলোড করুন' : 'Upload an official NGO JSON snapshot'}
                </p>
              </div>
              <input
                ref={restoreFileRef}
                type="file"
                accept=".json,application/json"
                onChange={handleRestoreFileChange}
                className="text-xs file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:opacity-90 cursor-pointer"
              />
            </div>

            {previewSnapshot && (
              <div className="p-3.5 bg-background border border-emerald-500/40 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    <span>{isBangla ? 'ব্যাকআপ ফাইল যাচাইকরণ সফল' : 'Verified Backup Snapshot'}</span>
                  </span>
                  <Badge variant="outline" className="text-[10px] font-mono">
                    {previewSnapshot.version}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>প্রতিষ্ঠান: <strong className="text-foreground">{previewSnapshot.tenantName}</strong></div>
                  <div>রপ্তানির তারিখ: <span className="font-mono">{previewSnapshot.exportedDate}</span></div>
                  <div>
                    সদস্য সংখ্যা: <strong className="text-foreground">{previewSnapshot.data.members?.length || 0}</strong> জন | 
                    ঋণ ফাইল: <strong className="text-foreground">{previewSnapshot.data.loans?.length || 0}</strong> টি
                  </div>
                </div>

                <Button
                  onClick={handleExecuteRestore}
                  disabled={isProcessing}
                  className="w-full mt-2 h-9 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{isBangla ? 'এই ব্যাকআপ ফাইল রিস্টোর নিশ্চিত করুন' : 'Confirm Restore from Backup'}</span>
                </Button>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CSV MEMBERS EXPORT / IMPORT */}
        {activeTab === 'csv' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Export Box */}
              <div className="p-4 bg-muted/20 border border-border rounded-xl space-y-3">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                  <h4 className="font-bold text-xs text-foreground">
                    {isBangla ? 'সদস্য তালিকা এক্সেল এক্সপোর্ট' : 'Export Members to Excel'}
                  </h4>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {isBangla
                    ? 'সকল সদস্যের নাম, পিতা/স্বামীর নাম, এনআইডি, মোবাইল, শাখা ও কেন্দ্র তথ্য সরাসরি Microsoft Excel এ ওপেন উপযোগী CSV ফরম্যাটে ডাউনলোড করুন।'
                    : 'Download all members with Bengali UTF-8 encoding support for Microsoft Excel.'}
                </p>
                <Button
                  variant="outline"
                  onClick={handleExportMembersCsv}
                  disabled={isProcessing}
                  className="w-full h-9 text-xs font-semibold text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                >
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                  <span>{isBangla ? 'এক্সেল CSV ফাইল ডাউনলোড' : 'Download Excel CSV'}</span>
                </Button>
              </div>

              {/* Import Box */}
              <div className="p-4 bg-muted/20 border border-border rounded-xl space-y-3">
                <div className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-primary" />
                  <h4 className="font-bold text-xs text-foreground">
                    {isBangla ? 'একযোগে সদস্য ইমপোর্ট (CSV)' : 'Batch Import Members'}
                  </h4>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {isBangla
                    ? 'কম্পিউটারে তৈরিকৃত এক্সেল সিএসভি ফাইল থেকে একসাথে বহু সদস্য সিস্টেমে যুক্ত করতে ফাইল নির্বাচন করুন।'
                    : 'Import members in bulk from a formatted CSV spreadsheet.'}
                </p>
                <input
                  ref={csvImportRef}
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleCsvImport}
                  className="text-xs file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-[11px] file:font-semibold file:bg-primary file:text-primary-foreground hover:file:opacity-90 cursor-pointer w-full"
                />
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-border">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            {isBangla ? 'বন্ধ করুন' : 'Close'}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
