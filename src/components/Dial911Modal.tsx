import React, { useState, useEffect } from 'react';
import { X, PhoneCall, Radio, ShieldAlert, CheckCircle, AlertOctagon } from 'lucide-react';
import { sirenAudio } from '../utils/sirenSound';

interface Dial911ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Dial911Modal: React.FC<Dial911ModalProps> = ({ isOpen, onClose }) => {
  const [callState, setCallState] = useState<'connecting' | 'connected'>('connecting');
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setCallState('connecting');
      setTimer(0);
      return;
    }

    sirenAudio.playBeep(980, 200);

    const timeout = setTimeout(() => {
      setCallState('connected');
      sirenAudio.playBeep(1200, 150);
    }, 1400);

    return () => clearTimeout(timeout);
  }, [isOpen]);

  useEffect(() => {
    if (callState !== 'connected') return;
    const interval = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [callState]);

  if (!isOpen) return null;

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-[#0e1628] border border-red-700/80 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl p-6 text-center space-y-5">
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-red-600/20 border-2 border-red-500 flex items-center justify-center text-red-500 shadow-xl shadow-red-950 animate-pulse">
            <PhoneCall className="w-10 h-10" />
          </div>
        </div>

        <div>
          <span className="text-[11px] font-mono tracking-widest text-red-400 uppercase font-bold">
            {callState === 'connecting' ? 'Initiating Priority Bridge...' : 'Connected to Kerala 108 EMS CAD'}
          </span>
          <h3 className="text-2xl font-black text-white mt-1">Kerala 108 / 112 Emergency Dispatch</h3>
          <p className="text-xs text-slate-300 font-mono mt-1">
            {callState === 'connecting' ? 'Handshaking Ernakulam CAD Terminal...' : `Call Active • ${formatTime(timer)}`}
          </p>
        </div>

        <div className="bg-[#070c18] border border-slate-800 rounded-xl p-3.5 text-xs text-left space-y-2 text-slate-300">
          <div className="flex justify-between">
            <span className="text-slate-400">Caller ID Geolocation:</span>
            <span className="font-mono text-cyan-300 font-bold">9.9685° N, 76.3175° E (Ernakulam)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Nearest Hub:</span>
            <span className="font-bold text-amber-300">Vytilla Mobility Hub (0.3 km)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Emergency Line:</span>
            <span className="font-mono text-emerald-400 font-bold">108 Kerala EMS Trunk</span>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-lg shadow-red-950 transition active:scale-95"
          >
            End Call &amp; Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export const Dial108Modal = Dial911Modal;
