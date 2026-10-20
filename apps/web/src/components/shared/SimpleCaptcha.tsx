import React, { useState, useEffect } from 'react';
import { RotateCw, ShieldCheck, Sparkles } from 'lucide-react';
import { toBanglaDigits } from '@ngo-erp/shared';

interface SimpleCaptchaProps {
  isBangla?: boolean;
  value: string;
  onChange: (val: string) => void;
  onAnswerChange?: (correctAnswer: number) => void;
  hasError?: boolean;
  errorMessage?: string;
  className?: string;
}

export const SimpleCaptcha: React.FC<SimpleCaptchaProps> = ({
  isBangla = true,
  value,
  onChange,
  onAnswerChange,
  hasError = false,
  errorMessage,
  className = ''
}) => {
  const [num1, setNum1] = useState<number>(() => Math.floor(Math.random() * 8) + 2);
  const [num2, setNum2] = useState<number>(() => Math.floor(Math.random() * 7) + 1);
  const [isRotating, setIsRotating] = useState<boolean>(false);

  const generateNew = () => {
    setIsRotating(true);
    const n1 = Math.floor(Math.random() * 8) + 2;
    const n2 = Math.floor(Math.random() * 7) + 1;
    setNum1(n1);
    setNum2(n2);
    onChange('');
    if (onAnswerChange) {
      onAnswerChange(n1 + n2);
    }
    setTimeout(() => setIsRotating(false), 500);
  };

  useEffect(() => {
    if (onAnswerChange) {
      onAnswerChange(num1 + num2);
    }
  }, [num1, num2]);

  const displayNum1 = isBangla ? toBanglaDigits(num1) : num1;
  const displayNum2 = isBangla ? toBanglaDigits(num2) : num2;

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>{isBangla ? 'বট প্রতিরোধক সহজ সিকিউরিটি ক্যাপচা *' : 'Anti-Bot Security Captcha *'}</span>
        </label>
        <span className="text-[10px] text-muted-foreground">
          {isBangla ? 'স্প্যাম ঠেকাতে সমাধান করুন' : 'Solve to prevent spam'}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {/* Math Challenge Box */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/70 dark:bg-muted/30 border border-border rounded-lg select-none font-mono font-bold text-sm text-foreground shadow-inner">
          <span className="tracking-widest text-emerald-700 dark:text-emerald-400 text-base">{displayNum1}</span>
          <span className="text-muted-foreground font-sans">+</span>
          <span className="tracking-widest text-sky-700 dark:text-sky-400 text-base">{displayNum2}</span>
          <span className="text-muted-foreground font-sans">=</span>
          <span className="text-primary font-bold">?</span>
        </div>

        {/* Refresh Button */}
        <button
          type="button"
          onClick={generateNew}
          className="p-2 h-9 w-9 rounded-lg border border-input hover:bg-muted text-muted-foreground hover:text-foreground transition-all flex items-center justify-center shrink-0"
          title={isBangla ? 'নতুন ক্যাপচা প্রশ্ন তৈরি করুন' : 'Generate new challenge'}
        >
          <RotateCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin text-primary' : ''}`} />
        </button>

        {/* Input Answer Field */}
        <div className="flex-1">
          <input
            type="number"
            required
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={isBangla ? 'যোগফল লিখুন' : 'Enter sum'}
            className={`h-9 w-full px-3 text-xs rounded-lg border font-mono ${
              hasError
                ? 'border-rose-500 bg-rose-50/20 text-rose-700 focus:ring-rose-500'
                : 'border-input bg-background focus:ring-2 focus:ring-primary'
            } focus:outline-none transition-all`}
          />
        </div>
      </div>

      {hasError && (
        <p className="text-[11px] text-rose-600 font-medium animate-in fade-in">
          {errorMessage || (isBangla ? 'ক্যাপচার উত্তর সঠিক হয়নি, আবার চেষ্টা করুন!' : 'Incorrect captcha answer, please retry!')}
        </p>
      )}
    </div>
  );
};
