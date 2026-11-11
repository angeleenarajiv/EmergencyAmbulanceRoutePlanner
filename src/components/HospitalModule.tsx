import React, { useState, useEffect } from 'react';
import {
  Building2,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Minus,
  Plus,
  Save,
  Radio,
  Phone,
  ShieldAlert,
  Send,
  HeartPulse,
  Flame,
  ArrowRight,
  Clock,
  Sparkles,
  FileText,
  Droplet,
  Scissors,
  Stethoscope,
  Wind
} from 'lucide-react';
import { GraphNode, IncidentReport, AmbulanceUnit } from '../types';
import { sirenAudio } from '../utils/sirenSound';
import { InspectIncidentModal } from './InspectIncidentModal';

interface HospitalMemo {
  id: string;
  time: string;
  message: string;
  author: string;
}

interface HospitalModuleProps {
  hospitalId: string;
  nodes: Record<string, GraphNode>;
  incidents: IncidentReport[];
  ambulances?: AmbulanceUnit[];
  onUpdateHospitalCapacity: (
    hospitalId: string,
    updates: {
      freeBeds: number;
      totalBeds: number;
      icuAvailable: number;
      diversionStatus: 'operational' | 'advisory' | 'divert';
      ventilatorsAvailable?: number;
      oxygenReservePercent?: number;
    }
  ) => void;
  onBroadcastHospitalNotice: (message: string) => void;
  onSelectHospitalId?: (hospitalId: string) => void;
  onOpenPhotoPreview?: (url: string, title: string) => void;
}

export const HospitalModule: React.FC<HospitalModuleProps> = ({
  hospitalId,
  nodes,
  incidents,
  ambulances = [],
  onUpdateHospitalCapacity,
  onBroadcastHospitalNotice,
  onOpenPhotoPreview
}) => {
  const hospital = nodes[hospitalId] || Object.values(nodes).find((n) => n.type === 'hospital');
  if (!hospital) return null;

  // Resource capacity inputs
  const [freeBeds, setFreeBeds] = useState<number>(hospital.beds?.free || 35);
  const [totalBeds, setTotalBeds] = useState<number>(hospital.beds?.total || 600);
  const [icuAvailable, setIcuAvailable] = useState<number>(hospital.icuAvailable || 6);
  const [traumaBaysOpen, setTraumaBaysOpen] = useState<number>(4);
  const [ventilators, setVentilators] = useState<number>(hospital.ventilatorsAvailable || 10);
  const [oxygenReserve, setOxygenReserve] = useState<number>(hospital.oxygenReservePercent || 96);
  const [bloodUnitsONeg, setBloodUnitsONeg] = useState<number>(14);
  const [operatingTheatersReady, setOperatingTheatersReady] = useState<number>(3);
  const [traumaSpecialistsOnDuty, setTraumaSpecialistsOnDuty] = useState<number>(4);
  const [diversionStatus, setDiversionStatus] = useState<'operational' | 'advisory' | 'divert'>(
    hospital.diversionStatus || 'operational'
  );

  // Memos & Notices
  const [customNotice, setCustomNotice] = useState<string>('');
  const [memos, setMemos] = useState<HospitalMemo[]>([
    {
      id: 'memo-1',
      time: '01:05 pm',
      message: 'Trauma Resus Bay 2 cleared & ready for inbound polytrauma.',
      author: 'Dr. Mathew Kurian (Duty CMO)'
    },
    {
      id: 'memo-2',
      time: '12:45 pm',
      message: 'Level 1 Neuro-trauma team and CT angio suite on active standby.',
      author: 'Trauma Desk Dispatch'
    }
  ]);
  const [memoSentSuccess, setMemoSentSuccess] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Inspection modal
  const [inspectedIncident, setInspectedIncident] = useState<IncidentReport | null>(null);

  // Sync state if hospital changes
  useEffect(() => {
    if (hospital) {
      setFreeBeds(hospital.beds?.free || 35);
      setTotalBeds(hospital.beds?.total || 600);
      setIcuAvailable(hospital.icuAvailable || 6);
      setVentilators(hospital.ventilatorsAvailable || 10);
      setOxygenReserve(hospital.oxygenReservePercent || 96);
      setDiversionStatus(hospital.diversionStatus || 'operational');
    }
  }, [hospitalId, hospital]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    sirenAudio.playBeep(980, 150);

    onUpdateHospitalCapacity(hospital.id, {
      freeBeds,
      totalBeds,
      icuAvailable,
      diversionStatus,
      ventilatorsAvailable: ventilators,
      oxygenReservePercent: oxygenReserve
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleQuickBroadcast = () => {
    if (!customNotice.trim()) return;
    sirenAudio.playBeep(1100, 200);

    const newMemoText = customNotice.trim();
    const newMemo: HospitalMemo = {
      id: `memo-${Date.now()}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase(),
      message: newMemoText,
      author: 'Duty Medical Officer'
    };

    setMemos((prev) => [newMemo, ...prev]);
    onBroadcastHospitalNotice(`[${hospital.name.split(',')[0]}] ${newMemoText}`);
    setCustomNotice('');
    setMemoSentSuccess(true);
    setTimeout(() => setMemoSentSuccess(false), 3000);
  };

  // Filter incidents routed strictly to THIS particular hospital
  const hospitalIncidents = incidents.filter(
    (inc) => inc.targetHospitalId === hospital.id
  );

  const activeInbound = hospitalIncidents.filter(
    (inc) => inc.statusStep >= 2 && inc.statusStep <= 5
  );

  return (
    <div className="space-y-5 animate-fadeIn max-w-6xl mx-auto">
      {/* Hospital Workspace Header - NO SWITCH DROPDOWN */}
      <div className="bg-[#0e1628] border-2 border-emerald-500/40 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-400/50 flex items-center justify-center text-emerald-400 shadow-lg shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700 font-mono uppercase">
                  Assigned Emergency Facility
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                    diversionStatus === 'divert'
                      ? 'bg-rose-950 text-rose-300 border border-rose-800'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  }`}
                >
                  {diversionStatus === 'divert' ? 'STATUS: NOT FREE (DIVERT)' : 'STATUS: FREE (ACCEPTING)'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-0.5">
                {hospital.name}
              </h2>
              <p className="text-xs text-slate-400">
                {hospital.traumaLevel || 'Level 1 Trauma Center'} · 24/7 Desk:{' '}
                <span className="font-mono text-slate-200">{hospital.emergencyPhone}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <div className="p-2.5 rounded-xl bg-[#070c18] border border-slate-800 text-right">
              <span className="text-[10px] text-slate-400 uppercase block">Inbound Transits</span>
              <strong className="text-base text-cyan-400 font-bold">{activeInbound.length} Units</strong>
            </div>
            <div className="p-2.5 rounded-xl bg-[#070c18] border border-slate-800 text-right">
              <span className="text-[10px] text-slate-400 uppercase block">ICU Beds Open</span>
              <strong className="text-base text-emerald-400 font-bold">{icuAvailable} Beds</strong>
            </div>
          </div>
        </div>

        {/* Inbound Trauma Alert Banner if any incoming */}
        {activeInbound.length > 0 && (
          <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-600/60 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-amber-300">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>{activeInbound.length} Active Emergency Transits</strong> en route to this trauma center.
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-300">
              Trauma Bay Prep Activated
            </span>
          </div>
        )}
      </div>

      {/* UPDATE OPTIONS: Hospital Capacity & Resource Inputs */}
      <div className="bg-[#0e1628] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-emerald-400" />
              <span>Update Hospital Capacity &amp; Resource Availability</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Live updates directly sync to the Central Dijkstra Router
            </p>
          </div>

          <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Live Sync Active
          </span>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Input 1: ICU Beds */}
            <div className="p-3 rounded-xl bg-[#0a1120] border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                  Dedicated ICU Beds
                </span>
                <span className="text-[10px] font-mono text-slate-400">Available</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIcuAvailable((prev) => Math.max(0, prev - 1))}
                    className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-200 font-bold transition"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xl font-bold font-mono text-emerald-400 w-8 text-center">
                    {icuAvailable}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIcuAvailable((prev) => prev + 1)}
                    className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-200 font-bold transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Beds</span>
              </div>
            </div>

            {/* Input 2: Trauma Resus Bays */}
            <div className="p-3 rounded-xl bg-[#0a1120] border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-300">
                  Trauma Bays Open
                </span>
                <span className="text-[10px] font-mono text-slate-400">ER Ready</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setTraumaBaysOpen((prev) => Math.max(0, prev - 1))}
                    className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-200 font-bold transition"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xl font-bold font-mono text-rose-400 w-8 text-center">
                    {traumaBaysOpen}
                  </span>
                  <button
                    type="button"
                    onClick={() => setTraumaBaysOpen((prev) => prev + 1)}
                    className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-200 font-bold transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Bays</span>
              </div>
            </div>

            {/* Input 3: Mechanical Ventilators */}
            <div className="p-3 rounded-xl bg-[#0a1120] border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-300">
                  Ventilators
                </span>
                <span className="text-[10px] font-mono text-slate-400">Primed</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setVentilators((prev) => Math.max(0, prev - 1))}
                    className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-200 font-bold transition"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xl font-bold font-mono text-cyan-400 w-8 text-center">
                    {ventilators}
                  </span>
                  <button
                    type="button"
                    onClick={() => setVentilators((prev) => prev + 1)}
                    className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-200 font-bold transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Units</span>
              </div>
            </div>

            {/* Input 4: Operating Theaters Ready */}
            <div className="p-3 rounded-xl bg-[#0a1120] border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
                  OT Theaters Ready
                </span>
                <span className="text-[10px] font-mono text-slate-400">Surgery</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setOperatingTheatersReady((prev) => Math.max(0, prev - 1))}
                    className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-200 font-bold transition"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xl font-bold font-mono text-amber-400 w-8 text-center">
                    {operatingTheatersReady}
                  </span>
                  <button
                    type="button"
                    onClick={() => setOperatingTheatersReady((prev) => prev + 1)}
                    className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-200 font-bold transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">OTs</span>
              </div>
            </div>

            {/* Input 5: Blood Bank O-Negative Units */}
            <div className="p-3 rounded-xl bg-[#0a1120] border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1">
                  <Droplet className="w-3 h-3 text-rose-500" />
                  Blood O-Negative
                </span>
                <span className="text-[10px] font-mono text-slate-400">Reserve</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setBloodUnitsONeg((prev) => Math.max(0, prev - 1))}
                    className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-200 font-bold transition"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xl font-bold font-mono text-rose-300 w-8 text-center">
                    {bloodUnitsONeg}
                  </span>
                  <button
                    type="button"
                    onClick={() => setBloodUnitsONeg((prev) => prev + 1)}
                    className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-200 font-bold transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Packs</span>
              </div>
            </div>

            {/* Input 6: Trauma Specialists On Duty */}
            <div className="p-3 rounded-xl bg-[#0a1120] border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1">
                  <Stethoscope className="w-3 h-3 text-indigo-400" />
                  Trauma Surgeons
                </span>
                <span className="text-[10px] font-mono text-slate-400">On Duty</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setTraumaSpecialistsOnDuty((prev) => Math.max(1, prev - 1))}
                    className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-200 font-bold transition"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xl font-bold font-mono text-indigo-300 w-8 text-center">
                    {traumaSpecialistsOnDuty}
                  </span>
                  <button
                    type="button"
                    onClick={() => setTraumaSpecialistsOnDuty((prev) => prev + 1)}
                    className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-200 font-bold transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Doctors</span>
              </div>
            </div>

            {/* Input 7: Oxygen Reserve % */}
            <div className="p-3 rounded-xl bg-[#0a1120] border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1">
                  <Wind className="w-3 h-3 text-cyan-400" />
                  Oxygen Reserve
                </span>
                <span className="text-[10px] font-mono text-slate-400">Bulk O₂</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setOxygenReserve((prev) => Math.max(50, prev - 2))}
                    className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-200 font-bold transition"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xl font-bold font-mono text-cyan-300 w-12 text-center">
                    {oxygenReserve}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setOxygenReserve((prev) => Math.min(100, prev + 2))}
                    className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-200 font-bold transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Input 8: General Beds */}
            <div className="p-3 rounded-xl bg-[#0a1120] border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  General Beds
                </span>
                <span className="text-[10px] font-mono text-slate-400">Free / Total</span>
              </div>
              <div className="flex items-center justify-between pt-1 font-mono">
                <span className="text-base font-bold text-white">
                  {freeBeds} <span className="text-xs text-slate-400 font-normal">/ {totalBeds}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setFreeBeds((prev) => Math.max(0, prev - 2))}
                  className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 hover:bg-slate-700"
                >
                  Admit -2
                </button>
              </div>
            </div>
          </div>

          {/* Diversion Status Selection: Free vs Not Free */}
          <div className="p-3.5 rounded-xl bg-[#0a1120] border border-slate-800 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
              Emergency Receiving Diversion Status:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setDiversionStatus('operational')}
                className={`p-3 rounded-xl border text-left transition flex items-center gap-2.5 ${
                  diversionStatus === 'operational'
                    ? 'bg-emerald-950/60 border-emerald-500 shadow-md ring-1 ring-emerald-400'
                    : 'bg-[#070c18] border-slate-800 hover:border-slate-700'
                }`}
              >
                <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
                <div>
                  <span className="font-bold text-xs text-emerald-300 block">
                    FREE (Accepting Code Red)
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    Trauma bays open for Dijkstra
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDiversionStatus('advisory')}
                className={`p-3 rounded-xl border text-left transition flex items-center gap-2.5 ${
                  diversionStatus === 'advisory'
                    ? 'bg-amber-950/60 border-amber-500 shadow-md ring-1 ring-amber-400'
                    : 'bg-[#070c18] border-slate-800 hover:border-slate-700'
                }`}
              >
                <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
                <div>
                  <span className="font-bold text-xs text-amber-300 block">
                    LIMITED (Advisory Only)
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    High bay occupancy
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDiversionStatus('divert')}
                className={`p-3 rounded-xl border text-left transition flex items-center gap-2.5 ${
                  diversionStatus === 'divert'
                    ? 'bg-rose-950/60 border-rose-500 shadow-md ring-1 ring-rose-400'
                    : 'bg-[#070c18] border-slate-800 hover:border-slate-700'
                }`}
              >
                <span className="w-3 h-3 rounded-full bg-rose-500 shrink-0" />
                <div>
                  <span className="font-bold text-xs text-rose-300 block">
                    NOT FREE (Divert Full)
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    Dijkstra bypasses this hospital
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Save Button Row */}
          <div className="flex items-center justify-between pt-2">
            <div>
              {savedSuccess && (
                <span className="text-emerald-400 text-xs font-bold flex items-center gap-1.5 animate-pulse">
                  <CheckCircle2 className="w-4 h-4" />
                  Capacity Synced to Dijkstra Solver!
                </span>
              )}
            </div>

            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-950 transition active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Save &amp; Update Capacity</span>
            </button>
          </div>
        </form>
      </div>

      {/* SEND MEMO & LIVE CAD BROADCASTS */}
      <div className="bg-[#0e1628] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100">
              Hospital Dispatch Memos &amp; Telemetry Notices
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            Direct Link to Central 108 CAD
          </span>
        </div>

        {/* Memo Input */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <input
            type="text"
            placeholder="Post instant memo to Kerala 108 CAD (e.g. Cath Lab clear, 2 trauma bays prepped for polytrauma)..."
            value={customNotice}
            onChange={(e) => setCustomNotice(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleQuickBroadcast()}
            className="flex-1 px-3 py-2 rounded-xl bg-[#070c18] border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-cyan-400"
          />
          <button
            type="button"
            onClick={handleQuickBroadcast}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Memo</span>
          </button>
        </div>

        {memoSentSuccess && (
          <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Telemetry Memo successfully broadcasted to Kerala 108 Central CAD!</span>
          </div>
        )}

        {/* Active Memos Feed */}
        <div className="space-y-2 pt-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">
            Recent Hospital Bulletins:
          </span>
          <div className="space-y-1.5">
            {memos.map((m) => (
              <div
                key={m.id}
                className="p-2.5 rounded-xl bg-[#070c18] border border-slate-800/80 flex items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-0.5">
                  <p className="text-slate-200 font-medium">{m.message}</p>
                  <span className="text-[10px] text-slate-500 font-mono">By: {m.author}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                    {m.time}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RECENT INCIDENTS & REPORTS TO THIS PARTICULAR HOSPITAL */}
      <div className="bg-[#0e1628] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-rose-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100">
              Recent Incidents &amp; Reports to {hospital.name.split(',')[0]}
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            {hospitalIncidents.length} Records Directed Here
          </span>
        </div>

        {hospitalIncidents.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400 bg-[#070c18] rounded-xl border border-slate-800">
            <span>No incoming or recorded emergency incidents assigned to this hospital yet.</span>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80 border border-slate-800 rounded-xl overflow-hidden bg-[#070c18]">
            {hospitalIncidents.map((inc) => {
              const assignedAmb = ambulances.find((a) => a.id === inc.assignedAmbulanceId);
              const isRed = inc.severity.includes('Red');

              return (
                <div
                  key={inc.id}
                  className="p-3.5 hover:bg-slate-800/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white text-xs">{inc.code}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isRed
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}
                      >
                        {inc.severity}
                      </span>
                      {inc.isVerifiedByAi && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800 flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
                          {inc.aiVerification?.confidenceScore || 98.6}% AI Verified
                        </span>
                      )}
                    </div>

                    <p className="text-slate-300 font-medium text-xs">{inc.title}</p>
                    <p className="text-slate-400 text-[11px]">{inc.locationDetails}</p>

                    <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400 pt-0.5">
                      <span>Casualties: <strong className="text-rose-400">{inc.casualties}</strong></span>
                      <span>·</span>
                      <span>Unit: <strong className="text-amber-300">{assignedAmb ? assignedAmb.name : 'Allocated'}</strong></span>
                      <span>·</span>
                      <span>{inc.timestamp}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setInspectedIncident(inc)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-700 text-cyan-300 text-xs font-bold transition active:scale-95"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Inspect Clinical Report</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Incident Detail Inspection Modal */}
      <InspectIncidentModal
        incident={inspectedIncident}
        nodes={nodes}
        ambulances={ambulances}
        isOpen={!!inspectedIncident}
        onClose={() => setInspectedIncident(null)}
        onOpenPhotoPreview={onOpenPhotoPreview}
      />
    </div>
  );
};
