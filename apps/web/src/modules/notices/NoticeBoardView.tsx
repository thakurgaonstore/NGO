import React, { useState } from 'react';
import { useI18n } from '../../core/i18n/I18nContext';
import { formatDate } from '@ngo-erp/shared';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Bell, Plus, Pin, Calendar } from 'lucide-react';

export interface NoticeItem {
  id: string;
  titleEn: string;
  titleBn: string;
  bodyEn: string;
  bodyBn: string;
  publishedDate: string;
  priority: 'urgent' | 'normal';
  isPinned?: boolean;
}

const INITIAL_NOTICES: NoticeItem[] = [
  {
    id: 'not-01',
    titleEn: 'Monthly Staff General Meeting & Field Review',
    titleBn: 'মাসিক কর্মকর্তা-কর্মচারী সমন্বয় সভা ও মাঠ পর্যালোচনা',
    bodyEn: 'All branch managers and field supervisors are requested to attend the upcoming monthly review meeting at the Head Office on 25 October 2026 at 10:00 AM.',
    bodyBn: 'সকল শাখা ব্যবস্থাপক ও ফিল্ড সুপারভাইজারদের আগামী ২৫ অক্টোবর ২০২৬ সকাল ১০টায় প্রধান কার্যালয়ে উপস্থিত থাকার জন্য অনুরোধ করা হচ্ছে।',
    publishedDate: '2026-10-16',
    priority: 'urgent',
    isPinned: true
  },
  {
    id: 'not-02',
    titleEn: 'Emergency Cyclone & Flood Readiness in Coastal Branches',
    titleBn: 'উপকূলীয় শাখাসমূহে সম্ভাব্য ঘূর্ণিঝড় ও বন্যা পূর্বপ্রস্তুতি',
    bodyEn: 'Branches in Chattogram and Cox\'s Bazar divisions are advised to safeguard relief inventory and ensure dry food stock readiness.',
    bodyBn: 'চট্টগ্রাম ও কক্সবাজার অঞ্চলের শাখাসমূহকে ত্রাণ সামগ্রী সুরক্ষিত রাখা ও জরুরি প্রস্তুতি গ্রহণের নির্দেশ দেওয়া হলো।',
    publishedDate: '2026-10-14',
    priority: 'normal'
  }
];

export const NoticeBoardView: React.FC = () => {
  const { isBangla } = useI18n();
  const [notices] = useState<NoticeItem[]>(INITIAL_NOTICES);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            <span>{isBangla ? 'নোটিশ বোর্ড ও অভ্যন্তরীণ যোগাযোগ' : 'Notice Board & Internal Notices'}</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isBangla
              ? 'অফিস আদেশ, সমন্বয় সভা এবং জরুরি বার্তা প্রচার।'
              : 'Internal announcements, office orders, and urgent field communications.'}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {notices.map((n) => (
          <Card key={n.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {n.isPinned && (
                    <Badge variant="default" className="text-[10px] gap-1">
                      <Pin className="w-2.5 h-2.5" /> Pinned
                    </Badge>
                  )}
                  {n.priority === 'urgent' && (
                    <Badge variant="destructive" className="text-[10px]">
                      Urgent
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground font-mono flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(n.publishedDate)}
                  </span>
                </div>
              </div>
              <CardTitle className="text-base font-bold mt-2">
                {isBangla ? n.titleBn : n.titleEn}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2 text-xs text-foreground/90 leading-relaxed">
              <p>{isBangla ? n.bodyBn : n.bodyEn}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
