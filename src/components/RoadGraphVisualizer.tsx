import React, { useState, useEffect, useRef } from 'react';
import {
  Compass,
  Plus,
  Minus,
  RotateCcw,
  Layers,
  Hospital,
  Siren,
  AlertOctagon,
  Shuffle
} from 'lucide-react';
import { GraphNode, GraphEdge, IncidentReport } from '../data/mockData';
import {
  PathResult,
  runDijkstra,
  runBFS,
  runDFS
} from '../utils/graphAlgorithms';
import { useTheme } from '../context/ThemeContext';

interface RoadGraphVisualizerProps {
  nodes: Record<string, GraphNode>;
  edges: GraphEdge[];
  activeIncident: IncidentReport;
  onEdgeCongestionChange: (edgeId: string) => void;
  onNodeSelect?: (nodeId: string) => void;
}

export const RoadGraphVisualizer: React.FC<RoadGraphVisualizerProps> = ({
  nodes,
  edges,
  activeIncident,
  onEdgeCongestionChange,
  onNodeSelect
}) => {
  const { isDark } = useTheme();
  const [algorithm, setAlgorithm] = useState<'Dijkstra (Weighted)' | 'BFS' | 'DFS'>('Dijkstra (Weighted)');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [weightFilter, setWeightFilter] = useState<'route' | 'all' | 'off'>('route');
  const [legendOpen, setLegendOpen] = useState<boolean>(false);
  const [ambulancePos, setAmbulancePos] = useState<{ x: number; y: number } | null>(null);

  // Animation / tooltip state for new incident reporting
  const [showAccidentHighlight, setShowAccidentHighlight] = useState<boolean>(false);
  const [showRouteFlash, setShowRouteFlash] = useState<boolean>(false);
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const prevIncidentId = useRef<string>(activeIncident?.nodeId || '');

  // Trigger visual effects when a new incident is reported (nodeId changes)
  useEffect(() => {
    if (prevIncidentId.current !== activeIncident.nodeId) {
      setShowAccidentHighlight(true);
      setShowRouteFlash(true);
      setShowTooltip(true);
      const highlightTimer = setTimeout(() => setShowAccidentHighlight(false), 800);
      const flashTimer = setTimeout(() => setShowRouteFlash(false), 800);
      const tooltipTimer = setTimeout(() => setShowTooltip(false), 2000);
      prevIncidentId.current = activeIncident.nodeId;
      return () => {
        clearTimeout(highlightTimer);
        clearTimeout(flashTimer);
        clearTimeout(tooltipTimer);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIncident.nodeId]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Compute Route 1: Ambulance Station -> Incident
  const ambulanceRoute: PathResult = React.useMemo(() => {
    const stationId = activeIncident.assignedStationId || 'station_vytilla';
    const incidentId = activeIncident.nodeId;
    if (algorithm === 'BFS') {
      return runBFS(stationId, incidentId, nodes, edges);
    }
    if (algorithm === 'DFS') {
      return runDFS(stationId, incidentId, nodes, edges);
    }
    return runDijkstra(stationId, incidentId, nodes, edges);
  }, [algorithm, activeIncident, nodes, edges]);

  // Compute Route 2: Incident -> Hospital
  const hospitalRoute: PathResult = React.useMemo(() => {
    const incidentId = activeIncident.nodeId;
    const hospitalId = activeIncident.targetHospitalId;
    if (algorithm === 'BFS') {
      return runBFS(incidentId, hospitalId, nodes, edges);
    }
    if (algorithm === 'DFS') {
      return runDFS(incidentId, hospitalId, nodes, edges);
    }
    return runDijkstra(incidentId, hospitalId, nodes, edges);
  }, [algorithm, activeIncident, nodes, edges]);

  // Animate ambulance vehicle along the dispatched path
  useEffect(() => {
    if (!ambulanceRoute.path || ambulanceRoute.path.length < 2) return;

    let step = 0;
    let progress = 0;
    let animFrame: number;

    const animate = () => {
      progress += 0.008;
      if (progress >= 1) {
        progress = 0;
        step = (step + 1) % (ambulanceRoute.path.length - 1);
      }

      const currNodeId = ambulanceRoute.path[step];
      const nextNodeId = ambulanceRoute.path[step + 1];

      if (currNodeId && nextNodeId && nodes[currNodeId] && nodes[nextNodeId]) {
        const n1 = nodes[currNodeId];
        const n2 = nodes[nextNodeId];
        const x = n1.x + (n2.x - n1.x) * progress;
        const y = n1.y + (n2.y - n1.y) * progress;
        setAmbulancePos({ x, y });
      }

      animFrame = requestAnimationFrame(animate);
    };

    animFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animFrame);
  }, [ambulanceRoute, nodes]);

  // Check if an edge is part of ambulance path
  const isEdgeInPath = (edge: GraphEdge, path: string[]) => {
    for (let i = 0; i < path.length - 1; i++) {
      const u = path[i];
      const v = path[i + 1];
      if ((edge.from === u && edge.to === v) || (edge.from === v && edge.to === u)) {
        return true;
      }
    }
    return false;
  };

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.min(140, Math.max(70, prev + delta)));
  };

  const resetZoom = () => setZoomLevel(100);

  return (
    <div className={`rounded-2xl overflow-hidden shadow-2xl relative border transition-colors duration-200 ${
      isDark ? 'bg-[#0e1628] border-slate-800' : 'bg-white border-slate-200'
    }`}>
      {/* Visualizer Header */}
      <div className={`px-5 py-4 border-b flex flex-wrap items-center justify-between gap-4 transition-colors duration-200 ${
        isDark ? 'border-slate-800/80 bg-[#0a1120]' : 'border-slate-200 bg-slate-50/90'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shadow-inner ${
            isDark
              ? 'bg-cyan-950/70 border-cyan-500/30 text-cyan-400'
              : 'bg-cyan-100 border-cyan-400/50 text-cyan-700'
          }`}>
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-bold tracking-wider uppercase ${
                isDark ? 'text-slate-100' : 'text-slate-900'
              }`}>
                City Road Graph Network
              </span>
              <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                isDark
                  ? 'bg-red-950/80 text-red-300 border-red-800/50'
                  : 'bg-red-50 text-red-700 border-red-300 font-semibold'
              }`}>
                Tracking {activeIncident.code}
              </span>
            </div>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Visualizing optimal shortest paths in weighted road graph
            </p>
          </div>
        </div>

        {/* Algorithm Tabs & Canvas Controls */}
        <div className="flex items-center flex-wrap gap-2">
          <div className={`flex items-center p-1 rounded-xl border ${
            isDark ? 'bg-[#070d18] border-slate-800' : 'bg-slate-100 border-slate-300'
          }`}>
            <button
              onClick={() => setAlgorithm('Dijkstra (Weighted)')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                algorithm === 'Dijkstra (Weighted)'
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-950/40'
                  : isDark
                  ? 'text-slate-400 hover:text-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Dijkstra (Weighted)
            </button>
            <button
              onClick={() => setAlgorithm('BFS')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                algorithm === 'BFS'
                  ? isDark ? 'bg-slate-700 text-white shadow-sm' : 'bg-slate-800 text-white shadow-sm'
                  : isDark
                  ? 'text-slate-400 hover:text-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              BFS
            </button>
            <button
              onClick={() => setAlgorithm('DFS')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                algorithm === 'DFS'
                  ? isDark ? 'bg-slate-700 text-white shadow-sm' : 'bg-slate-800 text-white shadow-sm'
                  : isDark
                  ? 'text-slate-400 hover:text-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              DFS
            </button>
          </div>

          <div className={`flex items-center rounded-xl px-1 py-1 border ${
            isDark ? 'bg-[#070d18] border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-300 text-slate-600'
          }`}>
            <button
              onClick={() => handleZoom(10)}
              title="Zoom In"
              className={`p-1.5 rounded transition ${isDark ? 'hover:text-white hover:bg-slate-800' : 'hover:text-slate-900 hover:bg-slate-200'}`}
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <span className={`text-[11px] font-mono font-medium px-2 ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
              {zoomLevel}%
            </span>
            <button
              onClick={() => handleZoom(-10)}
              title="Zoom Out"
              className={`p-1.5 rounded transition ${isDark ? 'hover:text-white hover:bg-slate-800' : 'hover:text-slate-900 hover:bg-slate-200'}`}
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={resetZoom}
              title="Reset View"
              className={`p-1.5 rounded transition ml-1 ${isDark ? 'hover:text-white hover:bg-slate-800' : 'hover:text-slate-900 hover:bg-slate-200'}`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() =>
              setWeightFilter((prev) => (prev === 'route' ? 'all' : prev === 'all' ? 'off' : 'route'))
            }
            title="Toggle Distance Labels (Route Only / All Roads / Off)"
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
              weightFilter !== 'off'
                ? isDark
                  ? 'bg-cyan-950/70 border-cyan-500/40 text-cyan-300 shadow-sm'
                  : 'bg-cyan-50 border-cyan-400 text-cyan-800 font-bold shadow-sm'
                : isDark
                ? 'bg-[#070d18] border-slate-800 text-slate-500 hover:text-slate-300'
                : 'bg-slate-100 border-slate-300 text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>
              {weightFilter === 'route' ? 'Route Distances' : weightFilter === 'all' ? 'All Distances' : 'Distances Hidden'}
            </span>
          </button>
        </div>
      </div>

      {/* SVG Canvas Container */}
      <div
        ref={containerRef}
        className={`w-full relative overflow-x-auto overflow-y-hidden select-none transition-colors duration-200 ${
          isDark ? 'bg-[#070c18]' : 'bg-[#f8fafc]'
        }`}
        style={{ minHeight: '470px' }}
      >
        <svg
          viewBox="0 0 1020 540"
          className="w-full h-auto transition-transform duration-200"
          style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'center center' }}
        >
          <defs>
            {/* Grid Pattern */}
            <pattern id="roadGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke={isDark ? "#162035" : "#e2e8f0"}
                strokeWidth="0.8"
                strokeOpacity={isDark ? "0.4" : "0.8"}
              />
            </pattern>

            {/* Glowing filter for dispatched route */}
            <filter id="glowGold" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Glowing filter for hospital transit */}
            <filter id="glowGreen" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Red glow for accident */}
            <filter id="glowRed" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background Grid */}
          <rect width="1020" height="540" fill={isDark ? "#070c18" : "#f8fafc"} />
          <rect width="1020" height="540" fill="url(#roadGrid)" />

          {/* EDGES / ROADS */}
          <g id="edges-layer">
            {edges.map((edge) => {
              const fromNode = nodes[edge.from];
              const toNode = nodes[edge.to];
              if (!fromNode || !toNode) return null;

              const isAmbulanceEdge = isEdgeInPath(edge, ambulanceRoute.path);
              const isHospitalEdge = isEdgeInPath(edge, hospitalRoute.path);

              // Congestion stroke coloring & light theme suitability
              let baseStroke = isDark ? '#22304d' : '#94a3b8';
              let strokeWidth = isDark ? 2.5 : 3.0;

              if (edge.congestion >= 4.0) {
                baseStroke = isDark ? '#991b1b' : '#dc2626'; // Heavy Jam Red
                strokeWidth = 3.5;
              } else if (edge.congestion >= 2.0) {
                baseStroke = isDark ? '#b45309' : '#d97706'; // Moderate Amber
                strokeWidth = 3.2;
              }

              return (
                <g key={edge.id} className="transition-all duration-300">
                  {/* Base Road Line */}
                  <line
                    x1={fromNode.x}
                    y1={fromNode.y}
                    x2={toNode.x}
                    y2={toNode.y}
                    stroke={baseStroke}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                  />

                  {/* Dispatched Route Overlay (Gold / Amber) */}
                  {isAmbulanceEdge && (
                    <line
                      x1={fromNode.x}
                      y1={fromNode.y}
                      x2={toNode.x}
                      y2={toNode.y}
                      stroke={isDark ? "#fbbf24" : "#d97706"}
                      strokeWidth={isDark ? 4.5 : 5.0}
                      strokeDasharray="8 4"
                      className={showRouteFlash ? 'flash-route animate-dash-flow' : 'animate-dash-flow'}
                      filter="url(#glowGold)"
                      strokeLinecap="round"
                    />
                  )}

                  {/* Hospital Transport Route Overlay (Emerald) */}
                  {isHospitalEdge && (
                    <line
                      x1={fromNode.x}
                      y1={fromNode.y}
                      x2={toNode.x}
                      y2={toNode.y}
                      stroke={isDark ? "#10b981" : "#059669"}
                      strokeWidth={isDark ? 4.5 : 5.0}
                      strokeDasharray="8 4"
                      className={showRouteFlash ? 'flash-route animate-dash-flow' : 'animate-dash-flow'}
                      filter="url(#glowGreen)"
                      strokeLinecap="round"
                    />
                  )}
                </g>
              );
            })}
          </g>

          {/* EDGE DISTANCE & CONGESTION BADGES (CLICKABLE) */}
          {weightFilter !== 'off' && (
            <g id="weights-layer">
              {edges.map((edge) => {
                const fromNode = nodes[edge.from];
                const toNode = nodes[edge.to];
                if (!fromNode || !toNode) return null;

                const isAmbulanceEdge = isEdgeInPath(edge, ambulanceRoute.path);
                const isHospitalEdge = isEdgeInPath(edge, hospitalRoute.path);
                const isCongested = edge.congestion > 1.0;
                const isBlocked = edge.congestion >= 900;

                // Smart filter: in 'route' mode, only show route edges or congested edges
                if (weightFilter === 'route' && !isAmbulanceEdge && !isHospitalEdge && !isCongested) {
                  return null;
                }

                const midX = (fromNode.x + toNode.x) / 2;
                const midY = (fromNode.y + toNode.y) / 2;

                let badgeBg = isDark ? '#0b1324' : '#ffffff';
                let badgeBorder = isDark ? '#2d3b55' : '#cbd5e1';
                let textColor = isDark ? '#94a3b8' : '#334155';

                if (isBlocked) {
                  badgeBg = isDark ? '#7f1d1d' : '#fee2e2';
                  badgeBorder = '#ef4444';
                  textColor = isDark ? '#fecaca' : '#991b1b';
                } else if (edge.congestion >= 4.0) {
                  badgeBg = isDark ? '#450a0a' : '#fef2f2';
                  badgeBorder = '#dc2626';
                  textColor = isDark ? '#fca5a5' : '#b91c1c';
                } else if (edge.congestion >= 2.0) {
                  badgeBg = isDark ? '#451a03' : '#fffbeb';
                  badgeBorder = '#d97706';
                  textColor = isDark ? '#fde68a' : '#92400e';
                } else if (isAmbulanceEdge) {
                  badgeBg = isDark ? '#271c04' : '#fef3c7';
                  badgeBorder = isDark ? '#f59e0b' : '#d97706';
                  textColor = isDark ? '#fef08a' : '#78350f';
                } else if (isHospitalEdge) {
                  badgeBg = isDark ? '#03231a' : '#d1fae5';
                  badgeBorder = isDark ? '#10b981' : '#059669';
                  textColor = isDark ? '#a7f3d0' : '#064e3b';
                }

                return (
                  <g
                    key={`w-${edge.id}`}
                    transform={`translate(${midX}, ${midY})`}
                    onClick={() => onEdgeCongestionChange(edge.id)}
                    className="cursor-pointer group"
                  >
                    <rect
                      x="-19"
                      y="-8.5"
                      width="38"
                      height="17"
                      rx="8.5"
                      fill={badgeBg}
                      stroke={badgeBorder}
                      strokeWidth="1.2"
                      className="transition-transform group-hover:scale-110 drop-shadow-sm"
                    />
                    <text
                      x="0"
                      y="3.2"
                      fill={textColor}
                      fontSize="8.5"
                      fontFamily="JetBrains Mono, monospace"
                      textAnchor="middle"
                      fontWeight="700"
                      className="pointer-events-none select-none"
                    >
                      {isBlocked
                        ? 'CLOSED'
                        : isCongested
                        ? `${edge.distanceKm}k ✕`
                        : `${edge.distanceKm}k`}
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* NODES LAYER */}
          <g id="nodes-layer">
            {Object.values(nodes).map((node) => {
              const isAmbulanceStart = node.id === activeIncident.assignedStationId;
              const isAccident = node.id === activeIncident.nodeId;
              const isHospitalEnd = node.id === activeIncident.targetHospitalId;

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  className="cursor-pointer group"
                  onClick={() => onNodeSelect?.(node.id)}
                >
                  {/* Pulse halo for active accident node */}
                  {isAccident && (
                    <circle
                      r="28"
                      fill="#ef4444"
                      fillOpacity="0.25"
                      className={`animate-ping ${showAccidentHighlight ? 'fade-in' : ''}`}
                      style={{ animationDuration: '2s' }}
                    />
                  )}

                  {/* Glowing backdrop circle */}
                  {isAccident && (
                    <circle
                      r="22"
                      fill="#dc2626"
                      fillOpacity="0.3"
                      filter="url(#glowRed)"
                      className={showAccidentHighlight ? 'fade-in' : ''}
                    />
                  )}

                  {/* Tooltip for new incident */}
                  {showTooltip && (
                    <g className="fade-in pointer-events-none" transform="translate(0, -38)">
                      <rect
                        x="-65"
                        y="-12"
                        width="130"
                        height="22"
                        rx="11"
                        fill="#881337"
                        stroke="#f43f5e"
                        strokeWidth="1.5"
                        filter="url(#glowRed)"
                      />
                      <text
                        x="0"
                        y="3"
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="9.5"
                        fontWeight="700"
                        fontFamily="Plus Jakarta Sans, sans-serif"
                      >
                        🚨 New incident reported
                      </text>
                    </g>
                  )}

                  {/* Main Node Graphic */}
                  {node.type === 'hospital' ? (
                    // Hospital Node
                    <g>
                      <circle
                        r="16"
                        fill={isDark ? "#064e3b" : "#ecfdf5"}
                        stroke={isDark ? "#10b981" : "#059669"}
                        strokeWidth={isHospitalEnd ? 3.5 : 2.5}
                        filter={isHospitalEnd ? 'url(#glowGreen)' : undefined}
                      />
                      {/* Medical Cross Icon */}
                      <path
                        d="M -3 -8 H 3 V -3 H 8 V 3 H 3 V 8 H -3 V 3 H -8 V -3 H -3 Z"
                        fill={isDark ? "#34d399" : "#059669"}
                      />
                    </g>
                  ) : node.type === 'ambulance_station' ? (
                    // Ambulance Base Node
                    <g>
                      <circle
                        r="15"
                        fill={isDark ? "#1e1b4b" : "#eef2ff"}
                        stroke={isDark ? "#818cf8" : "#4f46e5"}
                        strokeWidth={isAmbulanceStart ? 3.5 : 2.5}
                        filter={isAmbulanceStart ? 'url(#glowGold)' : undefined}
                      />
                      {/* Ambulance emblem icon */}
                      <circle r="6" fill={isDark ? "#4f46e5" : "#4338ca"} />
                      <path
                        d="M -4 -2 L 4 -2 L 2 3 L -2 3 Z"
                        fill={isDark ? "#c7d2fe" : "#ffffff"}
                      />
                    </g>
                  ) : isAccident ? (
                    // Incident Node
                    <g>
                      <circle
                        r="15"
                        fill={isDark ? "#7f1d1d" : "#fef2f2"}
                        stroke={isDark ? "#f87171" : "#dc2626"}
                        strokeWidth="3"
                      />
                      <circle r="7" fill={isDark ? "#ef4444" : "#dc2626"} />
                      {/* Warning symbol */}
                      <path
                        d="M 0 -4 L 3 3 L -3 3 Z"
                        fill="#ffffff"
                      />
                    </g>
                  ) : (
                    // Standard Junction
                    <g>
                      <circle
                        r="8"
                        fill={isDark ? "#1e293b" : "#ffffff"}
                        stroke={isDark ? "#475569" : "#64748b"}
                        strokeWidth={isDark ? 1.5 : 2}
                        className="group-hover:stroke-cyan-500 transition-colors"
                      />
                      <circle r="3" fill={isDark ? "#64748b" : "#334155"} />
                    </g>
                  )}

                  {/* Node Label Text (Writings) */}
                  <text
                    x="0"
                    y={node.type === 'hospital' || isAccident ? 23 : 18}
                    textAnchor="middle"
                    fill={
                      isAccident
                        ? isDark ? '#fca5a5' : '#b91c1c'
                        : node.type === 'hospital'
                        ? isDark ? '#6ee7b7' : '#047857'
                        : node.type === 'ambulance_station'
                        ? isDark ? '#c7d2fe' : '#3730a3'
                        : isDark ? '#94a3b8' : '#1e293b'
                    }
                    stroke={isDark ? "#070c18" : "#ffffff"}
                    strokeWidth={isDark ? "3.2" : "3.5"}
                    strokeLinejoin="round"
                    paintOrder="stroke fill"
                    fontSize="9.5"
                    fontWeight={isAccident || isHospitalEnd || isAmbulanceStart ? '800' : '700'}
                    fontFamily="Plus Jakarta Sans, sans-serif"
                    className="pointer-events-none select-none"
                  >
                    {node.shortName}
                  </text>
                </g>
              );
            })}
          </g>

          {/* ANIMATED AMBULANCE ICON ON ROAD */}
          {ambulancePos && (
            <g
              transform={`translate(${ambulancePos.x}, ${ambulancePos.y})`}
              className="pointer-events-none"
            >
              <circle r="12" fill="#ef4444" fillOpacity="0.4" className="animate-ping" />
              <circle r="9" fill="#dc2626" stroke="#ffffff" strokeWidth="1.5" />
              <path
                d="M -4 -4 L 4 -4 L 5 1 L 3 4 L -3 4 L -5 1 Z"
                fill="#ffffff"
              />
              <circle cx="-2" cy="4" r="1.5" fill="#1e293b" />
              <circle cx="2" cy="4" r="1.5" fill="#1e293b" />
            </g>
          )}
        </svg>

        {/* MAP INDICATORS COLLAPSIBLE LEGEND (BOTTOM-RIGHT, NON-BLOCKING) */}
        {!legendOpen ? (
          <button
            onClick={() => setLegendOpen(true)}
            className={`absolute bottom-3 right-3 backdrop-blur-md rounded-xl px-3 py-1.5 shadow-xl text-xs flex items-center gap-2 transition cursor-pointer z-10 border ${
              isDark
                ? 'bg-[#0a1120]/95 hover:bg-[#121c32] border-slate-800 text-slate-300 hover:text-white'
                : 'bg-white/95 hover:bg-slate-50 border-slate-300 text-slate-700 hover:text-slate-900 shadow-md'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isDark ? 'bg-cyan-400 animate-pulse' : 'bg-cyan-600 animate-pulse'}`} />
            <span className="font-semibold">Map Legend</span>
            <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>▴</span>
          </button>
        ) : (
          <div className={`absolute bottom-3 right-3 backdrop-blur-md rounded-xl p-3 w-60 shadow-2xl z-10 text-xs fade-in border ${
            isDark
              ? 'bg-[#0a1120]/95 border-slate-800 text-slate-300'
              : 'bg-white/95 border-slate-200 text-slate-700 shadow-2xl'
          }`}>
            <div className={`flex items-center justify-between mb-2 pb-1.5 border-b ${
              isDark ? 'border-slate-800/80 text-slate-200' : 'border-slate-200 text-slate-900'
            }`}>
              <span className="text-[11px] font-bold tracking-wider uppercase">
                Map Indicators
              </span>
              <button
                onClick={() => setLegendOpen(false)}
                className={`px-1.5 py-0.5 rounded text-xs transition ${
                  isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Collapse Legend"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center gap-2">
                <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center text-[10px] font-bold shrink-0 ${
                  isDark ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400' : 'bg-emerald-100 border-emerald-600 text-emerald-700'
                }`}>
                  +
                </span>
                <span>Hospital (Bed Status)</span>
              </div>

              <div className="flex items-center gap-2">
                <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center text-[10px] font-bold shrink-0 ${
                  isDark ? 'bg-indigo-500/30 border-indigo-400 text-indigo-300' : 'bg-indigo-100 border-indigo-600 text-indigo-700'
                }`}>
                  •
                </span>
                <span>Ambulance Base Station</span>
              </div>

              <div className="flex items-center gap-2">
                <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center text-[9px] font-bold shrink-0 ${
                  isDark ? 'bg-red-500/30 border-red-500 text-red-400' : 'bg-red-100 border-red-600 text-red-700'
                }`}>
                  ▲
                </span>
                <span className={isDark ? 'text-red-300 font-medium' : 'text-red-700 font-bold'}>Active Accident Site</span>
              </div>

              <div className="flex items-center gap-2 pt-0.5">
                <div className={`w-4 h-1 rounded-full shrink-0 shadow-sm ${
                  isDark ? 'bg-amber-400 shadow-amber-400' : 'bg-amber-600 shadow-amber-600'
                }`} />
                <span className={isDark ? 'text-amber-200' : 'text-amber-800 font-semibold'}>Dispatched Route</span>
              </div>

              <div className="flex items-center gap-2">
                <div className={`w-4 h-1 rounded-full shrink-0 shadow-sm ${
                  isDark ? 'bg-emerald-400 shadow-emerald-400' : 'bg-emerald-600 shadow-emerald-600'
                }`} />
                <span className={isDark ? 'text-emerald-300' : 'text-emerald-800 font-semibold'}>Hospital Transport</span>
              </div>
            </div>

            <div className={`mt-2 pt-1.5 border-t text-[10px] leading-tight flex items-start gap-1 ${
              isDark ? 'border-slate-800/80 text-amber-200/90' : 'border-slate-200 text-slate-600'
            }`}>
              <span className="shrink-0 text-xs">💡</span>
              <span>Click road badges to toggle traffic congestion and live reroutes.</span>
            </div>
          </div>
        )}
      </div>

      {/* Traversal Summary Strip */}
      <div className={`px-5 py-3 border-t flex flex-wrap items-center justify-between text-xs gap-3 transition-colors duration-200 ${
        isDark ? 'bg-[#0a1120] border-slate-800/80 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
      }`}>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className={isDark ? 'text-slate-400' : 'text-slate-500 font-medium'}>Dispatch Phase 1:</span>
            <span className={`font-semibold ${isDark ? 'text-amber-300' : 'text-amber-700 font-bold'}`}>
              {nodes[activeIncident.assignedStationId || 'station_vytilla']?.name || 'Station'} → Incident
            </span>
            <span className={`font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              ({ambulanceRoute.totalDistanceKm} km · ~{ambulanceRoute.estimatedMinutes} mins)
            </span>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <span className={isDark ? 'text-slate-500' : 'text-slate-300'}>·</span>
            <span className={isDark ? 'text-slate-400' : 'text-slate-500 font-medium'}>Phase 2:</span>
            <span className={`font-semibold ${isDark ? 'text-emerald-400' : 'text-emerald-700 font-bold'}`}>
              Incident → {nodes[activeIncident.targetHospitalId]?.shortName || 'Hospital'}
            </span>
            <span className={`font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              ({hospitalRoute.totalDistanceKm} km · ~{hospitalRoute.estimatedMinutes} mins)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono text-[11px]">
          <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Algorithm:</span>
          <span className={`font-semibold ${isDark ? 'text-cyan-400' : 'text-cyan-700 font-bold'}`}>{algorithm}</span>
          <span className={isDark ? 'text-slate-500' : 'text-slate-300'}>|</span>
          <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Total Graph Cost:</span>
          <span className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
            {(ambulanceRoute.effectiveCost + hospitalRoute.effectiveCost).toFixed(1)}
          </span>
        </div>
      </div>
    </div>
  );
};
