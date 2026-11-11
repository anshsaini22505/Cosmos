import React, { useState } from 'react';
import { usePWAInstall, useOnlineStatus } from './usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  const isInIframe = (() => {
    try {
      return window.self !== window.top;
    } catch {
      return true;
    }
  })();

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else {
      setShowGuide(true);
    }
  };

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '/';

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleInstallClick}
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
        <span>📲 Install App / फ़ोन में इंस्टॉल करें</span>
      </button>

      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 pointer-events-auto">
          <div className="w-full max-w-md rounded-2xl bg-[#080f20] border border-slate-700 p-6 shadow-2xl text-left space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-white">
                📲 फ़ोन में ऐप इंस्टॉल करें (Android &amp; iOS)
              </h3>
              <button
                onClick={() => setShowGuide(false)}
                className="text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {isInIframe && (
              <div className="rounded-xl bg-emerald-500/15 border border-emerald-400/50 p-3.5 space-y-2.5">
                <p className="text-xs text-emerald-200 leading-relaxed">
                  <strong>स्टेप 1:</strong> प्रीव्यू विंडो के बाहर अपने फ़ोन के{' '}
                  <strong>Chrome ब्राउज़र</strong> में सीधा लिंक खोलें ताकि{' '}
                  <strong>1-टैप Install App</strong> बटन काम करे:
                </p>
                <a
                  href={currentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-400 hover:bg-emerald-300 px-4 py-2.5 text-xs font-display font-bold text-slate-950 transition"
                >
                  <span>↗ फुल स्क्रीन ब्राउज़र में खोलें (Open Direct Link)</span>
                </a>
              </div>
            )}

            {!isIOS ? (
              <div className="rounded-xl bg-[#0d1730] border border-slate-800 p-4 space-y-2 text-xs text-slate-200 leading-relaxed">
                <div className="font-bold text-amber-400">
                  Android फ़ोन (Chrome) में इंस्टॉल करने का तरीका:
                </div>
                <p>
                  1. ऊपर दिए गए लिंक को अपने फ़ोन के <strong>Chrome</strong> में खोलें।
                </p>
                <p>
                  2. स्क्रीन पर <strong>&ldquo;Install App&rdquo;</strong> बटन दबाएँ, या Chrome के ऊपर दाईं तरफ़ <strong>⋮ (3-डॉट मेनू)</strong> पर टैप करके{' '}
                  <strong>&ldquo;Install app&rdquo; (ऐप इंस्टॉल करें)</strong> या{' '}
                  <strong>&ldquo;Add to Home screen&rdquo;</strong> चुनें।
                </p>
                <p className="text-emerald-300">
                  ✓ इंस्टॉल होने के बाद यह आपके फ़ोन में असली ऐप की तरह फुल-स्क्रीन और ऑफ़लाइन भी चलेगा!
                </p>
              </div>
            ) : (
              <div className="rounded-xl bg-[#0d1730] border border-slate-800 p-4 space-y-2 text-xs text-slate-200 leading-relaxed">
                <div className="font-bold text-amber-400">
                  iPhone / iPad (Safari) में इंस्टॉल करने का तरीका:
                </div>
                <p>
                  1. Safari में नीचे <strong>Share (शेयर)</strong> बटन पर टैप करें।
                </p>
                <p>
                  2. <strong>&ldquo;Add to Home Screen&rdquo;</strong> पर टैप करें।
                </p>
              </div>
            )}

            <button
              onClick={() => setShowGuide(false)}
              className="w-full rounded-lg bg-amber-400 py-2.5 text-xs font-display font-bold text-slate-950 hover:bg-amber-300 cursor-pointer"
            >
              ठीक है (Close)
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
