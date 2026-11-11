import React from 'react';
import { X, MapPin, Calendar, Users, ShieldAlert, Download } from 'lucide-react';

interface PhotoLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  imageTitle: string;
}

export const PhotoLightboxModal: React.FC<PhotoLightboxModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  imageTitle
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="bg-[#0e1628] border border-slate-700 rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-5 py-3.5 bg-[#0a1120] border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <span className="font-mono font-bold text-slate-200">{imageTitle}</span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-400">High Resolution Scene Evidence</span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Image preview */}
        <div className="relative bg-black flex items-center justify-center max-h-[60vh] overflow-hidden">
          <img
            src={imageUrl}
            alt={imageTitle}
            referrerPolicy="no-referrer"
            className="w-full h-auto max-h-[60vh] object-contain"
          />

          <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/80 text-[11px] text-slate-200 flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-rose-400" />
            <span>Emerald River Bridge Crossing • Southbound Lane 2</span>
          </div>
        </div>

        {/* Footer info strip */}
        <div className="p-4 bg-[#0a1120] border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <span>Verified Scene Photo (1.4 MB)</span>
            <span>·</span>
            <span className="text-emerald-400">EXIF Geotag Matched</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
