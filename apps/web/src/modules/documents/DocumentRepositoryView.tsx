import React, { useState } from 'react';
import { useI18n } from '../../core/i18n/I18nContext';
import { formatDate } from '@ngo-erp/shared';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../components/ui/table';
import { Folder, FileText, UploadCloud, AlertCircle, Calendar, Download } from 'lucide-react';

export interface DocumentItem {
  id: string;
  title: string;
  category: 'legal' | 'mou' | 'audit' | 'policies';
  fileType: string;
  size: string;
  expiryDate?: string;
  isExpiringSoon?: boolean;
}

const INITIAL_DOCS: DocumentItem[] = [
  {
    id: 'doc-01',
    title: 'NGO Affairs Bureau (NGOAB) Registration Certificate',
    category: 'legal',
    fileType: 'PDF',
    size: '2.4 MB',
    expiryDate: '2027-06-30'
  },
  {
    id: 'doc-02',
    title: 'Department of Social Services (DSS) License Renewal',
    category: 'legal',
    fileType: 'PDF',
    size: '1.8 MB',
    expiryDate: '2026-11-15',
    isExpiringSoon: true
  },
  {
    id: 'doc-03',
    title: 'UNICEF Grant Agreement & Logframe (WASH 2026)',
    category: 'mou',
    fileType: 'PDF',
    size: '4.2 MB',
    expiryDate: '2026-12-31'
  },
  {
    id: 'doc-04',
    title: 'Chartered Accountants Annual External Audit Report (FY 2024-25)',
    category: 'audit',
    fileType: 'PDF',
    size: '5.6 MB'
  }
];

export const DocumentRepositoryView: React.FC = () => {
  const { isBangla } = useI18n();
  const [docs] = useState<DocumentItem[]>(INITIAL_DOCS);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Folder className="w-5 h-5 text-primary" />
            <span>{isBangla ? 'ডকুমেন্ট আর্কাইভ ও লাইসেন্স ট্র্যাকিং' : 'Document Repository & License Expiry'}</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isBangla
              ? 'আইনি নিবন্ধন, এনজিও বিষয়ক ব্যুরো লাইসেন্স, দাতা এমওইউ এবং বার্ষিক অডিট রিপোর্ট।'
              : 'Secure repository for legal certifications, donor MOUs, and audit compliance.'}
          </p>
        </div>

        <Button onClick={() => alert(isBangla ? 'ক্লাউডিনারি আপলোড ডায়ালগ...' : 'Upload document dialog')} className="text-xs h-9">
          <UploadCloud className="w-4 h-4 mr-1.5" />
          {isBangla ? 'ডকুমেন্ট আপলোড' : 'Upload Document'}
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{isBangla ? 'ডকুমেন্টের নাম' : 'Document Name'}</TableHead>
                <TableHead>{isBangla ? 'ক্যাটাগরি' : 'Category'}</TableHead>
                <TableHead>{isBangla ? 'ফাইলের ধরণ ও সাইজ' : 'Type & Size'}</TableHead>
                <TableHead>{isBangla ? 'মেয়াদ উত্তীর্ণের তারিখ' : 'Expiry Date'}</TableHead>
                <TableHead className="text-right">{isBangla ? 'ডাউনলোড' : 'Download'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {docs.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-primary shrink-0" />
                      <div>
                        <div className="font-semibold text-xs text-foreground">{doc.title}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">{doc.id}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] uppercase font-mono">
                      {doc.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs font-mono text-muted-foreground">
                    {doc.fileType} • {doc.size}
                  </TableCell>
                  <TableCell className="text-xs">
                    {doc.expiryDate ? (
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono">{formatDate(doc.expiryDate)}</span>
                        {doc.isExpiringSoon && (
                          <Badge variant="destructive" className="text-[9px]">
                            {isBangla ? 'দ্রুত নবায়ন করুন' : 'Expiring Soon'}
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground italic">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => alert('Downloading secure document from Cloudinary...')}
                      className="h-7 text-xs px-2"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
