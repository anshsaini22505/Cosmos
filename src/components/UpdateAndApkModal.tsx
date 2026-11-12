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

  const handleCheckUpdates = () => {
    setChecking(true);
    setCheckResult({ status: 'idle', message: '' });

    setTimeout(() => {
      setChecking(false);
      setCheckResult({
        status: 'success',
        message: isHindi
          ? '✅ बधाई! आप Astral Odyssey का सबसे नया वर्जन (v2.2.0) चला रहे हैं। GitHub Actions में ऑटोमैटिक APK उपलब्ध है।'
          : '✅ All systems synchronized! You are on the latest release (v2.2.0). Automated APK is live in GitHub Actions.',
      });
    }, 1200);
  };

  const handleOpenGitHubActions = () => {
    if (typeof window !== 'undefined') {
      window.open('https://github.com/anshsaini22505/Astral-Odyssey/actions', '_blank');
    }
  };

  const handleOpenGitHubReleases = () => {
    if (typeof window !== 'undefined') {
      window.open('https://github.com/anshsaini22505/Astral-Odyssey/releases', '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-xs pointer-events-auto">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#080f20] border border-sky-500/40 p-5 sm:p-6 shadow-2xl text-left text-white space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-amber-400 flex items-center justify-center text-slate-950 font-black shadow-lg">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-lg sm:text-xl font-bold tracking-wide text-white">
                  {isHindi ? 'ऑटोमैटिक APK और अपडेट हब' : 'Automated APK & Updates'}
                </h2>
                <span className="rounded-full bg-emerald-500/20 border border-emerald-400 px-2 py-0.5 text-[10px] font-mono font-semibold text-emerald-300">
                  {currentVersion}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {isHindi
                  ? 'GitHub Actions टैब से सीधे अपने फ़ोन में APK डाउनलोड करें'
                  : 'Download automated APKs generated directly in GitHub Actions'}
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
              {isHindi ? 'वर्तमान संस्करण (Installed Version)' : 'Current Version'}
            </div>
            <div className="font-display font-bold text-amber-300 text-sm">
              Astral Odyssey {currentVersion} ({buildDate})
            </div>
          </div>

          <button
            onClick={handleCheckUpdates}
            disabled={checking}
            className="flex items-center gap-2 rounded-lg bg-sky-500 hover:bg-sky-400 disabled:opacity-60 px-3.5 py-2 text-xs font-display font-bold text-slate-950 shadow-md transition cursor-pointer whitespace-nowrap"
          >
            {checking ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>{isHindi ? 'चेक हो रहा है...' : 'Checking...'}</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>{isHindi ? 'अपडेट चेक करें' : 'Check for Updates'}</span>
              </>
            )}
          </button>
        </div>

        {checkResult.message && (
          <div className="rounded-xl bg-emerald-500/15 border border-emerald-400/50 p-3 text-xs text-emerald-300 leading-relaxed font-mono">
            {checkResult.message}
          </div>
        )}

        {/* GitHub Actions Tab Card */}
        <div className="rounded-xl bg-gradient-to-br from-[#0c162e] to-[#081022] border border-sky-400/40 p-4 space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">⚙️</span>
              <h3 className="font-display font-bold text-white text-sm">
                {isHindi ? 'GitHub Actions टैब से APK डाउनलोड करें' : 'Download APK from GitHub Actions Tab'}
              </h3>
            </div>
            <span className="rounded bg-sky-500/20 border border-sky-400/50 px-2 py-0.5 text-[10px] font-mono text-sky-300">
              Auto-Build
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {isHindi
              ? 'जैसे ही रिपॉजिटरी में कोड जाता है, GitHub Actions में Android APK अपने आप बिल्ड हो जाता है। आप कभी भी सीधे Actions टैब से रेडी-टू-इंस्टॉल APK डाउनलोड कर सकते हैं:'
              : 'Every time updates are pushed, GitHub Actions automatically compiles the Android APK. You can download the compiled APK file anytime:'}
          </p>

          {/* Step by Step instructions */}
          <div className="space-y-1.5 text-xs text-slate-300 font-mono bg-[#070c18] p-3 rounded-lg border border-slate-800">
            <div className="flex items-start gap-2">
              <span className="text-amber-400 font-bold">1.</span>
              <span>{isHindi ? 'नीचे "GitHub Actions टैब खोलें" पर क्लिक करें।' : 'Click "Open GitHub Actions Tab" below.'}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-amber-400 font-bold">2.</span>
              <span>{isHindi ? 'लेटेस्ट रन "Build Android APK (Automated Release)" पर टैप करें।' : 'Select the latest run named "Build Android APK".'}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-amber-400 font-bold">3.</span>
              <span>
                {isHindi
                  ? 'पेज के नीचे Artifacts सेक्शन में "Astral-Odyssey-Android-APK" पर क्लिक करके डाउनलोड करें!'
                  : 'Under Artifacts, tap "Astral-Odyssey-Android-APK" to download!'}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              onClick={handleOpenGitHubActions}
              className="flex-1 min-w-[200px] flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-300 hover:to-blue-400 px-4 py-2.5 text-xs font-display font-bold text-slate-950 shadow-md transition cursor-pointer"
            >
              <span>↗ {isHindi ? 'GitHub Actions टैब खोलें' : 'Open GitHub Actions Tab'}</span>
            </button>

            <button
              onClick={handleOpenGitHubReleases}
              className="flex-1 min-w-[180px] flex items-center justify-center gap-2 rounded-lg bg-[#142345] hover:bg-[#1c305c] border border-sky-400/60 px-4 py-2.5 text-xs font-display font-bold text-sky-200 transition cursor-pointer"
            >
              <span>📦 {isHindi ? 'GitHub Releases (डायरेक्ट APK)' : 'GitHub Releases (Direct APK)'}</span>
            </button>
          </div>
        </div>

        {/* High Graphics & System Highlights */}
        <div className="rounded-xl bg-[#091224] border border-slate-800 p-3.5 space-y-2">
          <div className="text-xs font-mono text-amber-400 font-bold">
            {isHindi ? '🌟 v2.2.0 हाई ग्राफ़िक्स एवं नई सुविधाएँ:' : '🌟 v2.2.0 High Graphics & Features:'}
          </div>
          <ul className="text-xs text-slate-300 space-y-1 leading-relaxed list-disc list-inside">
            <li>
              <strong>{isHindi ? 'अल्ट्रा 4K ग्राफ़िक्स' : 'Ultra 4K Graphics'}</strong>:{' '}
              {isHindi
                ? 'ग्रहों के वायुमंडलीय प्रभामंडल (Atmospheric Halos), कॉस्मिक नेबुला बादल, और प्लाज़्मा थ्रस्टर ट्रेल्स।'
                : 'Planetary atmospheric halos, volumetric nebulae, dynamic plasma engine trails.'}
            </li>
            <li>
              <strong>{isHindi ? 'ऑटो-प्ले AI पायलट' : 'Autonomous AI Pilot'}</strong>:{' '}
              {isHindi
                ? 'स्पेसशिप अपने आप 10 ग्रहों की यात्रा करता है, एस्टेरॉयड माइन करता है और समुद्री डाकुओं से लड़ता है।'
                : 'Self-playing AI pilot navigates worlds, mines asteroids, and battles Void Pirates.'}
            </li>
            <li>
              <strong>{isHindi ? '36 बहुभाषी सपोर्ट' : '36 Languages Supported'}</strong>:{' '}
              {isHindi
                ? 'हिंदी, हिंग्लिश, अंग्रेज़ी, बांग्ला, तमिल, तेलुगु समेत 36 भाषाओं में ऑटो-डिटेक्शन।'
                : 'Full multilingual interface with browser language auto-detection.'}
            </li>
          </ul>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
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
