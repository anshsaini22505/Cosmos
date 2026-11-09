import React, { useState } from 'react';
import { usePWAInstall, useOnlineStatus } from './usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      {isInstallable && (
        <button
          onClick={install}
          className="flex items-center gap-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 px-3.5 py-1.5 text-xs font-display font-bold text-slate-950 shadow-sm transition cursor-pointer whitespace-nowrap shrink-0"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.2"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          Install App
        </button>
      )}

      {!isInstallable && isIOS && (
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 rounded-lg bg-[#0d1730] border border-sky-400/60 px-3 py-1.5 text-xs font-medium text-sky-300 hover:bg-[#162447] cursor-pointer whitespace-nowrap shrink-0"
        >
          Install App
        </button>
      )}

      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 pointer-events-auto">
          <div className="w-full max-w-sm rounded-2xl bg-[#080f20] border border-slate-700 p-6 shadow-2xl text-left">
            <h3 className="font-display text-lg font-bold text-white">
              Install App on Home Screen
            </h3>
            <p className="mt-2 text-xs text-slate-300 leading-relaxed">
              1. Tap the <strong>Share</strong> button in Safari.
              <br />
              2. Tap <strong>Add to Home Screen</strong>.
            </p>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-4 w-full rounded-lg bg-amber-400 py-2 text-xs font-display font-bold text-slate-950 hover:bg-amber-300 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-lg bg-amber-500 px-3.5 py-1.5 text-xs font-mono font-semibold text-slate-950 shadow-lg pointer-events-none">
      <span>Offline Mode Active</span>
    </div>
  );
};
