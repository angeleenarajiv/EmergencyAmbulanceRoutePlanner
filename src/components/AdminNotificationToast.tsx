import React from 'react';
import {
  Bell,
  MapPin,
  Siren,
  X,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Clock,
  Compass
} from 'lucide-react';
import { AdminNotification } from '../types';

interface EmergencyToastProps {
  notification: AdminNotification | null;
  onDismiss: () => void;
  onViewOnMap: (incidentId: string) => void;
}

export const EmergencyToast: React.FC<EmergencyToastProps> = ({
  notification,
  onDismiss,
  onViewOnMap
}) => {
  if (!notification) return null;

  const isCodeRed = notification.severity.includes('Red');

  return (
    <div className="fixed top-20 right-4 z-50 max-w-md w-full animate-slideIn">
      <div
        className={`p-4 rounded-2xl border-2 shadow-2xl backdrop-blur-xl transition-all ${
          isCodeRed
            ? 'bg-[#0f0e1f]/95 border-red-500 shadow-red-950/80 ring-2 ring-red-500/50'
            : 'bg-[#0b1528]/95 border-amber-500 shadow-amber-950/80 ring-2 ring-amber-500/50'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${
                isCodeRed
                  ? 'bg-red-600/20 border border-red-500/50 text-red-400'
                  : 'bg-amber-600/20 border border-amber-500/50 text-amber-400'
              }`}
            >
              <Siren className="w-5 h-5 animate-pulse" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-950 text-red-300 border border-red-800 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                  AI Auto-Verified Alert
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-mono flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  {notification.confidence}% AI Confidence
                </span>
              </div>

              <h4 className="text-sm font-extrabold text-white">
                {notification.incidentCode} · {notification.title}
              </h4>

              <p className="text-xs text-slate-300 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span className="truncate">{notification.location}</span>
              </p>

              {notification.ambulanceName && (
                <p className="text-[11px] text-emerald-300 font-medium">
                  Auto-Dispatched: <strong className="text-white">{notification.ambulanceName}</strong>
                  {notification.routeEtaMinutes && ` · ETA ~${notification.routeEtaMinutes}m`}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={onDismiss}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Button: View on Map */}
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
          <span className="text-[10px] text-slate-400 font-mono">
            CAD Central Triage · Just now
          </span>

          <button
            onClick={() => onViewOnMap(notification.incidentId)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-500 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-xs shadow-lg shadow-red-950 transition active:scale-95"
          >
            <Compass className="w-4 h-4" />
            <span>View on Map</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

interface NotificationBellDropdownProps {
  notifications: AdminNotification[];
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onViewOnMap: (incidentId: string) => void;
  onMarkAllAsRead: () => void;
}

export const NotificationBellDropdown: React.FC<NotificationBellDropdownProps> = ({
  notifications,
  isOpen,
  onToggle,
  onClose,
  onViewOnMap,
  onMarkAllAsRead
}) => {
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={onToggle}
        title="Admin Emergency Dispatch Alerts"
        className={`p-2 rounded-xl border transition relative flex items-center justify-center ${
          unreadCount > 0
            ? 'bg-rose-950/60 border-rose-500 text-rose-300 shadow-md shadow-rose-950/50'
            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
        }`}
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full text-[10px] font-black bg-red-600 text-white shadow-lg animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Drawer */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#0b1222] border border-slate-700/80 shadow-2xl z-50 overflow-hidden animate-fadeIn">
          <div className="p-3.5 bg-gradient-to-r from-slate-900 to-[#070d18] border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-cyan-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                CAD Emergency Alerts
              </h4>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-cyan-300">
                {notifications.length} Total
              </span>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="text-[10px] text-cyan-400 hover:text-cyan-300 font-semibold"
              >
                Mark read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/80">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                <CheckCircle2 className="w-8 h-8 text-emerald-400/50 mx-auto mb-2" />
                <span>No active emergency notifications</span>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3.5 space-y-2 transition ${
                    !n.isRead ? 'bg-rose-950/20 hover:bg-rose-950/30' : 'hover:bg-slate-800/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-200 text-xs">{n.incidentCode}</span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                          {n.confidence}% AI Verified
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 font-medium truncate max-w-[220px]">
                        {n.title}
                      </p>
                    </div>

                    <span className="text-[10px] text-slate-500 font-mono shrink-0">
                      {n.timestamp}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                    <span className="truncate">{n.location}</span>
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-emerald-400 font-mono truncate">
                      {n.ambulanceName ? `Unit: ${n.ambulanceName}` : 'Dijkstra Dispatched'}
                    </span>

                    <button
                      onClick={() => {
                        onViewOnMap(n.incidentId);
                        onClose();
                      }}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-[11px] shadow transition active:scale-95"
                    >
                      <Compass className="w-3 h-3" />
                      <span>View on Map</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
