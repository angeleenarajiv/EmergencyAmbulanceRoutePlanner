import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  ReferenceLine
} from 'recharts';
import {
  Activity,
  TrendingDown,
  Clock,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Zap,
  Flame,
  Award,
  Calendar
} from 'lucide-react';
import { IncidentReport } from '../types';
import { useTheme } from '../context/ThemeContext';

interface TriagePerformanceOverviewProps {
  incidents: IncidentReport[];
}

export const TriagePerformanceOverview: React.FC<TriagePerformanceOverviewProps> = ({ incidents }) => {
  const { isDark } = useTheme();
  const [timeRange, setTimeRange] = useState<'7d' | '14d' | '30d'>('7d');
  const [activeSeverityFilter, setActiveSeverityFilter] = useState<'all' | 'red' | 'yellow' | 'green'>('all');

  // Compute live incident counts and casualty metrics by severity
  const severityBreakdown = useMemo(() => {
    let redCount = 0;
    let yellowCount = 0;
    let greenCount = 0;
    let redCasualties = 0;
    let yellowCasualties = 0;
    let greenCasualties = 0;

    incidents.forEach((inc) => {
      const sev = inc.severity.toLowerCase();
      if (sev.includes('red')) {
        redCount += 1;
        redCasualties += inc.casualties || 0;
      } else if (sev.includes('yellow')) {
        yellowCount += 1;
        yellowCasualties += inc.casualties || 0;
      } else if (sev.includes('green')) {
        greenCount += 1;
        greenCasualties += inc.casualties || 0;
      }
    });

    const total = incidents.length || 1;

    return [
      {
        severity: 'Code Red',
        label: 'Code Red • Critical',
        shortCode: 'Red',
        count: redCount,
        casualties: redCasualties,
        percentage: Math.round((redCount / total) * 100),
        color: '#ef4444',
        glowColor: 'rgba(239, 68, 68, 0.35)',
        slaMinutes: '< 8 min',
        description: 'Immediately life-threatening (Multi-trauma, head injury, hemorrhage)'
      },
      {
        severity: 'Code Yellow',
        label: 'Code Yellow • High',
        shortCode: 'Yellow',
        count: yellowCount,
        casualties: yellowCasualties,
        percentage: Math.round((yellowCount / total) * 100),
        color: '#f59e0b',
        glowColor: 'rgba(245, 158, 11, 0.35)',
        slaMinutes: '< 15 min',
        description: 'Urgent conditions, fractures, stable vital signs with severe distress'
      },
      {
        severity: 'Code Green',
        label: 'Code Green • Moderate',
        shortCode: 'Green',
        count: greenCount,
        casualties: greenCasualties,
        percentage: Math.round((greenCount / total) * 100),
        color: '#10b981',
        glowColor: 'rgba(16, 185, 129, 0.35)',
        slaMinutes: '< 30 min',
        description: 'Non-life threatening, minor abrasions, ambulatory casualties'
      }
    ];
  }, [incidents]);

  // Daily response time trends across time ranges
  const dailyTrendsData = useMemo(() => {
    if (timeRange === '7d') {
      return [
        { day: 'Oct 09', codeRed: 5.4, overallAvg: 7.8, targetSla: 8.0, dispatches: 6 },
        { day: 'Oct 10', codeRed: 4.9, overallAvg: 7.1, targetSla: 8.0, dispatches: 8 },
        { day: 'Oct 11', codeRed: 5.8, overallAvg: 8.2, targetSla: 8.0, dispatches: 11 },
        { day: 'Oct 12', codeRed: 4.6, overallAvg: 6.9, targetSla: 8.0, dispatches: 5 },
        { day: 'Oct 13', codeRed: 5.2, overallAvg: 7.4, targetSla: 8.0, dispatches: 9 },
        { day: 'Oct 14', codeRed: 4.5, overallAvg: 6.5, targetSla: 8.0, dispatches: 7 },
        { day: 'Oct 15 (Today)', codeRed: 4.2, overallAvg: 5.9, targetSla: 8.0, dispatches: incidents.length }
      ];
    } else if (timeRange === '14d') {
      return [
        { day: 'Oct 02', codeRed: 5.9, overallAvg: 8.4, targetSla: 8.0, dispatches: 7 },
        { day: 'Oct 04', codeRed: 5.1, overallAvg: 7.6, targetSla: 8.0, dispatches: 9 },
        { day: 'Oct 06', codeRed: 6.2, overallAvg: 8.6, targetSla: 8.0, dispatches: 12 },
        { day: 'Oct 08', codeRed: 5.3, overallAvg: 7.5, targetSla: 8.0, dispatches: 8 },
        { day: 'Oct 10', codeRed: 4.9, overallAvg: 7.1, targetSla: 8.0, dispatches: 8 },
        { day: 'Oct 12', codeRed: 4.6, overallAvg: 6.9, targetSla: 8.0, dispatches: 5 },
        { day: 'Oct 14', codeRed: 4.5, overallAvg: 6.5, targetSla: 8.0, dispatches: 7 },
        { day: 'Oct 15', codeRed: 4.2, overallAvg: 5.9, targetSla: 8.0, dispatches: incidents.length }
      ];
    } else {
      return [
        { day: 'Sep 16', codeRed: 6.5, overallAvg: 9.1, targetSla: 8.0, dispatches: 14 },
        { day: 'Sep 23', codeRed: 5.8, overallAvg: 8.3, targetSla: 8.0, dispatches: 16 },
        { day: 'Sep 30', codeRed: 5.3, overallAvg: 7.7, targetSla: 8.0, dispatches: 19 },
        { day: 'Oct 07', codeRed: 4.8, overallAvg: 7.0, targetSla: 8.0, dispatches: 15 },
        { day: 'Oct 15', codeRed: 4.2, overallAvg: 5.9, targetSla: 8.0, dispatches: incidents.length }
      ];
    }
  }, [timeRange, incidents.length]);

  // Overall key summary KPIs
  const totalIncidents = incidents.length;
  const criticalCount = severityBreakdown[0].count;
  const criticalPercentage = totalIncidents > 0 ? Math.round((criticalCount / totalIncidents) * 100) : 0;
  const totalCasualties = severityBreakdown.reduce((acc, curr) => acc + curr.casualties, 0);

  // Custom Tooltip for Bar Chart
  const CustomBarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 border border-slate-700/80 p-3 rounded-xl shadow-2xl backdrop-blur-md text-xs space-y-1.5 min-w-[200px]">
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: data.color }}
            />
            <span className="font-bold text-slate-100">{data.label}</span>
          </div>
          <div className="text-slate-400 text-[11px] leading-tight">{data.description}</div>
          <div className="pt-2 border-t border-slate-800 flex justify-between items-center font-mono">
            <span className="text-slate-400">Total Incidents:</span>
            <span className="font-bold text-white text-sm">{data.count} ({data.percentage}%)</span>
          </div>
          <div className="flex justify-between items-center font-mono text-[11px]">
            <span className="text-slate-400">Casualties Recorded:</span>
            <span className="text-rose-300 font-semibold">{data.casualties} pts</span>
          </div>
          <div className="flex justify-between items-center font-mono text-[11px]">
            <span className="text-slate-400">Golden SLA Target:</span>
            <span className="text-emerald-400 font-semibold">{data.slaMinutes}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Tooltip for Line Chart
  const CustomLineTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 border border-slate-700/80 p-3 rounded-xl shadow-2xl backdrop-blur-md text-xs space-y-1.5 min-w-[210px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="font-bold text-slate-200 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              {label}
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold">
              SLA Compliant
            </span>
          </div>
          <div className="space-y-1 font-mono pt-1 text-[11px]">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 text-rose-400 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                Code Red Time:
              </span>
              <span className="text-white font-bold">{payload.find((p: any) => p.dataKey === 'codeRed')?.value} min</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                Overall Average:
              </span>
              <span className="text-slate-200">{payload.find((p: any) => p.dataKey === 'overallAvg')?.value} min</span>
            </div>
            <div className="flex justify-between items-center text-amber-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 bg-amber-400" />
                Golden Benchmark:
              </span>
              <span>8.0 min</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-[#090f1e] border border-slate-800 text-slate-200 shadow-xl space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-900/60 to-blue-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-inner">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-base tracking-wide flex items-center gap-2">
                Triage Performance Overview
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono flex items-center gap-1">
                <Zap className="w-3 h-3 text-cyan-400" />
                LIVE CAD TELEMETRY
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Severity distribution counts, Golden Hour compliance, and Dijkstra-optimized arrival trends
            </p>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setTimeRange('7d')}
            className={`px-3 py-1 rounded-lg transition font-medium ${
              timeRange === '7d'
                ? 'bg-cyan-600 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            7 Days
          </button>
          <button
            onClick={() => setTimeRange('14d')}
            className={`px-3 py-1 rounded-lg transition font-medium ${
              timeRange === '14d'
                ? 'bg-cyan-600 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            14 Days
          </button>
          <button
            onClick={() => setTimeRange('30d')}
            className={`px-3 py-1 rounded-lg transition font-medium ${
              timeRange === '30d'
                ? 'bg-cyan-600 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            30 Days
          </button>
        </div>
      </div>

      {/* Metric Cards Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-[#070c18] border border-slate-800/80 space-y-1">
          <div className="flex items-center justify-between text-[11px] text-slate-400 uppercase font-mono">
            <span>Total Triage Volume</span>
            <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white flex items-baseline gap-1.5">
            {totalIncidents}
            <span className="text-[10px] font-sans text-slate-400 font-normal">incidents</span>
          </div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
            <CheckCircle2 className="w-3 h-3" />
            100% CAD logged
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#070c18] border border-rose-900/40 space-y-1">
          <div className="flex items-center justify-between text-[11px] text-rose-300/80 uppercase font-mono">
            <span>Code Red Critical</span>
            <Flame className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-400 flex items-baseline gap-1.5">
            {criticalCount}
            <span className="text-[10px] font-sans text-rose-300/70 font-normal">({criticalPercentage}%)</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            {totalCasualties} casualties total
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#070c18] border border-slate-800/80 space-y-1">
          <div className="flex items-center justify-between text-[11px] text-slate-400 uppercase font-mono">
            <span>Code Red Avg Response</span>
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 flex items-baseline gap-1.5">
            4.2
            <span className="text-xs text-slate-300 font-mono">min</span>
          </div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
            <TrendingDown className="w-3 h-3" />
            3.8 min under 8m SLA
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#070c18] border border-slate-800/80 space-y-1">
          <div className="flex items-center justify-between text-[11px] text-slate-400 uppercase font-mono">
            <span>Dijkstra Optimization</span>
            <Award className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-400 flex items-baseline gap-1.5">
            -28.4%
            <span className="text-[10px] font-sans text-slate-400 font-normal">transit time</span>
          </div>
          <div className="text-[11px] text-amber-400 font-mono">
            Weighted graph routing
          </div>
        </div>
      </div>

      {/* Two Column Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CHART 1: Bar Chart of Incident Counts by Severity */}
        <div className="p-4 sm:p-5 rounded-xl bg-[#060a14] border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
                Incident Counts by Severity
              </h4>
              <p className="text-[11px] text-slate-400">
                Categorized by Code Red (Critical), Code Yellow (High), and Code Green (Moderate)
              </p>
            </div>
            <div className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
              Total: <strong className="text-white">{totalIncidents}</strong>
            </div>
          </div>

          {/* Bar Chart Container */}
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={severityBreakdown}
                margin={{ top: 15, right: 20, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="shortCode"
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                  axisLine={{ stroke: '#334155' }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  axisLine={{ stroke: '#334155' }}
                  tickLine={false}
                />
                <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.04)' }} />
                <Bar
                  dataKey="count"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={60}
                >
                  {severityBreakdown.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke={entry.color}
                      strokeWidth={1}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Legend Badges under Bar Chart */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-xs font-mono">
            {severityBreakdown.map((item) => (
              <div
                key={item.severity}
                className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 flex flex-col justify-between"
              >
                <div className="flex items-center gap-1.5 text-[11px]">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-300 font-semibold">{item.severity}</span>
                </div>
                <div className="mt-1 flex items-baseline justify-between">
                  <span className="text-base font-bold text-white">{item.count}</span>
                  <span className="text-[10px] text-slate-400">Target {item.slaMinutes}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CHART 2: Line Chart of Daily Response Time Trends */}
        <div className="p-4 sm:p-5 rounded-xl bg-[#060a14] border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400" />
                Daily Response Time Trends (Minutes)
              </h4>
              <p className="text-[11px] text-slate-400">
                Code Red vs Overall average arrival duration with 8.0 min Golden Target
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800">
              <CheckCircle2 className="w-3 h-3" />
              <span>97.2% Within Target</span>
            </div>
          </div>

          {/* Line Chart Container */}
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={dailyTrendsData}
                margin={{ top: 15, right: 20, left: -10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  axisLine={{ stroke: '#334155' }}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 10]}
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  axisLine={{ stroke: '#334155' }}
                  tickLine={false}
                  unit="m"
                />
                <Tooltip content={<CustomLineTooltip />} />
                {/* 8-minute SLA Target Reference Line */}
                <ReferenceLine
                  y={8.0}
                  stroke="#eab308"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{
                    value: '8m Target SLA',
                    fill: '#eab308',
                    fontSize: 10,
                    position: 'top',
                    fontWeight: 600
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="codeRed"
                  name="Code Red (Critical)"
                  stroke="#ef4444"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#ef4444', strokeWidth: 1, stroke: '#ffffff' }}
                  activeDot={{ r: 6, fill: '#ef4444' }}
                />
                <Line
                  type="monotone"
                  dataKey="overallAvg"
                  name="Overall Average"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  strokeDasharray="3 3"
                  dot={{ r: 3, fill: '#06b6d4' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Legend and SLA Status */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80 text-xs">
            <div className="flex items-center gap-4 text-[11px] font-mono">
              <span className="flex items-center gap-1.5 text-rose-400 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                Code Red
              </span>
              <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                Overall Avg
              </span>
              <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
                <span className="w-3 h-0.5 bg-amber-400 border-dashed" />
                8m Golden Target
              </span>
            </div>

            <div className="text-[11px] text-slate-400 font-mono">
              Avg Current: <span className="text-white font-bold">4.2 min</span> (
              <span className="text-emerald-400 font-semibold">-47.5%</span> of SLA limit)
            </div>
          </div>
        </div>
      </div>

      {/* Triage Protocol & Dispatch Policy Footer */}
      <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 font-mono">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>
            <strong className="text-slate-200">CAD Dispatch Protocol:</strong> Code Red alerts trigger automated Dijkstra recalculation every 30s.
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="text-slate-300">Ambulance Fleet Active: 4 / 4</span>
          <span>·</span>
          <span className="text-emerald-400 font-semibold">Hospital Trauma Roster: 10 Operational</span>
        </div>
      </div>
    </div>
  );
};
