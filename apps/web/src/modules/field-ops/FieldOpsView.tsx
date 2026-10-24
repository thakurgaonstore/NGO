import React, { useState } from 'react';
import { useI18n } from '../../core/i18n/I18nContext';
import { useTenant } from '../../core/tenant/TenantContext';
import { useNetworkStatus } from '../../core/offline/useNetworkStatus';
import { SyncOutbox } from '../../core/offline/syncOutbox';
import { formatDate, toBanglaDigits } from '@ngo-erp/shared';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../components/ui/table';
import { Dialog } from '../../components/ui/dialog';
import {
  ClipboardList,
  Plus,
  Play,
  MapPin,
  Camera,
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle2,
  Clock,
  Sparkles,
  Check
} from 'lucide-react';

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'gps' | 'photo';
  required: boolean;
  options?: string[];
}

export interface DynamicForm {
  id: string;
  title: string;
  description: string;
  fields: FormField[];
  submissionsCount: number;
}

const INITIAL_FORMS: DynamicForm[] = [
  {
    id: 'form-01',
    title: 'WASH Baseline Household Survey',
    description: 'Field assessment of family access to deep tube-wells and hygienic sanitary latrines.',
    submissionsCount: 142,
    fields: [
      { id: 'f1', label: 'Household Head Name', type: 'text', required: true },
      { id: 'f2', label: 'Family Member Count', type: 'number', required: true },
      { id: 'f3', label: 'Primary Drinking Water Source', type: 'select', required: true, options: ['Deep Tube-well', 'Pond Sand Filter', 'Rainwater Harvesting', 'Unsafe River/Canal'] },
      { id: 'f4', label: 'GPS Location of Residence', type: 'gps', required: true },
      { id: 'f5', label: 'Latrine Inspection Photo', type: 'photo', required: false }
    ]
  },
  {
    id: 'form-02',
    title: 'Relief Distribution Verification & Signature',
    description: 'On-site beneficiary identity verification and receipt acknowledgment for emergency dry food packs.',
    submissionsCount: 89,
    fields: [
      { id: 'f1', label: 'Beneficiary Member Code', type: 'text', required: true },
      { id: 'f2', label: 'Items Received Package Qty', type: 'number', required: true },
      { id: 'f3', label: 'Delivery Location GPS', type: 'gps', required: true },
      { id: 'f4', label: 'Beneficiary Photo with Relief Package', type: 'photo', required: true }
    ]
  }
];

export const FieldOpsView: React.FC = () => {
  const { isBangla } = useI18n();
  const { tenant } = useTenant();
  const { isOnline, pendingSyncCount, isSyncing, syncNow } = useNetworkStatus();

  const [forms, setForms] = useState<DynamicForm[]>(() => {
    const saved = localStorage.getItem(`ngo_forms_${tenant?.id}`);
    return saved ? JSON.parse(saved) : INITIAL_FORMS;
  });

  // Designer state
  const [isDesignerOpen, setIsDesignerOpen] = useState<boolean>(false);
  const [designerTitle, setDesignerTitle] = useState<string>('');
  const [designerDesc, setDesignerDesc] = useState<string>('');
  const [designerFields, setDesignerFields] = useState<FormField[]>([
    { id: '1', label: 'Beneficiary Name', type: 'text', required: true },
    { id: '2', label: 'GPS Coordinates', type: 'gps', required: true }
  ]);

  // Runner state
  const [activeFormToRun, setActiveFormToRun] = useState<DynamicForm | null>(null);
  const [formAnswers, setFormAnswers] = useState<Record<string, any>>({});
  const [capturedGps, setCapturedGps] = useState<{ lat: number; lng: number } | null>(null);
  const [isCapturingGps, setIsCapturingGps] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  const handleCaptureGps = () => {
    setIsCapturingGps(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCapturedGps({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setIsCapturingGps(false);
        },
        () => {
          // Fallback mock GPS for desktop / privacy blocked
          setCapturedGps({ lat: 23.777176, lng: 90.399452 }); // Dhaka Coordinates
          setIsCapturingGps(false);
        }
      );
    } else {
      setCapturedGps({ lat: 23.777176, lng: 90.399452 });
      setIsCapturingGps(false);
    }
  };

  const handleSubmitFieldSurvey = () => {
    if (!activeFormToRun) return;

    // Enqueue to offline outbox with UUID idempotency key
    SyncOutbox.enqueue({
      id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      tenantId: tenant?.id || 'sheba-manobik',
      type: 'form_submission',
      payload: {
        formId: activeFormToRun.id,
        formTitle: activeFormToRun.title,
        answers: formAnswers,
        gps: capturedGps,
        submittedAt: Date.now()
      },
      createdAt: Date.now()
    });

    setSubmitSuccess(true);
    setTimeout(() => {
      setSubmitSuccess(false);
      setActiveFormToRun(null);
      setFormAnswers({});
      setCapturedGps(null);
    }, 1200);
  };

  const handleSaveDesignedForm = () => {
    if (!designerTitle) return;
    const newForm: DynamicForm = {
      id: `form-${Date.now()}`,
      title: designerTitle,
      description: designerDesc,
      fields: designerFields,
      submissionsCount: 0
    };
    const updated = [...forms, newForm];
    setForms(updated);
    localStorage.setItem(`ngo_forms_${tenant?.id}`, JSON.stringify(updated));
    setIsDesignerOpen(false);
    setDesignerTitle('');
    setDesignerDesc('');
  };

  const addFieldToDesigner = (type: FormField['type']) => {
    const id = String(designerFields.length + 1);
    const label = type === 'gps' ? 'GPS Location' : type === 'photo' ? 'Photo Attachment' : `Question ${id}`;
    setDesignerFields([...designerFields, { id, label, type, required: true }]);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with PWA Offline Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border bg-card">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-primary" />
            <span>{isBangla ? 'মাঠ পর্যায়ের অপারেশন ও ফর্ম বিল্ডার' : 'Field Operations & Dynamic Form Builder'}</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isBangla
              ? 'ডাইনামিক ফর্ম তৈরি করুন, অফলাইনে তথ্য সংগ্রহ করুন এবং জিপিএস ট্র্যাকিং যাচাই করুন।'
              : 'Create custom survey forms, collect field data offline, and capture GPS locations.'}
          </p>
        </div>

        {/* Sync Status Badge */}
        <div className="flex items-center gap-2.5">
          <Badge variant={isOnline ? 'success' : 'warning'} className="text-xs py-1 px-3 flex items-center gap-1.5">
            {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            <span>{isOnline ? (isBangla ? 'অনলাইন' : 'Online') : (isBangla ? 'অফলাইন মোড' : 'Offline Mode')}</span>
          </Badge>

          {pendingSyncCount > 0 && (
            <Button
              size="sm"
              variant="outline"
              isLoading={isSyncing}
              onClick={syncNow}
              className="h-8 text-xs font-semibold text-primary"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1" />
              {isBangla ? `${toBanglaDigits(pendingSyncCount)} টি সিঙ্ক বাকি` : `${pendingSyncCount} Pending Sync`}
            </Button>
          )}

          <Button onClick={() => setIsDesignerOpen(true)} className="text-xs h-8">
            <Plus className="w-3.5 h-3.5 mr-1" />
            {isBangla ? 'নতুন ফর্ম ডিজাইন' : 'Design Form'}
          </Button>
        </div>
      </div>

      {/* Forms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {forms.map((form) => (
          <Card key={form.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-[10px] font-mono">
                  {form.fields.length} {isBangla ? 'টি ফিল্ড' : 'Fields'}
                </Badge>
                <div className="text-xs text-muted-foreground">
                  <span className="font-bold text-foreground font-mono">
                    {isBangla ? toBanglaDigits(form.submissionsCount) : form.submissionsCount}
                  </span>{' '}
                  {isBangla ? 'টি উত্তর সংগৃহীত' : 'Submissions'}
                </div>
              </div>
              <CardTitle className="text-sm font-bold mt-2">{form.title}</CardTitle>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{form.description}</p>
            </CardHeader>
            <CardContent className="pt-3 flex items-center justify-between">
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-mono">
                {form.fields.some((f) => f.type === 'gps') && (
                  <Badge variant="secondary" className="text-[9px] gap-0.5">
                    <MapPin className="w-2.5 h-2.5 text-primary" /> GPS
                  </Badge>
                )}
                {form.fields.some((f) => f.type === 'photo') && (
                  <Badge variant="secondary" className="text-[9px] gap-0.5">
                    <Camera className="w-2.5 h-2.5 text-sky-600" /> Photo
                  </Badge>
                )}
              </div>

              <Button
                size="sm"
                variant="default"
                onClick={() => {
                  setActiveFormToRun(form);
                  setFormAnswers({});
                  setCapturedGps(null);
                }}
                className="h-8 text-xs font-semibold px-4"
              >
                <Play className="w-3 h-3 mr-1.5" />
                {isBangla ? 'মাঠে ফর্ম পূরণ করুন' : 'Run Survey'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Form Designer Modal */}
      <Dialog
        isOpen={isDesignerOpen}
        onClose={() => setIsDesignerOpen(false)}
        title={isBangla ? 'ডাইনামিক ফর্ম বিল্ডার' : 'Dynamic Form Designer'}
        maxWidth="xl"
      >
        <div className="space-y-4 pt-2">
          <div>
            <label className="text-xs font-semibold text-muted-foreground">{isBangla ? 'ফর্মের শিরোনাম *' : 'Form Title *'}</label>
            <Input value={designerTitle} onChange={(e) => setDesignerTitle(e.target.value)} placeholder="e.g. Health & Nutrition Assessment" />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground">{isBangla ? 'সংক্ষিপ্ত উদ্দেশ্য / বিবরণ' : 'Description / Objective'}</label>
            <Input value={designerDesc} onChange={(e) => setDesignerDesc(e.target.value)} placeholder="Objective of this survey in the field" />
          </div>

          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-muted-foreground">
                {isBangla ? 'ফর্মের ফিল্ডসমূহ:' : 'Form Questions & Fields:'}
              </label>
              <div className="flex gap-1.5">
                <Button size="sm" variant="outline" onClick={() => addFieldToDesigner('text')} className="h-6 text-[10px] px-2">
                  + Text
                </Button>
                <Button size="sm" variant="outline" onClick={() => addFieldToDesigner('number')} className="h-6 text-[10px] px-2">
                  + Number
                </Button>
                <Button size="sm" variant="outline" onClick={() => addFieldToDesigner('gps')} className="h-6 text-[10px] px-2 text-primary">
                  + GPS
                </Button>
                <Button size="sm" variant="outline" onClick={() => addFieldToDesigner('photo')} className="h-6 text-[10px] px-2 text-sky-600">
                  + Photo
                </Button>
              </div>
            </div>

            <div className="space-y-2 border rounded-lg p-3 max-h-56 overflow-y-auto bg-muted/20">
              {designerFields.map((f, idx) => (
                <div key={f.id} className="flex items-center gap-2 p-2 bg-card rounded border text-xs">
                  <span className="font-mono text-muted-foreground">{idx + 1}.</span>
                  <Input
                    value={f.label}
                    onChange={(e) => {
                      const updated = [...designerFields];
                      updated[idx].label = e.target.value;
                      setDesignerFields(updated);
                    }}
                    className="h-8 text-xs flex-1"
                  />
                  <Badge variant="outline" className="text-[10px] uppercase font-mono">
                    {f.type}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button variant="outline" onClick={() => setIsDesignerOpen(false)} className="text-xs">
              {isBangla ? 'বাতিল' : 'Cancel'}
            </Button>
            <Button onClick={handleSaveDesignedForm} className="text-xs">
              <Check className="w-4 h-4 mr-1.5" />
              {isBangla ? 'ফর্ম সংরক্ষণ করুন' : 'Save Form'}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Field Officer Survey Runner Modal (Mobile-Optimized) */}
      {activeFormToRun && (
        <Dialog
          isOpen={!!activeFormToRun}
          onClose={() => setActiveFormToRun(null)}
          title={
            <div className="flex items-center gap-2">
              <Play className="w-4 h-4 text-primary" />
              <span>{activeFormToRun.title}</span>
            </div>
          }
          maxWidth="md"
        >
          <div className="space-y-4 pt-2">
            {submitSuccess && (
              <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {isBangla
                    ? 'তথ্য সফলভাবে সংগৃহীত হয়েছে এবং আউটবক্সে সংরক্ষিত হয়েছে!'
                    : 'Survey collected and saved into offline outbox queue!'}
                </span>
              </div>
            )}

            <p className="text-xs text-muted-foreground">{activeFormToRun.description}</p>

            <div className="space-y-3">
              {activeFormToRun.fields.map((field) => (
                <div key={field.id} className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    {field.label} {field.required && <span className="text-destructive">*</span>}
                  </label>

                  {field.type === 'text' && (
                    <Input
                      placeholder="Enter text..."
                      value={formAnswers[field.id] || ''}
                      onChange={(e) => setFormAnswers({ ...formAnswers, [field.id]: e.target.value })}
                    />
                  )}

                  {field.type === 'number' && (
                    <Input
                      type="number"
                      placeholder="0"
                      value={formAnswers[field.id] || ''}
                      onChange={(e) => setFormAnswers({ ...formAnswers, [field.id]: e.target.value })}
                    />
                  )}

                  {field.type === 'select' && (
                    <select
                      value={formAnswers[field.id] || ''}
                      onChange={(e) => setFormAnswers({ ...formAnswers, [field.id]: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs"
                    >
                      <option value="">Select option...</option>
                      {field.options?.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  )}

                  {field.type === 'gps' && (
                    <div className="flex items-center gap-2 p-2 border rounded-lg bg-muted/20">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        isLoading={isCapturingGps}
                        onClick={handleCaptureGps}
                        className="text-xs h-8"
                      >
                        <MapPin className="w-3.5 h-3.5 mr-1 text-primary" />
                        {isBangla ? 'জিপিএস লোকেশন নিন' : 'Capture GPS'}
                      </Button>
                      {capturedGps ? (
                        <span className="text-xs font-mono text-emerald-600 font-semibold">
                          Lat: {capturedGps.lat.toFixed(5)}, Lng: {capturedGps.lng.toFixed(5)}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">No GPS coordinates yet</span>
                      )}
                    </div>
                  )}

                  {field.type === 'photo' && (
                    <div className="p-3 border-2 border-dashed rounded-lg text-center bg-card">
                      <Camera className="w-6 h-6 mx-auto text-muted-foreground mb-1" />
                      <span className="text-xs text-muted-foreground block">
                        {isBangla ? 'ক্যামেরা ছবি সংযুক্ত করুন' : 'Attach Camera Photo'}
                      </span>
                      <Input type="file" accept="image/*" capture="environment" className="mt-2 text-xs h-9" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button variant="outline" onClick={() => setActiveFormToRun(null)} className="text-xs">
                {isBangla ? 'বাতিল' : 'Cancel'}
              </Button>
              <Button onClick={handleSubmitFieldSurvey} className="text-xs">
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                {isBangla ? 'অফলাইনে জমা দিন' : 'Submit Response'}
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
};
