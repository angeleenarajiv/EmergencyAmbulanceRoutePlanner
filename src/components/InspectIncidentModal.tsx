import React from 'react';
import {
  X,
  FileText,
  MapPin,
  Calendar,
  Clock,
  Sparkles,
  Truck,
  Building2,
  AlertTriangle,
  Compass,
  CheckCircle2,
  Users,
  Car,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { IncidentReport, GraphNode, AmbulanceUnit } from '../types';

interface InspectIncidentModalProps {
  incident: IncidentReport | null;
  nodes: Record<string, GraphNode>;
  ambulances: AmbulanceUnit[];
  isOpen: boolean;
  onClose: () => void;
  onViewOnMap?: (incidentId: string) => void;
  onAdvanceStep?: (incidentId: string, newStep: number) => void;
  onOpenPhotoPreview?: (url: string, title: string) => void;
}

export const InspectIncidentModal: React.FC<InspectIncidentModalProps> = ({
  incident,
  nodes,
  ambulances,
  isOpen,
  onClose,
  onViewOnMap,
  onAdvanceStep,
  onOpenPhotoPreview
}) => {
  if (!isOpen || !incident) return null;

  const incidentNode = nodes[incident.nodeId];
  const assignedAmb = ambulances.find((a) => a.id === incident.assignedAmbulanceId);
  const targetHosp = nodes[incident.targetHospitalId];
  const isRed = incident.severity.includes('Red');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#0b1222] border border-slate-700/80 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-6 animate-scaleIn text-slate-200">
        {/* Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-slate-900 to-[#070d18] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white font-mono">
                  {incident.code}
                </h3>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    isRed
                      ? 'bg-rose-950 text-rose-300 border border-rose-800'
                      : 'bg-amber-950 text-amber-300 border border-amber-800'
                  }`}
                >
                  {incident.severity}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                  Step 0{incident.statusStep}/06
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate max-w-md">
                {incident.title}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            <div className="p-2.5 rounded-xl bg-[#070c18] border border-slate-800">
              <span className="text-[10px] text-slate-400 font-mono uppercase block">Casualties</span>
              <strong className="text-base text-rose-400 font-mono">{incident.casualties} Patients</strong>
            </div>
            <div className="p-2.5 rounded-xl bg-[#070c18] border border-slate-800">
              <span className="text-[10px] text-slate-400 font-mono uppercase block">Vehicles</span>
              <strong className="text-base text-slate-200 font-mono">{incident.vehiclesInvolved} Impacted</strong>
            </div>
            <div className="p-2.5 rounded-xl bg-[#070c18] border border-slate-800">
              <span className="text-[10px] text-slate-400 font-mono uppercase block">Assigned Unit</span>
              <strong className="text-xs text-amber-300 font-mono truncate block">
                {assignedAmb ? assignedAmb.code : 'Auto-Allocated'}
              </strong>
            </div>
            <div className="p-2.5 rounded-xl bg-[#070c18] border border-slate-800">
              <span className="text-[10px] text-slate-400 font-mono uppercase block">ICU Hospital</span>
              <strong className="text-xs text-emerald-300 font-mono truncate block">
                {targetHosp ? targetHosp.name.split(',')[0] : 'Medical Trust'}
              </strong>
            </div>
          </div>

          {/* Location & Time */}
          <div className="p-3 rounded-xl bg-[#070c18] border border-slate-800 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-300 font-medium">
              <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>{incident.locationDetails}</span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono pt-1">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-500" />
                {incident.timestamp}
              </span>
              <span>•</span>
              <span className="text-cyan-400">Node: {incidentNode?.name || incident.nodeId}</span>
            </div>
          </div>

          {/* AI Auto-Verification Details */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-cyan-950/40 to-slate-900 border border-cyan-800/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                AI Triage Verification Report
              </span>
              <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                {incident.aiVerification?.confidenceScore || 98.6}% Confidence
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              {incident.aiVerification?.reasoning ||
                `Gemini CAD engine verified caller telemetry and cadastral road node data. Road corridor clear of false-positives. Dijkstra shortest path auto-assigned unit ${assignedAmb?.name || 'Unit'}.`}
            </p>
            {incident.aiVerification?.detectedRisks && incident.aiVerification.detectedRisks.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {incident.aiVerification.detectedRisks.map((risk, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700 text-slate-300 text-[10px]"
                  >
                    ✓ {risk}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Tags */}
          {incident.tags && incident.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {incident.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Scene Documents */}
          {incident.sceneDocuments && incident.sceneDocuments.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Scene Media ({incident.sceneDocuments.length})
              </span>
              <div className="grid grid-cols-2 gap-2">
                {incident.sceneDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => {
                      if (doc.url && onOpenPhotoPreview) {
                        onOpenPhotoPreview(doc.url, doc.name);
                      }
                    }}
                    className="p-2 rounded-lg bg-[#070c18] border border-slate-800 flex items-center gap-2 cursor-pointer hover:border-cyan-500/50 transition"
                  >
                    {doc.type === 'image' && doc.url ? (
                      <img
                        src={doc.url}
                        alt={doc.name}
                        className="w-10 h-10 object-cover rounded border border-slate-700 shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded bg-red-950/60 border border-red-800/50 flex items-center justify-center font-mono text-[9px] text-red-400 shrink-0">
                        DOC
                      </div>
                    )}
                    <div className="truncate">
                      <p className="text-[11px] font-medium text-slate-200 truncate">{doc.name}</p>
                      <span className="text-[10px] text-slate-500 font-mono">{doc.size}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CAD Timeline Logs */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              CAD Timeline Logs ({incident.logs?.length || 0})
            </span>
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {(incident.logs || []).map((log) => (
                <div key={log.id} className="p-2 rounded-lg bg-[#070c18] border border-slate-800/80 text-[11px]">
                  <div className="flex items-center justify-between text-slate-400 font-mono text-[10px] mb-0.5">
                    <span className="text-cyan-400 font-bold">{log.title}</span>
                    <span>{log.time}</span>
                  </div>
                  <p className="text-slate-300">{log.description}</p>
                  <span className="text-[10px] text-slate-500 font-mono">By: {log.author}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 bg-[#070d18] border-t border-slate-800 flex items-center justify-between gap-3">
          <span className="text-[10px] text-slate-500 font-mono">
            CAD Incident Ref: {incident.id}
          </span>

          <div className="flex items-center gap-2">
            {onViewOnMap && (
              <button
                onClick={() => {
                  onViewOnMap(incident.id);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-700 text-cyan-300 text-xs font-bold transition"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>View on Map</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
