import React, { useState } from 'react';
import { X, Siren, AlertTriangle, Upload, Check, MapPin, Plus } from 'lucide-react';
import { GraphNode, IncidentReport } from '../data/mockData';

interface ReportAccidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodes: Record<string, GraphNode>;
  onSubmitReport: (report: Partial<IncidentReport>) => void;
}

export const ReportAccidentModal: React.FC<ReportAccidentModalProps> = ({
  isOpen,
  onClose,
  nodes,
  onSubmitReport
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('vytilla_junction');
  const [locationDetails, setLocationDetails] = useState('Vytilla NH 66 Underpass near Metro Pillar 842, Ernakulam');
  const [severity, setSeverity] = useState<'Code Red • Critical' | 'Code Yellow • High' | 'Code Green • Moderate'>('Code Red • Critical');
  const [casualties, setCasualties] = useState(3);
  const [vehicles, setVehicles] = useState(2);
  const [callerName, setCallerName] = useState('George Mathew');
  const [callerPhone, setCallerPhone] = useState('+91 98470 12345');
  const [notes, setNotes] = useState('Multi-vehicle collision with smoke and visible passenger entrapment.');
  const [availableTags, setAvailableTags] = useState<string[]>([
    'Trapped Passengers',
    'Fuel Spillage / Leak',
    'Road Completely Blocked',
    'Active Fire / Flames',
    'Power Lines Down',
    'Pedestrian Struck'
  ]);
  const [selectedTags, setSelectedTags] = useState<string[]>([
    'Trapped Passengers',
    'Fuel Spillage / Leak',
    'Road Completely Blocked'
  ]);
  const [newTagInput, setNewTagInput] = useState('');

  if (!isOpen) return null;

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleAddNewTag = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newTagInput.trim();
    if (!trimmed) return;
    if (!availableTags.includes(trimmed)) {
      setAvailableTags((prev) => [...prev, trimmed]);
    }
    if (!selectedTags.includes(trimmed)) {
      setSelectedTags((prev) => [...prev, trimmed]);
    }
    setNewTagInput('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetNode = nodes[selectedNodeId];
    const reportCode = `ACC-2026-${Math.floor(100 + Math.random() * 900)}`;

    onSubmitReport({
      id: reportCode,
      code: reportCode,
      title: `${targetNode ? targetNode.name : 'Unknown Location'}, Reported Incident`,
      locationDetails,
      severity,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      nodeId: selectedNodeId,
      casualties,
      vehiclesInvolved: vehicles,
      tags: selectedTags,
      statusStep: 1, // Freshly reported
      sceneDocuments: [
        {
          id: `doc-${Date.now()}`,
          name: 'accident_scene_overview.jpg',
          size: '1.4 MB',
          type: 'image',
          url: '/src/assets/images/accident_scene_overview_1792007786071.jpg'
        }
      ],
      logs: [
        {
          id: `log-${Date.now()}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase(),
          title: 'Accident Reported by Citizen',
          description: `Caller ${callerName} (${callerPhone}) reported: ${notes}`,
          author: `Citizen ${callerName}`
        }
      ]
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#0e1628] border border-slate-700/80 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-red-950/80 via-[#0a1120] to-[#0a1120] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
              <Siren className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Submit Emergency Accident Report
              </h3>
              <p className="text-xs text-slate-400">
                Live graph optimization engine will compute nearest ambulance &amp; hospital ICU
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Junction Selection */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Accident Junction / Node Location
            </label>
            <select
              value={selectedNodeId}
              onChange={(e) => setSelectedNodeId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[#070d18] border border-slate-700 text-slate-100 focus:outline-none focus:border-red-500"
            >
              {Object.values(nodes).map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name} ({n.type.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          {/* Location Landmark */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Specific Landmark &amp; Direction
            </label>
            <input
              type="text"
              value={locationDetails}
              onChange={(e) => setLocationDetails(e.target.value)}
              placeholder="e.g. Southbound Lane 2, near Mile Marker 14"
              className="w-full px-3 py-2 rounded-xl bg-[#070d18] border border-slate-700 text-slate-100 focus:outline-none focus:border-red-500"
              required
            />
          </div>

          {/* Severity & Casualties */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Triage Severity
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-[#070d18] border border-slate-700 text-slate-100 focus:outline-none focus:border-red-500"
              >
                <option value="Code Red • Critical">Code Red • Critical</option>
                <option value="Code Yellow • High">Code Yellow • High</option>
                <option value="Code Green • Moderate">Code Green • Moderate</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Estimated Casualties
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={casualties}
                onChange={(e) => setCasualties(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 rounded-xl bg-[#070d18] border border-slate-700 text-slate-100 focus:outline-none focus:border-red-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Vehicles Involved
              </label>
              <input
                type="number"
                min={1}
                max={15}
                value={vehicles}
                onChange={(e) => setVehicles(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 rounded-xl bg-[#070d18] border border-slate-700 text-slate-100 focus:outline-none focus:border-red-500 font-mono"
              />
            </div>
          </div>

          {/* Hazard Tags */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-slate-300 font-semibold text-xs">
                Identified Hazards &amp; Scene Conditions
              </label>
              <span className="text-[11px] text-slate-400 font-mono">
                {selectedTags.length} selected
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-rose-950 text-rose-200 border-rose-600 shadow-sm shadow-rose-950'
                        : 'bg-[#070d18] text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span>{tag}</span>
                    {isSelected && <span className="text-rose-400 font-bold">✓</span>}
                  </button>
                );
              })}
            </div>

            {/* Input to enter a new hazard / scene condition */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddNewTag();
                  }
                }}
                placeholder="+ Enter new hazard or condition (e.g. Chemical Spill, Flooded Underpass)..."
                className="flex-1 px-3 py-1.5 rounded-xl bg-[#070d18] border border-slate-700 text-slate-100 placeholder:text-slate-500 text-xs focus:outline-none focus:border-red-500"
              />
              <button
                type="button"
                onClick={() => handleAddNewTag()}
                disabled={!newTagInput.trim()}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold text-slate-200 border border-slate-700 transition shrink-0"
              >
                <Plus className="w-3.5 h-3.5 text-rose-400" />
                <span>Add Hazard</span>
              </button>
            </div>
          </div>

          {/* Caller Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Reporting Citizen Name
              </label>
              <input
                type="text"
                value={callerName}
                onChange={(e) => setCallerName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#070d18] border border-slate-700 text-slate-100 focus:outline-none focus:border-red-500"
                required
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Callback Telephone
              </label>
              <input
                type="text"
                value={callerPhone}
                onChange={(e) => setCallerPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#070d18] border border-slate-700 text-slate-100 focus:outline-none focus:border-red-500 font-mono"
                required
              />
            </div>
          </div>

          {/* Situation Notes */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Field Situation Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#070d18] border border-slate-700 text-slate-100 focus:outline-none focus:border-red-500 resize-none"
            />
          </div>

          {/* Scene Photo Attach Notice */}
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Upload className="w-4 h-4 text-cyan-400" />
              <span className="text-slate-300">
                Pre-attaching verified scene telemetry photo (accident_scene_overview.jpg)
              </span>
            </div>
            <span className="text-emerald-400 font-mono text-[10px]">READY</span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-medium hover:bg-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold shadow-lg shadow-red-950 transition active:scale-95 flex items-center gap-2"
            >
              <Siren className="w-4 h-4" />
              <span>Dispatch Emergency Pipeline</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
