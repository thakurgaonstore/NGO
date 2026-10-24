import React, { useState } from 'react';
import { useI18n } from '../../core/i18n/I18nContext';
import { useTenant } from '../../core/tenant/TenantContext';
import { formatDate, toBanglaDigits } from '@ngo-erp/shared';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { ShieldCheck, History, Search } from 'lucide-react';
import { Input } from '../../components/ui/input';

export interface AuditLogItem {
  id: string;
  action: string;
  entity: string;
  userEmail: string;
  userName: string;
  timestamp: number;
  details: string;
  ipAddress?: string;
}

const INITIAL_LOGS: AuditLogItem[] = [
  {
    id: 'log-01',
    action: 'CREATE',
    entity: 'voucher',
    userEmail: 'accounts@sheba-bd.org',
    userName: 'Sadia Sultana',
    timestamp: Date.now() - 3600000,
    details: 'Created Bank Payment Voucher BP-2026-0042 (Amount: ৳ 45,000)'
  },
  {
    id: 'log-02',
    action: 'APPROVE',
    entity: 'voucher',
    userEmail: 'manager@sheba-bd.org',
    userName: 'Farhana Yasmin',
    timestamp: Date.now() - 7200000,
    details: 'Approved Cash Receipt Voucher CR-2026-0019 (Amount: ৳ 12,500)'
  },
  {
    id: 'log-03',
    action: 'REGISTER',
    entity: 'member',
    userEmail: 'officer@sheba-bd.org',
    userName: 'Md. Tariqul Islam',
    timestamp: Date.now() - 14400000,
    details: 'Registered new beneficiary: Rahima Begum (MEM-2026-0142)'
  },
  {
    id: 'log-04',
    action: 'UPDATE',
    entity: 'settings',
    userEmail: 'director@sheba-bd.org',
    userName: 'Dr. Aminul Islam',
    timestamp: Date.now() - 86400000,
    details: 'Updated BulkSMSBD API credentials'
  }
];

export const AuditLogsView: React.FC = () => {
  const { isBangla } = useI18n();
  const [query, setQuery] = useState<string>('');
  const [logs] = useState<AuditLogItem[]>(INITIAL_LOGS);

  const filtered = logs.filter(
    (l) =>
      l.details.toLowerCase().includes(query.toLowerCase()) ||
      l.userEmail.toLowerCase().includes(query.toLowerCase()) ||
      l.action.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">
            {isBangla ? 'সিস্টেম অডিট লগ ও সিকিউরিটি ট্রেইল' : 'System Audit Log & Security Trail'}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isBangla
              ? 'কে, কখন, কোন রেকর্ড তৈরি, সম্পাদনা বা অনুমোদন করেছেন তার অপরিবর্তনীয় লগ।'
              : 'Immutable audit trail capturing all system events, approvals, and financial transactions.'}
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={isBangla ? 'অডিট লগ খুঁজুন...' : 'Search logs...'}
            className="pl-9 h-9 text-xs"
          />
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-sm font-semibold flex items-center justify-between">
            <span className="flex items-center gap-2">
              <History className="w-4 h-4 text-primary" />
              <span>{isBangla ? 'সাম্প্রতিক অডিট রেকর্ড' : 'Recent Audit Events'}</span>
            </span>
            <Badge variant="success" className="text-xs">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
              {isBangla ? 'অপরিবর্তনীয় সিকিউরিটি সক্রিয়' : 'Immutable Store Active'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{isBangla ? 'তারিখ ও সময়' : 'Timestamp'}</TableHead>
                <TableHead>{isBangla ? 'অ্যাকশন' : 'Action'}</TableHead>
                <TableHead>{isBangla ? 'ব্যবহারকারী' : 'User'}</TableHead>
                <TableHead>{isBangla ? 'বিস্তারিত বিবরণ' : 'Details'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-xs font-mono text-muted-foreground whitespace-nowrap">
                    {formatDate(log.timestamp)} {new Date(log.timestamp).toLocaleTimeString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={log.action === 'APPROVE' ? 'success' : 'outline'} className="text-[10px] font-bold">
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">
                    <div className="font-semibold">{log.userName}</div>
                    <div className="text-muted-foreground text-[11px] font-mono">{log.userEmail}</div>
                  </TableCell>
                  <TableCell className="text-xs text-foreground font-medium">{log.details}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
