import React, { useState } from 'react';
import { useI18n } from '../../core/i18n/I18nContext';
import { useTenant } from '../../core/tenant/TenantContext';
import { RoleDefinition, DEFAULT_TENANT_ROLES, ERP_MODULES } from '@ngo-erp/shared';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Dialog } from '../../components/ui/dialog';
import { ShieldCheck, Plus, Check, Lock } from 'lucide-react';

export const RolesManagementView: React.FC = () => {
  const { isBangla } = useI18n();
  const { tenant } = useTenant();
  const [roles, setRoles] = useState<RoleDefinition[]>(() => {
    const saved = localStorage.getItem(`ngo_roles_${tenant?.id}`);
    return saved ? JSON.parse(saved) : DEFAULT_TENANT_ROLES;
  });

  const [isBuilderOpen, setIsBuilderOpen] = useState<boolean>(false);
  const [roleNameEn, setRoleNameEn] = useState<string>('');
  const [roleNameBn, setRoleNameBn] = useState<string>('');
  const [roleDesc, setRoleDesc] = useState<string>('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([
    'members:view',
    'members:create',
    'projects:view',
    'field_ops:view'
  ]);

  const handleTogglePermission = (perm: string) => {
    if (selectedPermissions.includes(perm)) {
      setSelectedPermissions(selectedPermissions.filter((p) => p !== perm));
    } else {
      setSelectedPermissions([...selectedPermissions, perm]);
    }
  };

  const handleSaveRole = () => {
    if (!roleNameEn) return;
    const newRole: RoleDefinition = {
      id: `custom_${Date.now()}`,
      name: { en: roleNameEn, bn: roleNameBn || roleNameEn },
      description: { en: roleDesc, bn: roleDesc },
      permissions: selectedPermissions,
      isSystem: false
    };
    const updated = [...roles, newRole];
    setRoles(updated);
    localStorage.setItem(`ngo_roles_${tenant?.id}`, JSON.stringify(updated));
    setIsBuilderOpen(false);
    setRoleNameEn('');
    setRoleNameBn('');
    setRoleDesc('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">
            {isBangla ? 'ভূমিকা ও পারমিশন ম্যাট্রিক্স (RBAC)' : 'Roles & Permissions (RBAC)'}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isBangla
              ? 'সিস্টেমের ডিফল্ট ভূমিকা এবং কাস্টম অ্যাক্সেস পারমিশন পলিসি ব্যবস্থাপনা।'
              : 'Configure system roles and granular action permissions per module.'}
          </p>
        </div>

        <Button onClick={() => setIsBuilderOpen(true)} className="text-xs h-9">
          <Plus className="w-4 h-4 mr-1.5" />
          {isBangla ? 'কাস্টম রোল তৈরি করুন' : 'Create Custom Role'}
        </Button>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {roles.map((r) => (
          <Card key={r.id} className="relative hover:shadow-md transition-shadow">
            <CardHeader className="pb-3 border-b">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    <CardTitle className="text-sm font-bold">
                      {isBangla ? r.name.bn : r.name.en}
                    </CardTitle>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isBangla ? r.description.bn : r.description.en}
                  </p>
                </div>
                {r.isSystem && (
                  <Badge variant="secondary" className="text-[10px] flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" />
                    System
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-3">
              <span className="text-[11px] font-semibold text-muted-foreground block mb-2">
                {isBangla ? 'অনুমোদিত পারমিশনসমূহ:' : 'Allowed Permissions:'}
              </span>
              <div className="flex flex-wrap gap-1">
                {r.permissions.includes('*') ? (
                  <Badge variant="success" className="text-[10px]">
                    {isBangla ? 'সকল মডিউলে পূর্ণ নিয়ন্ত্রণ (*)' : 'Full Root Access (*)'}
                  </Badge>
                ) : (
                  r.permissions.map((p) => (
                    <Badge key={p} variant="outline" className="text-[10px] font-mono">
                      {p}
                    </Badge>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Custom Role Builder Modal */}
      <Dialog
        isOpen={isBuilderOpen}
        onClose={() => setIsBuilderOpen(false)}
        title={isBangla ? 'নতুন কাস্টম রোল তৈরি করুন' : 'Custom Role Builder'}
        maxWidth="xl"
      >
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">{isBangla ? 'রোলের নাম (ইংরেজি) *' : 'Role Name (English) *'}</label>
              <Input value={roleNameEn} onChange={(e) => setRoleNameEn(e.target.value)} placeholder="e.g. Area Supervisor" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">{isBangla ? 'রোলের নাম (বাংলা)' : 'Role Name (Bangla)'}</label>
              <Input value={roleNameBn} onChange={(e) => setRoleNameBn(e.target.value)} placeholder="যেমন: এলাকা সুপারভাইজার" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground">{isBangla ? 'সংক্ষিপ্ত বিবরণ' : 'Description'}</label>
            <Input value={roleDesc} onChange={(e) => setRoleDesc(e.target.value)} placeholder="e.g. Supervises field surveys and collections in assigned upazilas" />
          </div>

          <div className="pt-2">
            <label className="text-xs font-semibold text-muted-foreground block mb-2">
              {isBangla ? 'মডিউলভিত্তিক অ্যাকশন নির্বাচন করুন:' : 'Select Module Action Permissions:'}
            </label>
            <div className="border rounded-lg max-h-60 overflow-y-auto p-3 space-y-3 bg-card">
              {ERP_MODULES.map((m) => (
                <div key={m.id} className="border-b pb-2 last:border-0 last:pb-0">
                  <div className="text-xs font-bold text-primary mb-1.5 flex items-center justify-between">
                    <span>{isBangla ? m.name.bn : m.name.en}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">({m.id})</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {m.permissions.map((action) => {
                      const permKey = `${m.id}:${action.action}`;
                      const isChecked = selectedPermissions.includes(permKey);
                      return (
                        <label
                          key={permKey}
                          className={`flex items-center gap-1.5 px-2 py-1 rounded text-[11px] border cursor-pointer select-none transition-all ${
                            isChecked ? 'bg-primary/10 border-primary text-primary font-semibold' : 'bg-muted/30 border-border text-muted-foreground'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleTogglePermission(permKey)}
                            className="rounded text-primary h-3 w-3"
                          />
                          <span>{isBangla ? action.name.bn : action.name.en}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button variant="outline" onClick={() => setIsBuilderOpen(false)} className="text-xs">
              {isBangla ? 'বাতিল' : 'Cancel'}
            </Button>
            <Button onClick={handleSaveRole} className="text-xs">
              <Check className="w-4 h-4 mr-1.5" />
              {isBangla ? 'রোল তৈরি সম্পন্ন করুন' : 'Save Custom Role'}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
