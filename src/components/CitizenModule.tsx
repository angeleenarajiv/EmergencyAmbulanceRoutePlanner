import React from 'react';
import {
  PhoneCall,
  AlertTriangle,
  Siren,
  Building2,
  Clock,
  ShieldCheck,
  MapPin,
  Calendar,
  CheckCircle2,
  Phone,
  FileText
} from 'lucide-react';
import { IncidentReport, GraphNode, AmbulanceUnit } from '../types';
import { HeroReportBanner } from './HeroReportBanner';
import { IncidentTracker } from './IncidentTracker';
import { FirstAidSection } from './FirstAidSection';

interface CitizenModuleProps {
  incidents: IncidentReport[];
  activeIncident: IncidentReport;
  nodes: Record<string, GraphNode>;
  ambulances: AmbulanceUnit[];
  onSelectIncident: (id: string) => void;
  onOpenReportModal: () => void;
  onDial108: () => void;
  onOpenPhotoPreview: (url: string, title: string) => void;
  estimatedArrivalMinutes?: number;
  transitHospitalKm?: number;
}

export const CitizenModule: React.FC<CitizenModuleProps> = ({
  incidents,
  activeIncident,
  nodes,
  ambulances,
  onSelectIncident,
  onOpenReportModal,
  onDial108,
  onOpenPhotoPreview,
  estimatedArrivalMinutes = 4.8,
  transitHospitalKm = 4.5
}) => {
  const hospitalList = Object.values(nodes).filter((n) => n.type === 'hospital');

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Compact Status Header */}
      <div className="p-3.5 rounded-xl bg-[#0e1628] border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <span className="font-bold text-white uppercase tracking-wider text-xs">
            Citizen Emergency Portal
          </span>
          <span className="text-slate-500 hidden sm:inline">·</span>
          <span className="text-slate-400 hidden sm:inline">
            Direct 108 CAD incident reporting &amp; live triage tracking
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px] text-emerald-400">
          <span>Kerala 108 EMS Network</span>
        </div>
      </div>

      {/* Emergency Reporting Banner */}
      <HeroReportBanner
        onOpenReportModal={onOpenReportModal}
        onDial108={onDial108}
      />

      {/* Citizen Personal Incident Query Tracking */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            Your Reported Emergency Incident Query
          </h3>
          <span className="text-[11px] font-mono text-cyan-400">
            Tracking Code: {activeIncident.code}
          </span>
        </div>

        <IncidentTracker
          incident={activeIncident}
          nodes={nodes}
          userRole="citizen"
          onStepChange={() => {}} // Citizens cannot manually advance dispatch status
          onOpenPhotoPreview={onOpenPhotoPreview}
          estimatedArrivalMinutes={estimatedArrivalMinutes}
          transitHospitalKm={transitHospitalKm}
        />
      </div>

      {/* Pre-arrival First-Aid Protocols */}
      <FirstAidSection />

      {/* Compact Hospital Emergency Directory */}
      <div className="bg-[#0e1628] border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100">
              Emergency Trauma Centers &amp; Hotlines (Ernakulam)
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            {hospitalList.length} Network Facilities
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {hospitalList.slice(0, 6).map((hosp) => (
            <div
              key={hosp.id}
              className="p-3 rounded-xl bg-[#0a1120] border border-slate-800 hover:border-slate-700 transition flex items-center justify-between gap-2"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-xs text-slate-200 truncate">
                    {hosp.name.split(',')[0]}
                  </h4>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[9px] font-bold font-mono ${
                      hosp.diversionStatus === 'divert'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}
                  >
                    {hosp.diversionStatus === 'divert' ? 'FULL' : 'FREE'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-mono truncate">
                  ICU: {hosp.icuAvailable} Open · Beds: {hosp.beds?.free}/{hosp.beds?.total}
                </p>
              </div>

              <a
                href={`tel:${hosp.emergencyPhone}`}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs font-bold font-mono transition shrink-0"
                title="Call Emergency Room"
              >
                <Phone className="w-3 h-3" />
                <span>Call</span>
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
