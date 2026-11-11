import React from 'react';
import { FileText, ChevronRight, AlertTriangle, Sparkles } from 'lucide-react';
import { IncidentReport } from '../types';

interface RecentIncidentsSectionProps {
  incidents: IncidentReport[];
  activeIncidentId: string;
  onSelectIncident: (incidentId: string) => void;
  onInspectIncident?: (incident: IncidentReport) => void;
}

export const RecentIncidentsSection: React.FC<RecentIncidentsSectionProps> = ({
  incidents,
  activeIncidentId,
  onSelectIncident,
  onInspectIncident
}) => {
  return (
    <div className="bg-[#0e1628] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <FileText className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100">
            All Recent Incident Reports
          </h3>
        </div>

        <span className="text-xs text-slate-400 font-mono">
          {incidents.length} total recorded reports
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {incidents.map((incident) => {
          const isActive = incident.id === activeIncidentId;
          const isRed = incident.severity.includes('Red');

          let statusLabel = 'REPORTED';
          if (incident.statusStep === 2) statusLabel = 'TRIAGED';
          if (incident.statusStep === 3) statusLabel = 'EN ROUTE SCENE';
          if (incident.statusStep === 4) statusLabel = 'ON SCENE';
          if (incident.statusStep === 5) statusLabel = 'HOSPITAL TRANSIT';
          if (incident.statusStep === 6) statusLabel = 'RESOLVED';

          return (
            <div
              key={incident.id}
              onClick={() => onSelectIncident(incident.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer relative group ${
                isActive
                  ? 'bg-[#141b2e] border-rose-500/70 shadow-lg shadow-rose-950/30 ring-1 ring-rose-500/40'
                  : 'bg-[#0a1120] border-slate-800 hover:border-slate-700 hover:bg-[#0d1527]'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-200">
                    {incident.code}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      isRed
                        ? 'bg-rose-950/80 text-rose-300 border-rose-800/60'
                        : 'bg-amber-950/80 text-amber-300 border-amber-800/60'
                    }`}
                  >
                    {incident.severity}
                  </span>
                  {(incident.isVerifiedByAi || incident.isVerifiedByAdmin) && (
                    <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 font-mono">
                      <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
                      AI Verified
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono font-bold tracking-wider text-cyan-400 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-800/40">
                    {statusLabel}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectIncident(incident.id);
                      if (onInspectIncident) onInspectIncident(incident);
                    }}
                    className="text-xs text-cyan-300 hover:text-white flex items-center font-bold px-2 py-0.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 transition active:scale-95"
                    title="Inspect complete CAD incident report"
                  >
                    <span>Inspect</span>
                    <ChevronRight className="w-3 h-3 ml-0.5" />
                  </button>
                </div>
              </div>

              <h4 className="text-sm font-bold text-white mb-1.5 truncate group-hover:text-cyan-200 transition-colors">
                {incident.title}
              </h4>

              <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                <span>01:03 pm</span>
                <span>•</span>
                <span>
                  {incident.casualties} casualties ({incident.vehiclesInvolved} vehicles)
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
