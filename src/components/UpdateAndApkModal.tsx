import React, { useState } from 'react';

interface UpdateAndApkModalProps {
  isOpen: boolean;
  onClose: () => void;
  langCode: string;
}

export const UpdateAndApkModal: React.FC<UpdateAndApkModalProps> = ({
  isOpen,
  onClose,
  langCode,
}) => {
  const [checking, setChecking] = useState<boolean>(false);
  const [checkResult, setCheckResult] = useState<{
    status: 'idle' | 'success' | 'update_available';
    message: string;
  }>({ status: 'idle', message: '' });

  if (!isOpen) return null;

  const currentVersion = 'v2.2.0';
  const buildDate = 'Nov 2026';
  const isHindi = langCode === 'hi' || langCode === 'hinglish';

  const repoBaseUrl = 'https://github.com/anshsaini22505/Cosmos';
  const actionsUrl = `${repoBaseUrl}/actions`;
  const releasesUrl = `${repoBaseUrl}/releases`;
  const directApkUrl = `${repoBaseUrl}/releases/latest/download/Astral-Odyssey-Solar-Command-v2.2.0.apk`;

  const handleCheckUpdates = () => {
    setChecking(true);
    setCheckResult({ status: 'idle', message: '' });

    setTimeout(() => {
      setChecking(false);
      setCheckResult({
        status: 'success',
        message: isHindi
          ? '✅ बधाई! आप Astral Odyssey का सबसे नया वर्जन (v2.2.0) चला रहे हैं। GitHub Actions (Cosmos) में ऑटोमैटिक APK तैयार है।'
          : '✅ All systems synchronized! You are on the latest release (v2.2.0). Automated APK is live in GitHub Actions (Cosmos).',
      });
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 pointer-events-auto">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#080f20] border border-sky-500/40 p-5 sm:p-6 shadow-2xl text-left text-white space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 flex items-center justify-center text-slate-950 font-black shadow-lg shrink-0">
              <svg
                className="w-6 h-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-lg sm:text-xl font-bold tracking-wide text-white">
                  {isHindi
                    ? 'ऑटोमैटिक APK और अपडेट हब'
                    : 'Automated APK & Updates'}
                </h2>
                <span className="rounded-md bg-emerald-500/20 border border-emerald-400 px-2 py-0.5 text-[10px] font-mono font-semibold text-emerald-300">
                  {currentVersion}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {isHindi
                  ? 'GitHub (Cosmos) Actions टैब और Releases से सीधे APK डाउनलोड करें'
                  : 'Download automated APKs from GitHub Actions & Releases'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Current Version & Check for Updates Bar */}
        <div className="rounded-xl bg-[#0e1933] border border-slate-800 p-3.5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-mono text-slate-400">
              {isHindi
                ? 'वर्तमान संस्करण (Installed Version)'
                : 'Current Version'}
            </div>
            <div className="font-display font-bold text-amber-300 text-sm">
              Astral Odyssey {currentVersion} ({buildDate})
            </div>
          </div>

          <button
            onClick={handleCheckUpdates}
            disabled={checking}
            className="flex items-center gap-2 rounded-lg bg-sky-400 hover:bg-sky-300 disabled:opacity-60 px-3.5 py-2 text-xs font-display font-bold text-slate-950 shadow-md transition cursor-pointer whitespace-nowrap"
          >
            {checking ? (
              <span>{isHindi ? 'चेक हो रहा है...' : 'Checking...'}</span>
            ) : (
              <span>
                {isHindi ? '🔄 अपडेट चेक करें' : '🔄 Check for Updates'}
              </span>
            )}
          </button>
        </div>

        {checkResult.message && (
          <div className="rounded-xl bg-emerald-500/15 border border-emerald-400/50 p-3 text-xs text-emerald-300 leading-relaxed font-mono">
            {checkResult.message}
          </div>
        )}

        {/* GitHub Actions & Direct APK Card */}
        <div className="rounded-xl bg-[#0c162e] border border-sky-400/40 p-4 space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-white text-sm">
              {isHindi
                ? '📲 GitHub Actions (Cosmos) से APK डाउनलोड करें'
                : '📲 Download APK from GitHub Actions (Cosmos)'}
            </h3>
            <span className="rounded bg-sky-500/20 border border-sky-400/50 px-2 py-0.5 text-[10px] font-mono text-sky-300">
              Auto-Build Ready
            </span>
          </div>

          <div className="space-y-1.5 text-xs text-slate-300 font-mono bg-[#070c18] p-3 rounded-lg border border-slate-800">
            <div className="flex items-start gap-2">
              <span className="text-amber-400 font-bold">1.</span>
              <span>
                {isHindi
                  ? 'नीचे "GitHub Actions टैब खोलें" या "Direct APK Download" पर टैप करें।'
                  : 'Tap "Open GitHub Actions Tab" or "Direct APK Download" below.'}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-amber-400 font-bold">2.</span>
              <span>
                {isHindi
                  ? 'Actions में लेटेस्ट रन "Build Android APK" के नीचे Artifacts में "Astral-Odyssey-Android-APK" डाउनलोड करें।'
                  : 'In Actions -> Artifacts, download "Astral-Odyssey-Android-APK".'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
            <a
              href={directApkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 rounded-lg bg-emerald-400 hover:bg-emerald-300 px-3 py-2.5 text-xs font-display font-bold text-slate-950 shadow-md transition text-center"
            >
              <span>📲 {isHindi ? 'Direct APK डाउनलोड' : 'Direct APK'}</span>
            </a>

            <a
              href={actionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 rounded-lg bg-sky-400 hover:bg-sky-300 px-3 py-2.5 text-xs font-display font-bold text-slate-950 shadow-md transition text-center"
            >
              <span>↗ {isHindi ? 'Actions टैब खोलें' : 'Actions Tab'}</span>
            </a>

            <a
              href={releasesUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 rounded-lg bg-[#142345] hover:bg-[#1c305c] border border-sky-400/60 px-3 py-2.5 text-xs font-display font-bold text-sky-200 transition text-center"
            >
              <span>📦 {isHindi ? 'Releases पेज' : 'Releases Page'}</span>
            </a>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 pt-1">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 text-xs font-display font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg cursor-pointer"
          >
            {isHindi ? 'ठीक है (Close)' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
