import React from 'react';
import { HeartPulse, ShieldAlert, AlertTriangle, Activity } from 'lucide-react';
import { FIRST_AID_PROTOCOLS } from '../data/mockData';

export const FirstAidSection: React.FC = () => {
  return (
    <div className="bg-[#0e1628] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-rose-950/60 border border-rose-500/30 flex items-center justify-center text-rose-400">
          <HeartPulse className="w-4 h-4" />
        </div>
        <h3 className="text-sm font-bold text-slate-100">
          Critical First-Aid &amp; Scene Safety{' '}
          <span className="text-rose-400 font-normal">(While Paramedics Are En Route)</span>
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {FIRST_AID_PROTOCOLS.map((protocol) => {
          let IconComponent = ShieldAlert;
          if (protocol.id === 2) IconComponent = HeartPulse;
          if (protocol.id === 3) IconComponent = AlertTriangle;
          if (protocol.id === 4) IconComponent = Activity;

          return (
            <div
              key={protocol.id}
              className="bg-[#0a1120] border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition"
            >
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <IconComponent className="w-4 h-4 text-rose-400 shrink-0" />
                  <h4 className="text-xs font-bold text-slate-100">{protocol.title}</h4>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {protocol.description}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/60 text-[10px] font-mono text-slate-500 flex items-center justify-between">
                <span>EMS Priority Protocol</span>
                <span className="text-emerald-400">Verified</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
