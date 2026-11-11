import React from 'react';
import {
  MapPin,
  Calendar,
  Clock,
  Radio,
  FileText,
  CheckCircle2,
  Ambulance,
  Building2,
  Phone,
  Shield,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { IncidentReport, PIPELINE_STEPS, GraphNode } from '../data/mockData';
import { SceneDocument } from '../types';

interface IncidentTrackerProps {
  incident: IncidentReport;
  nodes: Record<string, GraphNode>;
  userRole: 'citizen' | 'dispatch';
  onStepChange: (newStep: number) => void;
  onOpenPhotoPreview: (docUrl: string, title: string) => void;
  estimatedArrivalMinutes?: number;
  transitHospitalKm?: number;
}

export const IncidentTracker: React.FC<IncidentTrackerProps> = ({
  incident,
  nodes,
  userRole,
  onStepChange,
  onOpenPhotoPreview,
  estimatedArrivalMinutes = 6.8,
  transitHospitalKm = 6.1
}) => {
  const stationNode = incident.assignedStationId ? nodes[incident.assignedStationId] : nodes['station_vytilla'];
  const hospitalNode = nodes[incident.targetHospitalId];

  const assignedUnit = stationNode?.stationUnit || {
    name: 'Rescue Alpha 2',
    code: 'AMB-102',
    lead: 'Paramedic Chloe Zhang',
    driver: 'David Kim',
    level: 'Mobile ICU Trauma Unit',
    status: 'ASSIGNED'
  };

  const receivingHospital = hospitalNode || {
    name: 'St. Jude Metropolitan Hospital',
    traumaLevel: 'Level 1 Trauma Center',
    icuAvailable: 6,
    beds: { free: 34, total: 240 },
    emergencyPhone: '+1 (555) 019-2831'
  };

  return (
    <div className="space-y-6">
      {/* Incident Header & Meta Card */}
      <div className="bg-[#0e1628] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center flex-wrap gap-2.5">
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                Live Incident Tracker:
                <span className="text-cyan-400 font-mono">{incident.code}</span>
              </h3>

              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  incident.severity.includes('Red')
                    ? 'bg-rose-950/90 text-rose-300 border-rose-800/80 shadow-sm shadow-rose-950'
                    : 'bg-amber-950/90 text-amber-300 border-amber-800/80 shadow-sm shadow-amber-950'
                }`}
              >
                {incident.severity}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-300">
              <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{incident.title}</span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-400">{incident.locationDetails}</span>
            </div>

            <div className="flex items-center flex-wrap gap-2 pt-1 text-xs text-slate-400">
              <span className="flex items-center gap-1 font-mono">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                {incident.timestamp}
              </span>

              {/* Hazard Tags */}
              <div className="flex items-center flex-wrap gap-1.5 ml-0 sm:ml-2">
                {incident.tags.map((tag: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#1a111a] text-rose-300 border border-rose-900/40"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex md:flex-col items-center md:items-end justify-between gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Reported at 01:03 pm</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Live Sync</span>
            </div>

            {(incident.isVerifiedByAi || incident.isVerifiedByAdmin) && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-emerald-950/70 to-teal-950/70 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>AI Auto-Verified ({incident.aiVerification?.confidenceScore || 98.6}%)</span>
              </div>
            )}
          </div>
        </div>

        {/* SUBMITTED SCENE PHOTOS & DOCUMENTS */}
        <div className="mt-5 pt-4 border-t border-slate-800/80">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            <span>Submitted Scene Photos &amp; Documents ({incident.sceneDocuments.length})</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {incident.sceneDocuments.map((doc: SceneDocument) => (
              <div
                key={doc.id}
                onClick={() => {
                  if (doc.url) onOpenPhotoPreview(doc.url, doc.name);
                }}
                className={`flex items-center gap-3 p-2.5 rounded-xl border transition cursor-pointer group ${
                  doc.type === 'image'
                    ? 'bg-[#0a1120] hover:bg-slate-800/60 border-slate-800 hover:border-cyan-500/40'
                    : 'bg-[#0a1120] hover:bg-slate-800/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                {doc.type === 'image' && doc.url ? (
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-900 relative shrink-0 border border-slate-700/80 group-hover:scale-105 transition-transform">
                    <img
                      src={doc.url}
                      alt={doc.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-red-950/60 border border-red-800/40 flex flex-col items-center justify-center shrink-0 text-red-400">
                    <span className="text-[10px] font-bold tracking-wider font-mono">PDF</span>
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-200 truncate group-hover:text-cyan-300 transition-colors">
                    {doc.name}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                    {doc.size}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 6-STEP PROGRESS PIPELINE TRACKER */}
        <div className="mt-6 pt-5 border-t border-slate-800/80">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 uppercase tracking-wider font-bold">
                Dispatch Triage Progress Pipeline
              </span>
              {incident.statusStep >= 2 && incident.statusStep < 6 && (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-950/70 text-emerald-300 border border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Live CAD Pipeline Active</span>
                </span>
              )}
            </div>
            {userRole === 'dispatch' && (
              <span className="text-cyan-400 font-medium">
                Admin Mode: Click any step to advance or regress incident status
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {PIPELINE_STEPS.map((s) => {
              const isPast = s.step < incident.statusStep;
              const isCurrent = s.step === incident.statusStep;
              const isFuture = s.step > incident.statusStep;

              return (
                <div
                  key={s.step}
                  onClick={() => userRole === 'dispatch' && onStepChange(s.step)}
                  className={`p-3 rounded-xl border transition-all text-left relative ${
                    userRole === 'dispatch' ? 'cursor-pointer hover:scale-[1.02]' : ''
                  } ${
                    isCurrent
                      ? 'bg-rose-950/40 border-rose-600 shadow-lg shadow-rose-950/50 ring-1 ring-rose-500/50'
                      : isPast
                      ? 'bg-[#0a1120] border-emerald-900/60'
                      : 'bg-[#070d18] border-slate-800/60 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono tracking-wider text-slate-400">
                      STEP 0{s.step}
                    </span>
                    {isPast ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : isCurrent ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-slate-700" />
                    )}
                  </div>

                  <div
                    className={`text-xs font-bold ${
                      isCurrent
                        ? 'text-white'
                        : isPast
                        ? 'text-emerald-300'
                        : 'text-slate-400'
                    }`}
                  >
                    {s.title}
                  </div>

                  <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {s.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2 DISPATCH CARDS SIDE-BY-SIDE (EXACT REPLICA OF SCREENSHOT 3) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* CARD 1: ASSIGNED AMBULANCE UNIT */}
        <div className="bg-[#0e1628] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-cyan-950/70 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-md">
                  <Ambulance className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                    Assigned Ambulance Unit
                  </span>
                  <h4 className="text-lg sm:text-xl font-bold text-white">
                    {assignedUnit.name}
                  </h4>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-slate-400 block font-medium">
                  Estimated Arrival
                </span>
                <span className="text-lg sm:text-xl font-bold font-mono text-amber-400">
                  ~{estimatedArrivalMinutes} mins
                </span>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4 text-xs pt-4 border-t border-slate-800/80">
              <div>
                <span className="text-slate-400 block mb-1">Equipment Level</span>
                <span className="font-semibold text-slate-200">
                  {assignedUnit.level}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Paramedic Lead</span>
                <span className="font-semibold text-slate-200">
                  {assignedUnit.lead}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Driver</span>
                <span className="font-semibold text-slate-200">
                  {assignedUnit.driver}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Unit Status</span>
                <span className="font-semibold text-cyan-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  ASSIGNED
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2: RECOMMENDED RECEIVING HOSPITAL */}
        <div className="bg-[#0e1628] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-emerald-950/70 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-md">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                    Recommended Receiving Hospital
                  </span>
                  <h4 className="text-lg sm:text-xl font-bold text-white">
                    {receivingHospital.name}
                  </h4>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-slate-400 block font-medium">
                  Transit Distance
                </span>
                <span className="text-lg sm:text-xl font-bold font-mono text-emerald-400">
                  {transitHospitalKm} km
                </span>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4 text-xs pt-4 border-t border-slate-800/80">
              <div>
                <span className="text-slate-400 block mb-1">Facility Rating</span>
                <span className="font-semibold text-emerald-400">
                  {receivingHospital.traumaLevel || 'Level 1 Trauma Center'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">ICU Preparedness</span>
                <span className="font-semibold text-amber-300 font-mono">
                  {receivingHospital.icuAvailable || 6} Dedicated Units Available
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Total Beds</span>
                <span className="font-semibold text-slate-200 font-mono">
                  {receivingHospital.beds ? `${receivingHospital.beds.free} / ${receivingHospital.beds.total} Free` : '34 / 240 Free'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Emergency Line</span>
                <span className="font-semibold text-slate-200 font-mono">
                  {receivingHospital.emergencyPhone || '+1 (555) 019-2831'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
