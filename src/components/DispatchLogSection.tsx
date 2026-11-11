import React, { useState } from 'react';
import { ShieldCheck, Send, Clock, PlusCircle } from 'lucide-react';
import { DispatchLog } from '../data/mockData';

interface DispatchLogSectionProps {
  logs: DispatchLog[];
  userRole: 'citizen' | 'dispatch';
  onAddLog: (newLog: Omit<DispatchLog, 'id'>) => void;
}

export const DispatchLogSection: React.FC<DispatchLogSectionProps> = ({
  logs,
  userRole,
  onAddLog
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim()) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase();

    onAddLog({
      time: timeStr,
      title: newTitle.trim(),
      description: newDescription.trim(),
      author: userRole === 'dispatch' ? 'Officer Sarah Chen' : 'Citizen Alex Rivera'
    });

    setNewTitle('');
    setNewDescription('');
    setShowAddForm(false);
  };

  return (
    <div className="bg-[#0e1628] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100">
            Live Dispatch Log &amp; Updates
          </h3>
        </div>

        {userRole === 'dispatch' && !showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Dispatch Entry</span>
          </button>
        )}
      </div>

      {/* Dispatch form if open */}
      {showAddForm && (
        <form
          onSubmit={handleSubmit}
          className="p-4 rounded-xl bg-[#090f1e] border border-cyan-800/40 space-y-3"
        >
          <div className="text-xs font-bold text-cyan-300">New Operational Telemetry Note</div>
          <input
            type="text"
            placeholder="Log Title (e.g. Paramedic On Scene, Trauma Bay Ready)"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg bg-[#0e1628] border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-400"
            required
          />
          <textarea
            placeholder="Action details, triage status, vitals transmission..."
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 text-xs rounded-lg bg-[#0e1628] border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-400 resize-none"
            required
          />
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 text-xs rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white"
            >
              <Send className="w-3 h-3" />
              <span>Broadcast Update</span>
            </button>
          </div>
        </form>
      )}

      {/* Log list */}
      <div className="divide-y divide-slate-800/60">
        {logs.map((log) => (
          <div
            key={log.id}
            className="py-3 sm:py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs hover:bg-slate-800/20 px-2 rounded-lg transition-colors"
          >
            <div className="flex items-start gap-3">
              <span className="font-mono text-cyan-400 font-semibold shrink-0 pt-0.5">
                {log.time}
              </span>
              <div>
                <h4 className="font-bold text-slate-100">{log.title}</h4>
                <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">
                  {log.description}
                </p>
              </div>
            </div>

            <div className="sm:self-center shrink-0">
              <span className="inline-block px-3 py-1 rounded-md text-[11px] font-mono text-slate-400 bg-[#090f1e] border border-slate-800">
                {log.author}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
