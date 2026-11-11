import React from 'react';
import { PhoneCall, AlertTriangle, Siren } from 'lucide-react';

interface HeroReportBannerProps {
  onOpenReportModal: () => void;
  onDial108?: () => void;
  onDial911?: () => void; // backwards-compatible alias
}

export const HeroReportBanner: React.FC<HeroReportBannerProps> = ({
  onOpenReportModal,
  onDial108,
  onDial911
}) => {
  const handleDial = onDial108 || onDial911 || (() => {});
  return (
    <div className="hero-report-banner relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-50 via-white to-slate-50 border border-rose-200 dark:from-[#180d19] dark:via-[#121626] dark:to-[#0c1a2e] dark:border-rose-900/30 p-6 sm:p-7 shadow-xl shadow-rose-950/10 dark:shadow-red-950/20">
      {/* Decorative background glow */}
      <div className="absolute -right-20 -top-20 w-72 h-72 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="max-w-2xl space-y-2.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800/60 shadow-sm">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
            <span>Emergency Reporting Portal</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            Accident in Progress? Report Immediately.
          </h2>

          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Gemini AI automatically verifies reported accidents in real time, immediately dispatching the nearest ambulance via Dijkstra routing and alerting the CAD dispatcher.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <button
            onClick={handleDial}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white dark:bg-slate-900/90 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700/80 text-rose-700 dark:text-rose-200 font-semibold text-sm transition active:scale-95 shadow-sm"
          >
            <PhoneCall className="w-4 h-4 text-rose-500 dark:text-rose-400" />
            <span>Dial 108 Direct</span>
          </button>

          <button
            onClick={onOpenReportModal}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-500 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm shadow-xl shadow-rose-900/50 transition active:scale-95"
          >
            <Siren className="w-4 h-4 animate-bounce" />
            <span>Report Accident Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};
