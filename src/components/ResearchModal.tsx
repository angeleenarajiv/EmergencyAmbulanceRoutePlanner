import React from 'react';
import { X, BookOpen, Heart, Globe, Cpu, GitFork, Compass } from 'lucide-react';

interface ResearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResearchModal: React.FC<ResearchModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#0e1628] border border-slate-700/80 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-cyan-950/80 via-[#0a1120] to-[#0a1120] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Research Foundations &amp; UN SDG Alignment
              </h3>
              <p className="text-xs text-slate-400">
                Mathematical graph optimization applied to emergency urban logistics
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

        {/* Content */}
        <div className="p-6 space-y-5 text-xs text-slate-300 max-h-[75vh] overflow-y-auto">
          {/* SDG Alignment Section */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>United Nations Sustainable Development Goals (SDGs)</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-[#0a1120] border border-emerald-900/50 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-slate-950 font-bold text-[10px] flex items-center justify-center">
                    3
                  </span>
                  <span className="font-bold text-emerald-300 text-xs">
                    SDG 3: Good Health &amp; Well-Being
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  <strong>Target 3.6:</strong> Halve the number of global deaths and injuries from road traffic crashes. Optimizing route traversal within the crucial <em>Golden Hour</em> reduces pre-hospital trauma mortality by up to 34%.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0a1120] border border-cyan-900/50 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-cyan-600 text-slate-950 font-bold text-[10px] flex items-center justify-center">
                    11
                  </span>
                  <span className="font-bold text-cyan-300 text-xs">
                    SDG 11: Sustainable Cities
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  <strong>Target 11.2:</strong> Provide access to safe, affordable, accessible and sustainable transport systems and improve road safety through intelligent municipal coordination.
                </p>
              </div>
            </div>
          </div>

          {/* Graph Theory & Routing Math */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>Graph Theory &amp; Mathematical Formulation</span>
            </h4>

            <div className="p-3.5 rounded-xl bg-[#070d18] border border-slate-800 font-mono text-[11px] space-y-2 text-slate-300">
              <div className="text-cyan-300 font-bold">// Dynamic Weighted Road Graph Formulation:</div>
              <p>G = (V, E, W)</p>
              <p>V = &#123; Base Stations &#125; ∪ &#123; Road Intersections &#125; ∪ &#123; Hospitals &#125;</p>
              <p>W(e) = Distance(e) × [1 + Congestion(e)]</p>
              <div className="pt-1 text-amber-300 font-bold">// Relaxation Step in Min-Heap Dijkstra:</div>
              <p>if (dist[u] + W(u, v) &lt; dist[v]) &#123;</p>
              <p className="pl-4">dist[v] = dist[u] + W(u, v);</p>
              <p className="pl-4">prev[v] = u;</p>
              <p>&#125;</p>
            </div>
          </div>

          {/* Algorithms Comparative Matrix */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <GitFork className="w-4 h-4 text-indigo-400" />
              <span>Comparative Algorithm Taxonomy</span>
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px] border border-slate-800 rounded-lg overflow-hidden">
                <thead className="bg-[#070d18] text-slate-400 font-mono">
                  <tr>
                    <th className="p-2.5">Algorithm</th>
                    <th className="p-2.5">Weight Sensitivity</th>
                    <th className="p-2.5">Time Complexity</th>
                    <th className="p-2.5">EMS Applicability</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  <tr className="bg-slate-900/40">
                    <td className="p-2.5 font-bold text-rose-300">Dijkstra</td>
                    <td className="p-2.5 text-emerald-400">Weighted (Traffic Aware)</td>
                    <td className="p-2.5 font-mono text-cyan-400">O((V + E) log V)</td>
                    <td className="p-2.5">Optimal for dynamic traffic jams &amp; shortest arrival time</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-slate-200">BFS</td>
                    <td className="p-2.5 text-slate-400">Unweighted (Hop Count)</td>
                    <td className="p-2.5 font-mono text-slate-400">O(V + E)</td>
                    <td className="p-2.5">Minimizes junction switches &amp; traffic light delays</td>
                  </tr>
                  <tr className="bg-slate-900/40">
                    <td className="p-2.5 font-bold text-slate-200">DFS</td>
                    <td className="p-2.5 text-slate-400">Exploratory</td>
                    <td className="p-2.5 font-mono text-slate-400">O(V + E)</td>
                    <td className="p-2.5">Used for arterial network connectivity audit</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#0a1120] border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            Close Overview
          </button>
        </div>
      </div>
    </div>
  );
};
