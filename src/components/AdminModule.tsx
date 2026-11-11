import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Truck,
  Building2,
  MapPin,
  Clock,
  Compass,
  ArrowRight,
  Shuffle,
  RefreshCw,
  Send,
  AlertTriangle,
  Play,
  RotateCcw,
  Zap,
  Sparkles,
  Bot,
  Eye,
  FileText
} from 'lucide-react';
import { InspectIncidentModal } from './InspectIncidentModal';
import {
  IncidentReport,
  GraphNode,
  GraphEdge,
  AmbulanceUnit,
  DispatchLog,
  DiversionStatus
} from '../types';
import {
  runDijkstra,
  runBFS,
  runDFS,
  findOptimalAmbulanceFromFleet,
  findOptimalReceivingHospital,
  PathResult
} from '../utils/graphAlgorithms';
import { sirenAudio } from '../utils/sirenSound';
import { RoadGraphVisualizer } from './RoadGraphVisualizer';
import { GoogleMapsVisualizer } from './GoogleMapsVisualizer';
import { DispatchLogSection } from './DispatchLogSection';
import { RecentIncidentsSection } from './RecentIncidentsSection';
import { TriagePerformanceOverview } from './TriagePerformanceOverview';

interface AdminModuleProps {
  incidents: IncidentReport[];
  activeIncident: IncidentReport;
  nodes: Record<string, GraphNode>;
  edges: GraphEdge[];
  ambulances: AmbulanceUnit[];
  onSelectIncident: (id: string) => void;
  onVerifyAndSolveDijkstra: (incidentId: string) => void;
  onAdvancePipelineStep: (incidentId: string, newStep: number) => void;
  onAssignAmbulance: (incidentId: string, ambulanceId: string) => void;
  onRelocateAmbulance: (ambulanceId: string, newNodeId: string) => void;
  onToggleHospitalStatus: (hospitalId: string, newStatus: DiversionStatus) => void;
  onToggleAmbulanceStatus?: (ambulanceId: string) => void;
  onEdgeCongestionChange: (edgeId: string) => void;
  onAddDispatchLog: (newLog: Omit<DispatchLog, 'id'>) => void;
  onOpenPhotoPreview: (url: string, title: string) => void;
  isAutoPipelineActive?: boolean;
  onToggleAutoPipeline?: () => void;
  pipelineCountdown?: number;
}

export const AdminModule: React.FC<AdminModuleProps> = ({
  incidents,
  activeIncident,
  nodes,
  edges,
  ambulances,
  onSelectIncident,
  onVerifyAndSolveDijkstra,
  onAdvancePipelineStep,
  onAssignAmbulance,
  onRelocateAmbulance,
  onToggleHospitalStatus,
  onToggleAmbulanceStatus,
  onEdgeCongestionChange,
  onAddDispatchLog,
  onOpenPhotoPreview,
  isAutoPipelineActive = true,
  onToggleAutoPipeline,
  pipelineCountdown = 10
}) => {
  const [adminMapViewMode, setAdminMapViewMode] = useState<'google' | 'schematic'>('google');
  const [fleetFilter, setFleetFilter] = useState<'all' | 'idle' | 'active'>('all');
  const [hospitalFilter, setHospitalFilter] = useState<'all' | 'free' | 'full'>('all');
  const [inspectedIncident, setInspectedIncident] = useState<IncidentReport | null>(null);

  // Currently assigned ambulance
  const assignedAmbulance = useMemo(() => {
    return ambulances.find((a) => a.id === activeIncident.assignedAmbulanceId) || ambulances[0];
  }, [ambulances, activeIncident.assignedAmbulanceId]);

  // Dynamically compute shortest path from the ASSIGNED AMBULANCE'S CURRENT LOCATION to incident
  const ambulanceRoute: PathResult = useMemo(() => {
    const startJunction = assignedAmbulance ? assignedAmbulance.currentLocationNodeId : 'station_vytilla';
    return runDijkstra(startJunction, activeIncident.nodeId, nodes, edges);
  }, [assignedAmbulance, activeIncident.nodeId, nodes, edges]);

  // Dynamically compute shortest path from incident to recommended hospital
  const hospitalRoute: PathResult = useMemo(() => {
    return runDijkstra(activeIncident.nodeId, activeIncident.targetHospitalId, nodes, edges);
  }, [activeIncident.nodeId, activeIncident.targetHospitalId, nodes, edges]);

  const hospitalList = Object.values(nodes).filter((n) => n.type === 'hospital');
  const junctionList = Object.values(nodes).filter((n) => n.type === 'junction' || n.type === 'ambulance_station');

  // Filtered lists
  const filteredAmbulances = ambulances.filter((a) => {
    if (fleetFilter === 'idle') return a.status === 'IDLE';
    if (fleetFilter === 'active') return a.status !== 'IDLE';
    return true;
  });

  const filteredHospitals = hospitalList.filter((h) => {
    if (hospitalFilter === 'free') return h.diversionStatus !== 'divert';
    if (hospitalFilter === 'full') return h.diversionStatus === 'divert';
    return true;
  });

  const unverifiedIncidents = incidents.filter((i) => !i.isVerifiedByAdmin);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* CAD Operational Command Status Header */}
      <div className="p-4 rounded-xl bg-[#090f1e] border border-cyan-800/60 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white uppercase tracking-wider text-sm">
                Central CAD Command &amp; Dispatch Console
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                CAD CHIEF sarah.chen
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-0.5">
              Verify incoming citizen 108 incident calls, compute weighted Dijkstra routes &amp; supervise fleet
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 font-mono text-[11px] text-slate-300">
          <div>
            <span className="text-slate-500">Fleet:</span>{' '}
            <strong className="text-emerald-400">
              {ambulances.filter((a) => a.status === 'IDLE').length} Idle
            </strong>{' '}
            /{' '}
            <strong className="text-amber-400">
              {ambulances.filter((a) => a.status !== 'IDLE').length} Active
            </strong>
          </div>
          <span>·</span>
          <div>
            <span className="text-slate-500">Unverified Queue:</span>{' '}
            <strong className={unverifiedIncidents.length > 0 ? 'text-rose-400 font-bold' : 'text-slate-400'}>
              {unverifiedIncidents.length} Pending
            </strong>
          </div>
        </div>
      </div>

      {/* Triage Performance Overview Dashboard (Recharts: Bar & Line Charts) */}
      <TriagePerformanceOverview incidents={incidents} />

      {/* STEP 1: AI AUTOMATED INCIDENT VERIFICATION & DIJKSTRA ALLOCATION */}
      <div className="bg-[#0e1628] border-2 border-cyan-500/40 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>AI Automated Incident Verification &amp; Dijkstra Engine</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-cyan-300 font-mono">
                Tracking: {activeIncident.code}
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Accidents are automatically verified by Gemini AI in real time; admins receive instant notifications and can inspect routes on the CAD map.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {activeIncident.isVerifiedByAdmin || activeIncident.isVerifiedByAi ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-950/80 to-teal-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-semibold shadow-md shadow-emerald-950/40">
                <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" style={{ animationDuration: '4s' }} />
                <span>AI Auto-Verified (Gemini 3.8 Flash)</span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-emerald-900/80 text-emerald-200">
                  {activeIncident.aiVerification?.confidenceScore || 98.6}%
                </span>
              </div>
            ) : (
              <button
                onClick={() => onVerifyAndSolveDijkstra(activeIncident.id)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-cyan-950 flex items-center gap-2 animate-pulse"
              >
                <Sparkles className="w-4 h-4 text-cyan-200" />
                <span>Run AI Auto-Verification</span>
              </button>
            )}

            {/* Inspect Report Button */}
            <button
              onClick={() => setInspectedIncident(activeIncident)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 text-xs font-bold transition shadow-sm"
              title="Inspect complete incident clinical CAD dossier"
            >
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>Inspect Report</span>
            </button>

            {/* Direct Jump to CAD Map Button */}
            <button
              onClick={() => {
                const mapEl = document.getElementById('cad-map-section');
                if (mapEl) {
                  mapEl.scrollIntoView({ behavior: 'smooth' });
                  mapEl.classList.add('ring-2', 'ring-cyan-400');
                  setTimeout(() => mapEl.classList.remove('ring-2', 'ring-cyan-400'), 1500);
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/70 hover:bg-cyan-900/90 border border-cyan-700 text-cyan-300 text-xs font-bold transition shadow-sm"
              title="Center and view active incident on CAD map"
            >
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>View on Map</span>
            </button>
          </div>
        </div>

        {/* AI Verification Intelligence Card */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-[#091322] via-[#091120] to-[#070c18] border border-cyan-800/50 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-700 uppercase">
                Triage Confidence: {activeIncident.aiVerification?.confidenceScore || 98.6}%
              </span>
              <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800">
                {activeIncident.severity}
              </span>
              <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                Status: Auto-Dispatched
              </span>
            </div>

            <div className="text-[11px] text-slate-400 font-mono">
              Model: <strong className="text-slate-200">{activeIncident.aiVerification?.model || 'Gemini 3.8 Flash'}</strong>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {activeIncident.aiVerification?.reasoning ||
              `AI verified location at ${activeIncident.locationDetails} with ${activeIncident.casualties} casualty report. Dijkstra allocated unit ${assignedAmbulance?.name || 'Bravo 2'} to receiving trauma center.`}
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-400">
            <span className="text-slate-500 font-bold uppercase text-[10px]">Detected CAD Vectors:</span>
            {(activeIncident.aiVerification?.detectedRisks || [
              'Zero false-positive signal',
              'Multiple casualty trauma alert',
              'Green corridor priority recommended'
            ]).map((risk, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-full bg-slate-800/90 border border-slate-700 text-slate-300 text-[10px]"
              >
                ✓ {risk}
              </span>
            ))}
          </div>
        </div>

        {/* 6-step progress pipeline tracker with Dispatcher Click-to-Advance & Automatic Updation */}
        <div className="space-y-2 pt-2">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-bold uppercase tracking-wider">
                Emergency CAD Pipeline
              </span>
              {onToggleAutoPipeline && (
                <button
                  type="button"
                  onClick={onToggleAutoPipeline}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center gap-1.5 transition border ${
                    isAutoPipelineActive
                      ? 'bg-emerald-950/70 border-emerald-600/60 text-emerald-300'
                      : 'bg-amber-950/70 border-amber-600/60 text-amber-300'
                  }`}
                  title="Toggle automatic CAD pipeline advancement"
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isAutoPipelineActive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                  <span>
                    {isAutoPipelineActive
                      ? `Auto-Updation: ON (${pipelineCountdown}s)`
                      : 'Auto-Updation: PAUSED'}
                  </span>
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-[11px]">
              <span className="text-slate-500 hidden sm:inline">Click any step to set live status</span>
              <span className="text-slate-600 hidden sm:inline">•</span>
              <span className="font-bold">Step {activeIncident.statusStep} of 6</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {[
              { step: 1, title: 'Reported', desc: 'Queued in CAD' },
              { step: 2, title: 'AI Verified', desc: 'Auto-verified by Gemini' },
              { step: 3, title: 'Ambulance En Route', desc: 'Sirens active' },
              { step: 4, title: 'On Scene', desc: 'Paramedics treating' },
              { step: 5, title: 'Hospital Transit', desc: 'Transporting to ICU' },
              { step: 6, title: 'Resolved', desc: 'Patient admitted' }
            ].map((s) => {
              const isPast = s.step < activeIncident.statusStep;
              const isCurrent = s.step === activeIncident.statusStep;

              return (
                <div
                  key={s.step}
                  onClick={() => onAdvancePipelineStep(activeIncident.id, s.step)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer text-left ${
                    isCurrent
                      ? 'bg-rose-950/60 border-rose-500 shadow-md ring-1 ring-rose-500'
                      : isPast
                      ? 'bg-[#0a1120] border-emerald-900/60 hover:border-slate-700'
                      : 'bg-[#070d18] border-slate-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono text-slate-400">STEP 0{s.step}</span>
                    {isPast ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : isCurrent ? (
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                    ) : null}
                  </div>
                  <div className={`text-xs font-bold ${isCurrent ? 'text-white' : isPast ? 'text-emerald-300' : 'text-slate-400'}`}>
                    {s.title}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5 truncate">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* STEP 2: DYNAMIC WEIGHTED GRAPH & MAP CORRESPONDING TO AMBULANCE LOCATION */}
      <div id="cad-map-section" className="space-y-3 scroll-mt-24 transition-all duration-300 rounded-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs px-1">
          <div>
            <span className="font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              Dynamic Dijkstra Shortest Route Traversal
            </span>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Graph origin corresponds to current ambulance location ({assignedAmbulance?.name || 'Unit'}) → Incident ({nodes[activeIncident.nodeId]?.name}) → Optimal Hospital ({nodes[activeIncident.targetHospitalId]?.name})
            </p>
          </div>

          {/* Map View Switcher */}
          <div className="flex items-center bg-[#0a1120] border border-slate-800 p-1 rounded-xl text-xs">
            <button
              onClick={() => setAdminMapViewMode('google')}
              className={`flex items-center gap-1.5 px-3 py-1.5 font-semibold rounded-lg transition-all ${
                adminMapViewMode === 'google'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>Google Maps™ (Live Data)</span>
            </button>
            <button
              onClick={() => setAdminMapViewMode('schematic')}
              className={`px-3 py-1.5 font-semibold rounded-lg transition-all ${
                adminMapViewMode === 'schematic'
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Schematic Weighted Graph
            </button>
          </div>
        </div>

        {adminMapViewMode === 'google' ? (
          <GoogleMapsVisualizer
            nodes={nodes}
            ambulances={ambulances}
            activeIncident={activeIncident}
            onRelocateAmbulance={onRelocateAmbulance}
            onSelectIncident={onSelectIncident}
          />
        ) : (
          <RoadGraphVisualizer
            nodes={nodes}
            edges={edges}
            activeIncident={{
              ...activeIncident,
              assignedStationId: assignedAmbulance ? assignedAmbulance.currentLocationNodeId : 'station_vytilla'
            }}
            onEdgeCongestionChange={onEdgeCongestionChange}
            onNodeSelect={(nodeId) => {
              const matchingInc = incidents.find((i) => i.nodeId === nodeId);
              if (matchingInc) onSelectIncident(matchingInc.id);
            }}
          />
        )}
      </div>

      {/* STEP 3: LIST OF AMBULANCES IN ERNAKULAM (FREE VS NOT FREE) */}
      <div className="bg-[#0e1628] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-950/80 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100">
                Kerala 108 Ambulance Fleet (Ernakulam)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Monitor and toggle Free vs. Not Free emergency units across stations
              </p>
            </div>
          </div>

          {/* Active vs Idle Filter Tabs */}
          <div className="flex items-center bg-[#070d18] border border-slate-800 p-1 rounded-xl text-xs">
            <button
              onClick={() => setFleetFilter('all')}
              className={`px-3 py-1 font-semibold rounded-lg transition ${
                fleetFilter === 'all' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({ambulances.length})
            </button>
            <button
              onClick={() => setFleetFilter('idle')}
              className={`px-3 py-1 font-semibold rounded-lg transition ${
                fleetFilter === 'idle' ? 'bg-emerald-800 text-white' : 'text-emerald-400 hover:text-white'
              }`}
            >
              Free / Available ({ambulances.filter((a) => a.status === 'IDLE').length})
            </button>
            <button
              onClick={() => setFleetFilter('active')}
              className={`px-3 py-1 font-semibold rounded-lg transition ${
                fleetFilter === 'active' ? 'bg-amber-800 text-white' : 'text-amber-400 hover:text-white'
              }`}
            >
              Not Free / Busy ({ambulances.filter((a) => a.status !== 'IDLE').length})
            </button>
          </div>
        </div>

        {/* Ambulance Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
          {filteredAmbulances.map((amb) => {
            const isAssignedToActive = amb.id === activeIncident.assignedAmbulanceId;
            const currentLocationNode = nodes[amb.currentLocationNodeId];
            const isFree = amb.status === 'IDLE';

            return (
              <div
                key={amb.id}
                className={`p-3.5 rounded-xl border transition flex flex-col justify-between ${
                  isAssignedToActive
                    ? 'bg-[#121a30] border-amber-500 shadow-md ring-1 ring-amber-500'
                    : 'bg-[#0a1120] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="font-mono text-xs font-bold text-slate-100">{amb.code}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                        isFree
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse'
                      }`}
                    >
                      {isFree ? 'FREE (AVAILABLE)' : 'NOT FREE (BUSY)'}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-white truncate mb-1">{amb.name}</h4>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1 mb-2">
                    <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                    <span className="truncate">{currentLocationNode?.shortName || amb.currentLocationNodeId}</span>
                  </div>

                  <div className="text-[10px] text-slate-400 space-y-0.5 font-mono pt-2 border-t border-slate-800">
                    <div>Lead: <span className="text-slate-200">{amb.lead}</span></div>
                    <div>Driver: <span className="text-slate-200">{amb.driver}</span></div>
                    <div>Tier: <span className="text-cyan-300">{amb.level}</span></div>
                  </div>
                </div>

                <div className="pt-3 mt-2 border-t border-slate-800 space-y-2">
                  {/* Relocate ambulance junction dropdown */}
                  <select
                    value={amb.currentLocationNodeId}
                    onChange={(e) => onRelocateAmbulance(amb.id, e.target.value)}
                    className="w-full text-[10px] bg-[#070c18] border border-slate-700 text-slate-300 rounded px-1.5 py-1 focus:outline-none focus:border-cyan-400 font-mono"
                    title="Change Ambulance Current Location"
                  >
                    {junctionList.map((j) => (
                      <option key={j.id} value={j.id}>
                        Loc: {j.shortName}
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center gap-1.5">
                    {onToggleAmbulanceStatus && (
                      <button
                        type="button"
                        onClick={() => onToggleAmbulanceStatus(amb.id)}
                        className={`flex-1 py-1 rounded text-[10px] font-bold font-mono transition text-center ${
                          isFree
                            ? 'bg-amber-950/70 hover:bg-amber-900 border border-amber-800 text-amber-300'
                            : 'bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-800 text-emerald-300'
                        }`}
                        title="Toggle Free / Not Free status"
                      >
                        {isFree ? 'Mark Not Free' : 'Mark Free'}
                      </button>
                    )}

                    {!isAssignedToActive && (
                      <button
                        onClick={() => onAssignAmbulance(activeIncident.id, amb.id)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 text-[10px] font-bold whitespace-nowrap transition"
                        title="Assign this ambulance to active incident"
                      >
                        Assign
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* STEP 4: LIST OF HOSPITALS IN ERNAKULAM WITH CAPACITY STATUS (FREE OR NOT FREE) */}
      <div className="bg-[#0e1628] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100">
                Hospital Network Status (Free vs. Not Free)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Trauma center availability for shortest-path Dijkstra patient allocation
              </p>
            </div>
          </div>

          {/* Hospital Filter Tabs */}
          <div className="flex items-center bg-[#070d18] border border-slate-800 p-1 rounded-xl text-xs">
            <button
              onClick={() => setHospitalFilter('all')}
              className={`px-3 py-1 font-semibold rounded-lg transition ${
                hospitalFilter === 'all' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({hospitalList.length})
            </button>
            <button
              onClick={() => setHospitalFilter('free')}
              className={`px-3 py-1 font-semibold rounded-lg transition ${
                hospitalFilter === 'free' ? 'bg-emerald-800 text-white' : 'text-emerald-400 hover:text-white'
              }`}
            >
              Free / Accepting ({hospitalList.filter((h) => h.diversionStatus !== 'divert').length})
            </button>
            <button
              onClick={() => setHospitalFilter('full')}
              className={`px-3 py-1 font-semibold rounded-lg transition ${
                hospitalFilter === 'full' ? 'bg-rose-800 text-white' : 'text-rose-400 hover:text-white'
              }`}
            >
              Not Free / Full ({hospitalList.filter((h) => h.diversionStatus === 'divert').length})
            </button>
          </div>
        </div>

        {/* Hospital Roster Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-800 rounded-xl overflow-hidden">
            <thead className="bg-[#070d18] text-slate-400 font-mono uppercase text-[10px]">
              <tr>
                <th className="p-3">Hospital Name</th>
                <th className="p-3">Trauma Rating</th>
                <th className="p-3 text-right">Dedicated ICU</th>
                <th className="p-3 text-right">Free / Total Beds</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {filteredHospitals.map((hosp) => {
                const isAssignedReceiving = hosp.id === activeIncident.targetHospitalId;
                const isFull = hosp.diversionStatus === 'divert';

                return (
                  <tr
                    key={hosp.id}
                    className={`hover:bg-slate-800/30 transition-colors ${
                      isAssignedReceiving ? 'bg-emerald-950/20' : ''
                    }`}
                  >
                    <td className="p-3 font-bold text-slate-100 flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${isFull ? 'bg-rose-500' : 'bg-emerald-400'}`} />
                      <span>{hosp.name}</span>
                      {isAssignedReceiving && (
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700 font-mono">
                          ASSIGNED BY DIJKSTRA
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-slate-400 text-[11px]">{hosp.traumaLevel || 'Level 1'}</td>
                    <td className="p-3 text-right font-mono font-bold text-amber-300">
                      {hosp.icuAvailable} Beds
                    </td>
                    <td className="p-3 text-right font-mono text-slate-200">
                      {hosp.beds?.free} / {hosp.beds?.total} Free
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                          isFull
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}
                      >
                        {isFull ? 'NOT FREE (FULL / DIVERT)' : 'FREE (ACCEPTING)'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() =>
                          onToggleHospitalStatus(hosp.id, isFull ? 'operational' : 'divert')
                        }
                        className={`px-2.5 py-1 rounded text-[10px] font-bold transition font-mono ${
                          isFull
                            ? 'bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200'
                            : 'bg-rose-900/60 hover:bg-rose-800 text-rose-200'
                        }`}
                      >
                        {isFull ? 'Mark Free' : 'Mark Not Free'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* STEP 5: DISPATCH LOGS & INCIDENT SELECTOR */}
      <DispatchLogSection
        logs={activeIncident.logs}
        userRole="dispatch"
        onAddLog={onAddDispatchLog}
      />

      <RecentIncidentsSection
        incidents={incidents}
        activeIncidentId={activeIncident.id}
        onSelectIncident={onSelectIncident}
        onInspectIncident={(inc) => setInspectedIncident(inc)}
      />

      {/* Inspect Incident CAD Dossier Modal */}
      <InspectIncidentModal
        incident={inspectedIncident}
        nodes={nodes}
        ambulances={ambulances}
        isOpen={!!inspectedIncident}
        onClose={() => setInspectedIncident(null)}
        onOpenPhotoPreview={onOpenPhotoPreview}
        onViewOnMap={(incId) => {
          setInspectedIncident(null);
          onSelectIncident(incId);
          const mapEl = document.getElementById('cad-map-section');
          if (mapEl) {
            mapEl.scrollIntoView({ behavior: 'smooth' });
            mapEl.classList.add('ring-2', 'ring-cyan-400');
            setTimeout(() => mapEl.classList.remove('ring-2', 'ring-cyan-400'), 1500);
          }
        }}
      />
    </div>
  );
};
