import React, { useState } from 'react';
import {
  Siren,
  Volume2,
  VolumeX,
  BookOpen,
  RotateCcw,
  User,
  ShieldCheck,
  Building2,
  AlertCircle,
  LogIn,
  LogOut,
  Sparkles
} from 'lucide-react';
import { sirenAudio } from '../utils/sirenSound';
import { UserRoleType, UserProfile, AdminNotification } from '../types';
import { NotificationBellDropdown } from './AdminNotificationToast';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  userRole: UserRoleType;
  currentUser: UserProfile;
  onRoleChange: (role: UserRoleType) => void;
  onOpenLoginModal: () => void;
  onOpenReportModal: () => void;
  onOpenResearchModal: () => void;
  onResetSimulation: () => void;
  onExitToRoleSelect?: () => void;
  activeDispatchesCount: number;
  pendingTriageCount: number;
  notifications?: AdminNotification[];
  onViewOnMap?: (incidentId: string) => void;
  onMarkAllNotificationsAsRead?: () => void;
  onOpenChatbot?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  userRole,
  currentUser,
  onRoleChange,
  onOpenLoginModal,
  onOpenReportModal,
  onOpenResearchModal,
  onResetSimulation,
  onExitToRoleSelect,
  activeDispatchesCount,
  pendingTriageCount,
  notifications = [],
  onViewOnMap,
  onMarkAllNotificationsAsRead,
  onOpenChatbot
}) => {
  const [isAudioActive, setIsAudioActive] = React.useState(false);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = React.useState(false);

  const toggleSirenAudio = () => {
    const newState = sirenAudio.toggle();
    setIsAudioActive(newState);
  };

  return (
    <header className="border-b border-slate-800/80 bg-[#090f1d] sticky top-0 z-40 backdrop-blur-md">
      {/* Slogan Banner */}
      <div className="bg-gradient-to-r from-red-950/80 via-slate-900 to-emerald-950/80 border-b border-slate-800/50 py-1 px-4 text-center text-[11px] font-semibold tracking-wide text-slate-300">
        <span className="text-red-400 font-bold uppercase tracking-wider mr-1.5">ResQPath:</span>
        <span className="text-slate-200">Faster Routes. Smarter Response. Saving Lives.</span>
        <span className="hidden sm:inline text-slate-500 mx-2">|</span>
        <span className="hidden sm:inline text-emerald-400 font-mono text-[10px]">
          Kerala 108 Emergency Medical Services · Ernakulam District CAD
        </span>
      </div>

      {/* Main Top Nav Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Wordmark Zone */}
        <div className="flex items-center gap-3.5 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500/20 to-rose-600/30 border border-red-500/40 flex items-center justify-center text-red-500 shadow-lg shadow-red-950/50">
            <Siren className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
                <span>ResQPath</span>
              </h1>
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-red-950/70 text-red-400 border border-red-800/50 uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                Ernakulam · Live CAD
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Intelligent Emergency Ambulance Routing and Dispatch System
            </p>
          </div>
        </div>

        {/* Action Controls & 3-Role Switcher */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-3">
          {/* Siren Audio Toggle */}
          <button
            onClick={toggleSirenAudio}
            title={isAudioActive ? 'Mute Siren Tone' : 'Play Siren Tone'}
            className={`p-2 rounded-xl border transition flex items-center justify-center ${
              isAudioActive
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {isAudioActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Research & SDGs Button */}
          <button
            onClick={onOpenResearchModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-cyan-300 transition"
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">Research &amp; SDGs</span>
            <span className="md:hidden">SDGs</span>
          </button>

          {/* Reset Simulation Button */}
          <button
            onClick={onResetSimulation}
            title="Reset Graph & Incidents to Default"
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Admin Emergency Notifications Bell */}
          <NotificationBellDropdown
            notifications={notifications}
            isOpen={isNotifDropdownOpen}
            onToggle={() => setIsNotifDropdownOpen(!isNotifDropdownOpen)}
            onClose={() => setIsNotifDropdownOpen(false)}
            onViewOnMap={(incId) => {
              if (onViewOnMap) onViewOnMap(incId);
              setIsNotifDropdownOpen(false);
            }}
            onMarkAllAsRead={() => {
              if (onMarkAllNotificationsAsRead) onMarkAllNotificationsAsRead();
            }}
          />

          {/* Dark / Light Theme Toggle */}
          <ThemeToggle />

          {/* Current Active Workspace Badge (No Shortcut Switching) */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#090f1e] border border-slate-800 text-xs font-mono">
            {userRole === 'citizen' && (
              <span className="flex items-center gap-1.5 text-rose-400 font-bold">
                <User className="w-3.5 h-3.5" />
                <span>CITIZEN PORTAL</span>
              </span>
            )}
            {userRole === 'hospital' && (
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <Building2 className="w-3.5 h-3.5" />
                <span>HOSPITAL PORTAL</span>
              </span>
            )}
            {userRole === 'admin' && (
              <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>CAD ADMIN CONSOLE</span>
              </span>
            )}
          </div>

          {/* Gemini AI Assistant Button */}
          {onOpenChatbot && (
            <button
              onClick={onOpenChatbot}
              title="Open Gemini EMS CAD AI Assistant & API Settings"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-950/80 to-blue-950/80 hover:from-cyan-900/90 hover:to-blue-900/90 border border-cyan-700/80 text-cyan-300 text-xs font-semibold transition active:scale-95 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>Gemini AI</span>
            </button>
          )}

          {/* Login / Switch Account Button */}
          <button
            onClick={onOpenLoginModal}
            title="Switch User Account or Facility Credentials"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            <LogIn className="w-3.5 h-3.5 text-cyan-400" />
            <span>Switch Account</span>
          </button>

          {/* Dedicated Logout Button */}
          {onExitToRoleSelect && (
            <button
              onClick={onExitToRoleSelect}
              title="Sign Out of Session"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs font-bold transition shadow-sm active:scale-95"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>Log Out</span>
            </button>
          )}

          {/* Primary Report Accident Button */}
          <button
            onClick={onOpenReportModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-500 hover:from-red-500 hover:to-rose-500 text-white font-semibold text-xs shadow-lg shadow-red-900/40 transition active:scale-95 whitespace-nowrap"
          >
            <AlertCircle className="w-4 h-4" />
            <span>Report Accident</span>
          </button>
        </div>
      </div>

      {/* Sub-status Row */}
      <div className="border-t border-slate-800/60 bg-[#070c18] text-xs px-4 sm:px-6 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-slate-400">
          <div className="flex items-center flex-wrap gap-4 font-mono text-[11px]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <strong className="text-slate-300 font-sans font-medium">Ernakulam EMS:</strong> 10 Hospitals · 4 EMS Bases · 9 Junctions
            </span>
            <span>·</span>
            <span>
              <strong className="text-slate-300 font-sans font-medium">Active Dispatches:</strong>{' '}
              <span className="text-amber-400 font-bold">{activeDispatchesCount}</span>
            </span>
            <span>·</span>
            <span>
              <strong className="text-slate-300 font-sans font-medium">Pending Triage:</strong>{' '}
              <span className="text-rose-400 font-bold">{pendingTriageCount}</span>
            </span>
          </div>

          <div className="flex items-center gap-3 text-slate-300 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>
                Authenticated as:{' '}
                <strong className="text-slate-100 font-semibold">{currentUser.name}</strong>
                <span className="text-slate-400 font-mono text-[11px] ml-1">
                  ({currentUser.badge})
                </span>
              </span>
            </span>

            <button
              onClick={onOpenLoginModal}
              className="text-cyan-400 hover:text-cyan-300 underline font-medium text-[11px]"
            >
              Change
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
