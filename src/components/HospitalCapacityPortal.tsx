import React, { useState } from 'react';
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
  Zap
} from 'lucide-react';
import { GraphNode } from '../data/mockData';
import { sirenAudio } from '../utils/sirenSound';

interface HospitalCapacityPortalProps {
  hospitalId: string;
  nodes: Record<string, GraphNode>;
  onUpdateHospitalCapacity: (
    hospitalId: string,
    updates: {
      freeBeds: number;
      totalBeds: number;
      icuAvailable: number;
      diversionStatus: 'operational' | 'advisory' | 'divert';
      ventilatorsAvailable?: number;
    }
  ) => void;
  onBroadcastHospitalNotice: (message: string) => void;
  onSelectHospitalId: (hospitalId: string) => void;
}

export const HospitalCapacityPortal: React.FC<HospitalCapacityPortalProps> = ({
  hospitalId,
  nodes,
  onUpdateHospitalCapacity,
  onBroadcastHospitalNotice,
  onSelectHospitalId
}) => {
  const hospital = nodes[hospitalId] || Object.values(nodes).find((n) => n.type === 'hospital');
  if (!hospital) return null;

  const [freeBeds, setFreeBeds] = useState<number>(hospital.beds?.free || 35);
  const [totalBeds, setTotalBeds] = useState<number>(hospital.beds?.total || 600);
  const [icuAvailable, setIcuAvailable] = useState<number>(hospital.icuAvailable || 6);
  const [ventilators, setVentilators] = useState<number>(hospital.ventilatorsAvailable || 8);
  const [diversionStatus, setDiversionStatus] = useState<'operational' | 'advisory' | 'divert'>(
    hospital.diversionStatus || 'operational'
  );
  const [customNotice, setCustomNotice] = useState<string>('');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Sync state if selected hospital changes
  React.useEffect(() => {
    if (hospital) {
      setFreeBeds(hospital.beds?.free || 35);
      setTotalBeds(hospital.beds?.total || 600);
      setIcuAvailable(hospital.icuAvailable || 6);
      setVentilators(hospital.ventilatorsAvailable || 8);
      setDiversionStatus(hospital.diversionStatus || 'operational');
    }
  }, [hospitalId]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    sirenAudio.playBeep(980, 150);

    onUpdateHospitalCapacity(hospital.id, {
      freeBeds,
      totalBeds,
      icuAvailable,
      diversionStatus,
      ventilatorsAvailable: ventilators
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleQuickBroadcast = () => {
    if (!customNotice.trim()) return;
    sirenAudio.playBeep(1100, 200);

    onBroadcastHospitalNotice(
      `[${hospital.name.split(',')[0]}] Duty Medical Officer: ${customNotice.trim()}`
    );
    setCustomNotice('');
  };

  const hospitalList = Object.values(nodes).filter((n) => n.type === 'hospital');

  return (
    <div className="bg-[#0e1628] border-2 border-emerald-500/40 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-6 relative overflow-hidden">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-400/50 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-950">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700 font-mono uppercase">
                Hospital Medical Administration Portal
              </span>
              <span className="flex items-center gap-1 text-[11px] font-bold text-cyan-400">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                Live Telemetry Active
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white mt-0.5">
              {hospital.name}
            </h3>
            <p className="text-xs text-slate-400">
              {hospital.traumaLevel || 'Level 1 Trauma Center'} · Emergency Desk: {hospital.emergencyPhone}
            </p>
          </div>
        </div>

        {/* Hospital Switcher for Medical Officer */}
        <div className="flex items-center gap-2 bg-[#070d18] border border-slate-800 p-2 rounded-xl">
          <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">
            Switch Facility:
          </span>
          <select
            value={hospital.id}
            onChange={(e) => onSelectHospitalId(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-[#0e1628] border border-slate-700 text-slate-200 text-xs font-semibold focus:outline-none focus:border-emerald-400"
          >
            {hospitalList.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name.split(',')[0]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Capacity & Availability Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Dedicated ICU Beds */}
          <div className="p-4 rounded-xl bg-[#0a1120] border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  Dedicated ICU Trauma Beds
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/80 text-amber-300 border border-amber-800/60 font-mono">
                  Code Red Critical
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mb-4">
                Units with dedicated cardiac monitors, arterial lines &amp; trauma teams ready.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIcuAvailable((prev) => Math.max(0, prev - 1))}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-200 font-bold transition"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-2xl font-black font-mono text-amber-400 w-12 text-center">
                  {icuAvailable}
                </span>
                <button
                  type="button"
                  onClick={() => setIcuAvailable((prev) => prev + 1)}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-200 font-bold transition"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <span className="text-xs text-slate-400 font-medium">Beds Available</span>
            </div>
          </div>

          {/* Card 2: General Free / Total Beds */}
          <div className="p-4 rounded-xl bg-[#0a1120] border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Inpatient General Capacity
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 font-mono">
                  {Math.round((freeBeds / totalBeds) * 100)}% Free
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mb-4">
                Available acute recovery beds for stable and step-down casualties.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFreeBeds((prev) => Math.max(0, prev - 2))}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-200 font-bold transition"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-2xl font-black font-mono text-emerald-400 w-16 text-center">
                  {freeBeds}
                </span>
                <button
                  type="button"
                  onClick={() => setFreeBeds((prev) => Math.min(totalBeds, prev + 2))}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-200 font-bold transition"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <span className="text-xs text-slate-400 font-medium">
                / {totalBeds} Total Beds
              </span>
            </div>
          </div>

          {/* Card 3: Ventilators Operational */}
          <div className="p-4 rounded-xl bg-[#0a1120] border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                  Ventilator &amp; Oxygen Resuscitation
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 font-mono">
                  Oxygen 98%
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mb-4">
                Mechanical ventilators primed for immediate severe thoracic/airway trauma.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setVentilators((prev) => Math.max(0, prev - 1))}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-200 font-bold transition"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-2xl font-black font-mono text-cyan-400 w-12 text-center">
                  {ventilators}
                </span>
                <button
                  type="button"
                  onClick={() => setVentilators((prev) => prev + 1)}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-200 font-bold transition"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <span className="text-xs text-slate-400 font-medium">Ventilators Primed</span>
            </div>
          </div>
        </div>

        {/* Receiving Bay & Diversion Status Radio Toggle */}
        <div className="p-4 rounded-xl bg-[#0a1120] border border-slate-800 space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
            Emergency Bay Diversion Status:
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setDiversionStatus('operational')}
              className={`p-3 rounded-xl border text-left transition flex items-start gap-3 ${
                diversionStatus === 'operational'
                  ? 'bg-emerald-950/50 border-emerald-500 shadow-md ring-1 ring-emerald-400'
                  : 'bg-[#070c18] border-slate-800 hover:border-slate-700'
              }`}
            >
              <span className="w-3 h-3 rounded-full bg-emerald-500 mt-0.5 shrink-0 animate-pulse" />
              <div>
                <span className="font-bold text-xs text-emerald-300 block">
                  Fully Operational (Accepting Code Red)
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5 block">
                  Trauma bays ready, active surgeon and anesthesiology on standby.
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setDiversionStatus('advisory')}
              className={`p-3 rounded-xl border text-left transition flex items-start gap-3 ${
                diversionStatus === 'advisory'
                  ? 'bg-amber-950/50 border-amber-500 shadow-md ring-1 ring-amber-400'
                  : 'bg-[#070c18] border-slate-800 hover:border-slate-700'
              }`}
            >
              <span className="w-3 h-3 rounded-full bg-amber-500 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold text-xs text-amber-300 block">
                  Advisory Divert (Capacity Constrained)
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5 block">
                  Limited ICU availability; dispatch system will prioritize secondary trauma hospitals.
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setDiversionStatus('divert')}
              className={`p-3 rounded-xl border text-left transition flex items-start gap-3 ${
                diversionStatus === 'divert'
                  ? 'bg-rose-950/50 border-rose-600 shadow-md ring-1 ring-rose-500'
                  : 'bg-[#070c18] border-slate-800 hover:border-slate-700'
              }`}
            >
              <span className="w-3 h-3 rounded-full bg-rose-500 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold text-xs text-rose-300 block">
                  Critical Divert (Full Bypass)
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5 block">
                  Emergency bay at maximum saturation; all ambulances automatically rerouted.
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-3 border-t border-slate-800">
          {/* Quick Notice to Dispatchers */}
          <div className="flex-1 flex items-center gap-2">
            <input
              type="text"
              placeholder="Post instant operational memo to Kerala 108 Dispatchers (e.g. CT Scanner back online)..."
              value={customNotice}
              onChange={(e) => setCustomNotice(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl bg-[#070c18] border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-cyan-400"
            />
            <button
              type="button"
              onClick={handleQuickBroadcast}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Broadcast</span>
            </button>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {savedSuccess && (
              <span className="text-emerald-400 text-xs font-bold flex items-center gap-1 animate-pulse">
                <CheckCircle2 className="w-4 h-4" />
                Updated &amp; Synced to Dijkstra Engine!
              </span>
            )}

            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-950 transition active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Save &amp; Update Live Capacity</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
