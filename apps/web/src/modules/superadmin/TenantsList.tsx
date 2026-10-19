import React, { useState } from 'react';
import { useI18n } from '../../core/i18n/I18nContext';
import { useTenant } from '../../core/tenant/TenantContext';
import { Tenant, DeploymentMode, toBanglaDigits, formatDate } from '@ngo-erp/shared';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../components/ui/table';
import { Dialog } from '../../components/ui/dialog';
import { TenantProvisioningWizard } from './TenantProvisioningWizard';
import { cascadeDeleteTenant } from '../../core/tenant/tenantCleanupService';
import {
  Plus,
  Search,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  UserCog,
  Trash2,
  Edit,
  Database,
  Building2,
  Check,
  Key,
  Server,
  AlertTriangle,
  Loader2
} from 'lucide-react';

interface TenantsListProps {
  tenants: Tenant[];
  onRefresh: () => void;
  onImpersonate: (tenantId: string) => void;
  onToggleStatus: (tenantId: string, currentStatus: string) => void;
  onDeleteTenant?: (tenantId: string) => void;
}

export const TenantsList: React.FC<TenantsListProps> = ({
  tenants,
  onRefresh,
  onImpersonate,
  onToggleStatus,
  onDeleteTenant
}) => {
  const { isBangla, t } = useI18n();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isWizardOpen, setIsWizardOpen] = useState<boolean>(false);

  // Cascade Delete State
  const [deletingTenant, setDeletingTenant] = useState<Tenant | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleteProgress, setDeleteProgress] = useState<string>('');
  const [confirmText, setConfirmText] = useState<string>('');

  const handleExecuteDelete = async () => {
    if (!deletingTenant) return;
    setIsDeleting(true);
    setDeleteProgress(isBangla ? 'ক্যাশিং ও ডাটাবেস স্ক্যান করা হচ্ছে...' : 'Scanning database and local storage...');

    try {
      const result = await cascadeDeleteTenant(deletingTenant, (p) => {
        setDeleteProgress(p.step);
      });
      setIsDeleting(false);
      setDeletingTenant(null);
      setConfirmText('');
      onRefresh();
      alert(result.message);
    } catch (err: any) {
      setIsDeleting(false);
      alert('Deletion error: ' + (err.message || 'Failed'));
    }
  };

  // Edit Tenant Modal State
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [editNameEn, setEditNameEn] = useState<string>('');
  const [editNameBn, setEditNameBn] = useState<string>('');
  const [editDomain, setEditDomain] = useState<string>('');
  const [editPlanId, setEditPlanId] = useState<string>('growth');
  const [editStatus, setEditStatus] = useState<Tenant['status']>('active');
  const [editMode, setEditMode] = useState<DeploymentMode>('MODE_A');
  const [editDefaultPass, setEditDefaultPass] = useState<string>('NgoPass2026!');
  const [editFirebaseJson, setEditFirebaseJson] = useState<string>('');
  const [editOwnerMobile, setEditOwnerMobile] = useState<string>('01712-345678');
  const [editOwnerEmail, setEditOwnerEmail] = useState<string>('');

  const openEditModal = (t: Tenant) => {
    setEditingTenant(t);
    setEditNameEn(t.name.en);
    setEditNameBn(t.name.bn);
    setEditDomain(t.domain || '');
    setEditPlanId(t.planId);
    setEditStatus(t.status);
    setEditMode(t.deploymentMode);
    setEditOwnerEmail(t.ownerEmail);
    setEditOwnerMobile('01712-345678');
    setEditDefaultPass('NgoPass2026!');
    setEditFirebaseJson(
      t.firebaseConfig
        ? JSON.stringify(t.firebaseConfig, null, 2)
        : JSON.stringify(
            {
              apiKey: 'AIzaSyClientCustomKey...',
              authDomain: `${t.subdomain}.firebaseapp.com`,
              projectId: `${t.subdomain}-dedicated-project`,
              appId: '1:123456:web:custom'
            },
            null,
            2
          )
    );
  };

  const handleSaveTenantEdit = () => {
    if (!editingTenant) return;

    let parsedConfig = undefined;
    if (editMode === 'MODE_B') {
      try {
        parsedConfig = JSON.parse(editFirebaseJson);
      } catch {
        alert('Invalid Firebase Config JSON');
        return;
      }
    }

    const updatedTenant: Tenant = {
      ...editingTenant,
      name: { en: editNameEn, bn: editNameBn },
      domain: editDomain || undefined,
      planId: editPlanId,
      status: editStatus,
      deploymentMode: editMode,
      firebaseConfig: parsedConfig,
      ownerEmail: editOwnerEmail,
      updatedAt: Date.now()
    };

    const saved = JSON.parse(localStorage.getItem('ngo_registered_tenants') || '[]');
    const newTenants = saved.map((t: any) => (t.id === editingTenant.id ? updatedTenant : t));
    localStorage.setItem('ngo_registered_tenants', JSON.stringify(newTenants));

    // Update domain directory mapping
    const dir = JSON.parse(localStorage.getItem('ngo_tenant_directory_cache') || '{}');
    if (editDomain) {
      dir[editDomain] = editingTenant.id;
    }
    localStorage.setItem('ngo_tenant_directory_cache', JSON.stringify(dir));

    setEditingTenant(null);
    onRefresh();
  };

  const filteredTenants = tenants.filter((tenant) => {
    const matchesSearch =
      tenant.name.en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.name.bn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.clientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.subdomain.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || tenant.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={isBangla ? 'এনজিওর নাম, সাব-ডোমেইন বা কোড খুঁজুন...' : 'Search by name, subdomain, code...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 text-xs rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">{isBangla ? 'সকল অবস্থা' : 'All Statuses'}</option>
            <option value="active">{isBangla ? 'সক্রিয়' : 'Active'}</option>
            <option value="trial">{isBangla ? 'ট্রায়াল' : 'Trial'}</option>
            <option value="suspended">{isBangla ? 'স্থগিত' : 'Suspended'}</option>
            <option value="expired">{isBangla ? 'মেয়াদোত্তীর্ণ' : 'Expired'}</option>
          </select>
        </div>

        <Button onClick={() => setIsWizardOpen(true)} className="w-full sm:w-auto h-9 text-xs">
          <Plus className="w-4 h-4 mr-1.5" />
          {isBangla ? 'নতুন এনজিও প্রভিশন করুন' : 'Provision New NGO'}
        </Button>
      </div>

      {/* Tenants Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{isBangla ? 'ক্লায়েন্ট কোড' : 'Code'}</TableHead>
            <TableHead>{isBangla ? 'এনজিওর নাম' : 'Organization Name'}</TableHead>
            <TableHead>{isBangla ? 'ডোমেইন ও মোড' : 'Domain & Mode'}</TableHead>
            <TableHead>{isBangla ? 'প্যাকেজ' : 'Plan'}</TableHead>
            <TableHead>{isBangla ? 'কোটা ব্যবহার' : 'Spark Reads'}</TableHead>
            <TableHead>{isBangla ? 'অবস্থা' : 'Status'}</TableHead>
            <TableHead className="text-right">{isBangla ? 'অ্যাকশন' : 'Actions'}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredTenants.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                <Building2 className="w-8 h-8 mx-auto mb-2 opacity-40" />
                {isBangla ? 'কোনো টেন্যান্ট পাওয়া যায়নি' : 'No tenants found matching criteria'}
              </TableCell>
            </TableRow>
          ) : (
            filteredTenants.map((tenant) => {
              const statusVariant =
                tenant.status === 'active'
                  ? 'success'
                  : tenant.status === 'trial'
                  ? 'warning'
                  : 'destructive';

              return (
                <TableRow key={tenant.id}>
                  <TableCell className="font-mono font-bold text-xs text-primary">
                    {tenant.clientId}
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-sm">
                      {isBangla ? tenant.name.bn : tenant.name.en}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {tenant.ownerEmail}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-mono text-xs flex items-center gap-1 text-muted-foreground">
                      <span>{tenant.subdomain}.ngoerp.xyz</span>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Badge
                        variant={tenant.deploymentMode === 'MODE_B' ? 'success' : 'secondary'}
                        className="text-[9px]"
                      >
                        {tenant.deploymentMode === 'MODE_B' ? 'Mode B (Dedicated Firebase)' : 'Mode A (Shared)'}
                      </Badge>
                      {tenant.domain && (
                        <span className="text-[10px] text-primary font-mono flex items-center gap-0.5">
                          <ExternalLink className="w-2.5 h-2.5" />
                          {tenant.domain}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] uppercase font-bold">
                      {tenant.planId}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs font-mono">
                      {isBangla
                        ? `${toBanglaDigits(tenant.quotas?.estimatedDailyReads || 120)}/৫০K`
                        : `${tenant.quotas?.estimatedDailyReads || 120}/50K`}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant} className="capitalize text-[11px]">
                      {isBangla
                        ? tenant.status === 'active'
                          ? 'সক্রিয়'
                          : tenant.status === 'trial'
                          ? 'ট্রায়াল'
                          : 'স্থগিত'
                        : tenant.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {/* Impersonate Button */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onImpersonate(tenant.id)}
                        className="h-7 text-xs px-2 text-primary hover:bg-primary/10"
                        title={isBangla ? 'ছদ্মবেশে লগইন করুন' : 'Login-as tenant admin'}
                      >
                        <UserCog className="w-3.5 h-3.5 mr-1" />
                        {isBangla ? 'লগইন' : 'Impersonate'}
                      </Button>

                      {/* Edit Button */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditModal(tenant)}
                        className="h-7 px-2 text-xs text-sky-600 hover:bg-sky-500/10"
                        title="Edit NGO Info & Firebase Config"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Button>

                      {/* Suspend / Reactivate */}
                      <Button
                        size="sm"
                        variant={tenant.status === 'active' ? 'ghost' : 'outline'}
                        onClick={() => onToggleStatus(tenant.id, tenant.status)}
                        className={`h-7 px-2 text-xs ${
                          tenant.status === 'active'
                            ? 'text-amber-600 hover:bg-amber-500/10'
                            : 'text-emerald-600 hover:bg-emerald-500/10'
                        }`}
                        title={tenant.status === 'active' ? 'Suspend Tenant' : 'Reactivate Tenant'}
                      >
                        {tenant.status === 'active' ? (
                          <ShieldAlert className="w-3.5 h-3.5" />
                        ) : (
                          <ShieldCheck className="w-3.5 h-3.5" />
                        )}
                      </Button>

                      {/* Delete */}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setDeletingTenant(tenant);
                          setConfirmText('');
                        }}
                        className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10"
                        title={isBangla ? 'এনজিও ও সমস্ত ডাটা স্থায়ীভাবে ডিলিট করুন' : 'Delete tenant and wipe all data'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {/* Edit Tenant Modal Dialog */}
      {editingTenant && (
        <Dialog
          isOpen={!!editingTenant}
          onClose={() => setEditingTenant(null)}
          title={
            <div className="flex items-center gap-2">
              <Edit className="w-4 h-4 text-primary" />
              <span>{isBangla ? `এনজিও তথ্য সম্পাদনা: ${editingTenant.name.bn}` : `Edit NGO: ${editingTenant.name.en}`}</span>
            </div>
          }
          description={
            isBangla
              ? 'এনজিওর নাম, ডোমেইন, মোড বি ফায়ারবেস কনফিগ এবং ডিফল্ট পাসওয়ার্ড আপডেট করুন।'
              : 'Update NGO information, custom domain, Mode B Firebase config, and default credentials.'
          }
          maxWidth="xl"
        >
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">{isBangla ? 'এনজিওর নাম (ইংরেজি) *' : 'Name (English) *'}</label>
                <Input value={editNameEn} onChange={(e) => setEditNameEn(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">{isBangla ? 'এনজিওর নাম (বাংলা) *' : 'Name (Bangla) *'}</label>
                <Input value={editNameBn} onChange={(e) => setEditNameBn(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">{isBangla ? 'কাস্টম ডোমেইন (ঐচ্ছিক)' : 'Custom Domain (Optional)'}</label>
                <Input value={editDomain} onChange={(e) => setEditDomain(e.target.value)} placeholder="e.g. www.jagoranibd.org" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">{isBangla ? 'সাবস্ক্রিপশন প্যাকেজ' : 'Plan'}</label>
                <select
                  value={editPlanId}
                  onChange={(e) => setEditPlanId(e.target.value)}
                  className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs"
                >
                  <option value="starter">Starter NGO</option>
                  <option value="growth">Standard NGO</option>
                  <option value="enterprise">Enterprise / Microfinance</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">{isBangla ? 'অ্যাকাউন্ট স্ট্যাটাস' : 'Status'}</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as any)}
                  className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs"
                >
                  <option value="active">Active (সক্রিয়)</option>
                  <option value="trial">Trial (ট্রায়াল)</option>
                  <option value="suspended">Suspended (স্থগিত)</option>
                  <option value="expired">Expired (মেয়াদোত্তীর্ণ)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">{isBangla ? 'ক্লাউড ডেপ্লয়মেন্ট মোড' : 'Deployment Mode'}</label>
                <select
                  value={editMode}
                  onChange={(e) => setEditMode(e.target.value as any)}
                  className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs"
                >
                  <option value="MODE_A">Mode A (Shared Platform Spark)</option>
                  <option value="MODE_B">Mode B (Tenant-Dedicated Firebase)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">{isBangla ? 'ডিফল্ট লগইন পাসওয়ার্ড' : 'Initial Default Password'}</label>
                <Input value={editDefaultPass} onChange={(e) => setEditDefaultPass(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">{isBangla ? 'মালিকের ইমেইল' : 'Owner Email'}</label>
                <Input value={editOwnerEmail} onChange={(e) => setEditOwnerEmail(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">{isBangla ? 'মালিকের মোবাইল' : 'Owner Mobile'}</label>
                <Input value={editOwnerMobile} onChange={(e) => setEditOwnerMobile(e.target.value)} />
              </div>
            </div>

            {/* Mode B: Firebase Config Editor */}
            {editMode === 'MODE_B' && (
              <div className="p-3 rounded-lg border bg-muted/40 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                  <Server className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isBangla ? 'এনজিওর নিজস্ব ফায়ারবেস কনফিগ (JSON) পেস্ট করুন:' : 'Paste Tenant Dedicated Firebase Config (JSON):'}</span>
                </div>
                <textarea
                  rows={5}
                  value={editFirebaseJson}
                  onChange={(e) => setEditFirebaseJson(e.target.value)}
                  className="w-full text-xs font-mono p-2.5 rounded border bg-card focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <span className="text-[10px] text-muted-foreground">
                  {isBangla
                    ? 'এনজিও তাদের নিজস্ব গুগল কনসোল থেকে প্রজেক্ট খুলে Web App Config এখানে প্রদান করবে।'
                    : 'Paste the firebaseConfig object from the tenant\'s Google Firebase Console.'}
                </span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button variant="outline" onClick={() => setEditingTenant(null)} className="text-xs">
                {isBangla ? 'বাতিল' : 'Cancel'}
              </Button>
              <Button onClick={handleSaveTenantEdit} className="text-xs">
                <Check className="w-4 h-4 mr-1.5" />
                {isBangla ? 'পরিবর্তন সংরক্ষণ করুন' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </Dialog>
      )}

      {/* Provisioning Wizard Modal Dialog */}
      <Dialog
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        title={isBangla ? 'নতুন এনজিও প্রভিশনিং উইজার্ড' : 'NGO Tenant Provisioning Wizard'}
        description={
          isBangla
            ? 'মাত্র ৩ মিনিটে সম্পূর্ণ মাল্টি-টেন্যান্ট এনজিও ইআরপি ও ওয়েবসাইট তৈরি করুন।'
            : 'Provision an isolated multi-tenant NGO ERP workspace & public website in minutes.'
        }
        maxWidth="2xl"
      >
        <TenantProvisioningWizard
          onSuccess={(newId) => {
            setIsWizardOpen(false);
            onRefresh();
          }}
          onCancel={() => setIsWizardOpen(false)}
        />
      </Dialog>

      {/* Cascade Delete Confirmation Modal Dialog */}
      {deletingTenant && (
        <Dialog
          isOpen={!!deletingTenant}
          onClose={() => {
            if (!isDeleting) {
              setDeletingTenant(null);
              setConfirmText('');
            }
          }}
          title={
            <div className="flex items-center gap-2 text-destructive font-bold">
              <AlertTriangle className="w-5 h-5 text-destructive animate-pulse" />
              <span>
                {isBangla
                  ? `সতর্কতা: '${deletingTenant.name.bn || deletingTenant.name.en}' চিরতরে মুছে ফেলা`
                  : `Permanent Delete: '${deletingTenant.name.en}'`}
              </span>
            </div>
          }
          description={
            isBangla
              ? 'এটি একটি স্থায়ী অ্যাকশন। এই এনজিও ও এর সম্পর্কিত সমস্ত ক্লাউড ডাটাবেস রেকর্ড চিরতরে মুছে যাবে।'
              : 'This action is irreversible. The NGO and all of its cloud database records will be permanently purged.'
          }
          maxWidth="lg"
        >
          <div className="space-y-4 pt-2">
            {/* Target NGO Quick Summary */}
            <div className="p-3.5 rounded-lg border bg-destructive/5 border-destructive/20 flex items-center justify-between">
              <div>
                <div className="font-bold text-sm text-foreground">
                  {deletingTenant.name.bn} ({deletingTenant.name.en})
                </div>
                <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                  <span>ক্লায়েন্ট কোড: <strong className="font-mono text-foreground">{deletingTenant.clientId}</strong></span>
                  <span>•</span>
                  <span>সাব-ডোমেইন: <span className="font-mono">{deletingTenant.subdomain}</span></span>
                </div>
              </div>
              <Badge variant="destructive" className="text-[11px] font-mono uppercase">
                {deletingTenant.deploymentMode}
              </Badge>
            </div>

            {/* What will be deleted breakdown */}
            <div className="p-3 rounded-lg border bg-muted/30 space-y-2 text-xs">
              <div className="font-semibold text-foreground flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                <Database className="w-4 h-4 text-amber-600" />
                <span>{isBangla ? 'যেসব ডাটাবেস রেকর্ড সম্পূর্ণ ধ্বংস করা হবে:' : 'The following database records will be wiped:'}</span>
              </div>
              <ul className="space-y-1.5 text-muted-foreground pl-1">
                <li className="flex items-start gap-1.5">
                  <span className="text-destructive font-bold">•</span>
                  <span><strong>সদস্য ও সমিতি:</strong> সকল মেম্বার প্রোফাইল, সঞ্চয় হিসাব, ভর্তি ফর্ম ও কেন্দ্র তালিকা।</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-destructive font-bold">•</span>
                  <span><strong>ঋণ ও কিস্তি:</strong> ঋণ বিতরণ ফাইল, সাপ্তাহিক/মাসিক কিস্তি শিডিউল ও আদায়ের তথ্য।</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-destructive font-bold">•</span>
                  <span><strong>অ্যাকাউন্টিং ও ভাউচার:</strong> ডেবিট/ক্রেডিট ভাউচার, ক্যাশ রিকনসিলিয়েশন ও আর্থিক লেজার।</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-destructive font-bold">•</span>
                  <span><strong>ইনভেন্টরি ও ওয়্যারহাউজ:</strong> মালামাল স্টক, ক্রয়-বিক্রয় ও শাখাভিত্তিক বিতরণ লগ।</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-destructive font-bold">•</span>
                  <span><strong>শাখা ও কর্মকর্তা:</strong> ফিল্ড অফিসার, ম্যানেজার একাউন্ট এবং লগইন ক্রেডেনশিয়াল।</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-destructive font-bold">•</span>
                  <span><strong>ক্লাউড ডাটাবেস:</strong> ফায়ারবেস (Firestore) কালেকশন ও সিস্টেম ডিরেক্টরি ইনডেক্স।</span>
                </li>
              </ul>
            </div>

            {/* Progress or confirmation input */}
            {isDeleting ? (
              <div className="p-4 rounded-lg border border-primary/30 bg-primary/5 text-center space-y-2 animate-in fade-in">
                <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
                <div className="text-xs font-semibold text-primary">{deleteProgress}</div>
                <div className="text-[11px] text-muted-foreground">অনুগ্রহ করে কয়েক সেকেন্ড অপেক্ষা করুন...</div>
              </div>
            ) : (
              <div className="space-y-2 pt-1">
                <label className="text-xs text-muted-foreground block">
                  নিশ্চিত করতে নিচে ক্লায়েন্ট কোড <strong className="font-mono text-destructive">{deletingTenant.clientId}</strong> লিখুন:
                </label>
                <Input
                  placeholder={deletingTenant.clientId}
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value.trim().toUpperCase())}
                  className="font-mono uppercase text-xs"
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button
                variant="outline"
                disabled={isDeleting}
                onClick={() => {
                  setDeletingTenant(null);
                  setConfirmText('');
                }}
                className="text-xs"
              >
                {isBangla ? 'বাতিল' : 'Cancel'}
              </Button>
              <Button
                variant="destructive"
                disabled={isDeleting || confirmText !== deletingTenant.clientId}
                onClick={handleExecuteDelete}
                className="text-xs font-bold"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                    {isBangla ? 'ডাটা মোছা হচ্ছে...' : 'Deleting...'}
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                    {isBangla ? 'হ্যাঁ, সমস্ত ডাটা চিরতরে মুছে ফেলুন' : 'Wipe NGO & All Data Permanently'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
};
