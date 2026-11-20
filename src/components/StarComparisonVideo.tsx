import React, { useEffect, useRef, useState } from 'react';
import { FamousStarData } from '../data/famousStarsData';

interface StarComparisonVideoProps {
  star: FamousStarData;
  isHindi: boolean;
}

const TOTAL_DURATION_SEC = 30;

export const StarComparisonVideo: React.FC<StarComparisonVideoProps> = ({
  star,
  isHindi,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [voiceActive, setVoiceActive] = useState<boolean>(false);

  const timeRef = useRef<number>(0);
  const playingRef = useRef<boolean>(true);

  useEffect(() => {
    timeRef.current = 0;
    setCurrentTime(0);
    playingRef.current = true;
    setIsPlaying(true);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setVoiceActive(false);
    }
  }, [star.id]);

  useEffect(() => {
    playingRef.current = isPlaying;
  }, [isPlaying]);

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleToggleVoice = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (voiceActive) {
      window.speechSynthesis.cancel();
      setVoiceActive(false);
      return;
    }
    window.speechSynthesis.cancel();
    const script = isHindi
      ? `${star.hindiName}। यह तारा पृथ्वी से ${star.distanceLightYears} दूर स्थित है। आकार की तुलना में यह ${star.sunRadiusTextHi}। ${star.sunsVolumeFitHi}। इसकी खोज ${star.discoveryYear} में हुई थी: ${star.discoveredByHi}। ${star.whatWasDiscoveredHi}`
      : `${star.name}. Located ${star.distanceLightYears} from Earth. Compared to our Sun, it is ${star.sunRadiusTextEn}. ${star.sunsVolumeFitEn}. Discovered in ${star.discoveryYear} by ${star.discoveredByEn}. ${star.whatWasDiscoveredEn}`;

    const utter = new SpeechSynthesisUtterance(script);
    utter.lang = isHindi ? 'hi-IN' : 'en-US';
    utter.rate = 0.96;
    utter.onend = () => setVoiceActive(false);
    utter.onerror = () => setVoiceActive(false);
    setVoiceActive(true);
    window.speechSynthesis.speak(utter);
  };

  // Real-Time 60fps HTML5 Documentary Animation Loop (Sun vs Star Live Scale Comparison)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId = 0;
    let lastTs = performance.now();
    let uiSyncAcc = 0;

    // Static background starfield for video viewport
    const bgStars = Array.from({ length: 85 }, (_, i) => ({
      x: ((i * 197.3) % 100) / 100,
      y: ((i * 313.7) % 100) / 100,
      r: (i % 3) * 0.55 + 0.5,
      tw: (i % 7) * 0.6,
    }));

    const draw = (now: number) => {
      const dt = Math.min(0.05, (now - lastTs) / 1000);
      lastTs = now;

      if (playingRef.current) {
        timeRef.current += dt;
        if (timeRef.current >= TOTAL_DURATION_SEC) {
          timeRef.current = 0; // Seamless loop
        }
        uiSyncAcc += dt;
        if (uiSyncAcc >= 0.15) {
          uiSyncAcc = 0;
          setCurrentTime(timeRef.current);
        }
      }

      const t = timeRef.current;
      const w = canvas.width;
      const h = canvas.height;

      // 1. Deep Cosmic Backdrop
      const bgGrad = ctx.createRadialGradient(w * 0.5, h * 0.48, 12, w * 0.5, h * 0.5, w * 0.72);
      bgGrad.addColorStop(0, '#0c1630');
      bgGrad.addColorStop(1, '#02040b');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Twinkling background stars
      for (let i = 0; i < bgStars.length; i++) {
        const s = bgStars[i];
        const alpha = 0.35 + 0.5 * Math.sin(now * 0.002 + s.tw);
        ctx.fillStyle = `rgba(219, 234, 254, ${alpha.toFixed(2)})`;
        ctx.beginPath();
        ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Determine Documentary Chapter
      // Chapter 1 (0..8s): Discovery & Star Telemetry Scan
      // Chapter 2 (8..21s): Live Zoom-Out Sun vs Star Size Comparison + Solar System Orbits
      // Chapter 3 (21..30s): Volume Capacity (How many Suns fit inside!) & Breakthrough Science
      const ratio = star.sunRadiusMultiplier;

      if (t < 8) {
        // CHAPTER 1: Star Portrait + Radar Discovery Scan
        const p = t / 8;
        const cx = w * 0.5;
        const cy = h * 0.46;
        const starR = 54 + Math.sin(t * 2.4) * 3;

        // Pulsing Corona
        const corona = ctx.createRadialGradient(cx, cy, starR * 0.4, cx, cy, starR * 2.2);
        corona.addColorStop(0, star.coreColor);
        corona.addColorStop(0.42, star.color);
        corona.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = corona;
        ctx.beginPath();
        ctx.arc(cx, cy, starR * 2.2, 0, Math.PI * 2);
        ctx.fill();

        // Photosphere body
        const bodyGrad = ctx.createRadialGradient(cx - starR * 0.25, cy - starR * 0.25, 4, cx, cy, starR);
        bodyGrad.addColorStop(0, '#ffffff');
        bodyGrad.addColorStop(0.35, star.coreColor);
        bodyGrad.addColorStop(1, star.color);
        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, starR, 0, Math.PI * 2);
        ctx.fill();

        // Animated Discovery Telescope Reticle
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.72)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 6]);
        ctx.beginPath();
        ctx.arc(cx, cy, starR + 18 + Math.sin(t * 3) * 4, t * 0.8, t * 0.8 + Math.PI * 1.65);
        ctx.stroke();
        ctx.setLineDash([]);

        // Chapter Header & Discovery Overlay
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`CHAPTER 1/3 · DISCOVERED: ${star.discoveryYear}`, 14, 22);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(star.name.toUpperCase(), cx, h - 42);

        ctx.fillStyle = '#93c5fd';
        ctx.font = '12px sans-serif';
        const discText = isHindi ? star.discoveredByHi : star.discoveredByEn;
        ctx.fillText(discText.slice(0, 68), cx, h - 22);

        // Scanline sweep
        const scanY = (p * h) % h;
        ctx.fillStyle = 'rgba(56, 189, 248, 0.12)';
        ctx.fillRect(0, scanY, w, 3);
      } else if (t < 21) {
        // CHAPTER 2: LIVE ANIMATED SUN VS STAR SCALE COMPARISON!
        const p = Math.min(1, (t - 8) / 11); // 0 -> 1 smooth camera pull-back
        const ease = 1 - Math.pow(1 - p, 3);

        // Compute display radii smoothly scaling from Sun = 44px down to real visual proportion
        const maxDisplayStarR = Math.min(w * 0.34, h * 0.38);
        let sunDrawR: number;
        let starDrawR: number;

        if (ratio >= 1) {
          // Star is bigger than Sun: zoom out so Star fills right side and Sun shrinks proportionally!
          const targetStarR = maxDisplayStarR;
          const exactSunR = targetStarR / ratio;
          // Keep Sun at least 2.2px bright dot with callout arrow when star is 2,150x huge!
          const targetSunR = Math.max(2.2, Math.min(44, exactSunR));
          sunDrawR = 44 + (targetSunR - 44) * ease;
          starDrawR = Math.min(targetStarR, sunDrawR * Math.min(ratio, targetStarR / Math.max(1.5, sunDrawR)));
          if (ratio > 10) {
            starDrawR = 12 + (targetStarR - 12) * ease;
          }
        } else {
          // Star is smaller than Sun (e.g. Proxima Centauri 0.154x or TRAPPIST-1 0.119x)
          sunDrawR = maxDisplayStarR * 0.85;
          starDrawR = Math.max(8, sunDrawR * ratio) * (0.4 + 0.6 * ease);
        }

        const sunX = w * 0.22;
        const starX = w * 0.66;
        const cy = h * 0.5;

        // Draw Solar System Orbit Reference Rings when star is a Giant/Hypergiant (> 20x Sun)
        if (ratio > 20 && ease > 0.35) {
          ctx.save();
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.28)';
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 4]);
          // Earth Orbit (~215 R_sun), Jupiter Orbit (~1120 R_sun), Saturn Orbit (~2050 R_sun)
          const orbitRefs = [
            { label: 'Earth Orbit (1 AU)', rSolar: 215 },
            { label: 'Jupiter Orbit (5.2 AU)', rSolar: 1120 },
            { label: 'Saturn Orbit (9.5 AU)', rSolar: 2050 },
          ];
          orbitRefs.forEach((orb) => {
            const pxR = (orb.rSolar / Math.max(ratio, 220)) * maxDisplayStarR;
            if (pxR > 16 && pxR < maxDisplayStarR * 1.32) {
              ctx.beginPath();
              ctx.arc(starX, cy, pxR, 0, Math.PI * 2);
              ctx.stroke();
              ctx.fillStyle = 'rgba(125, 211, 252, 0.85)';
              ctx.font = '9px monospace';
              ctx.textAlign = 'center';
              ctx.fillText(orb.label, starX, cy - pxR - 4);
            }
          });
          ctx.restore();
        }

        // Draw OUR SUN (Left)
        const sunGlow = ctx.createRadialGradient(sunX, cy, sunDrawR * 0.2, sunX, cy, Math.max(18, sunDrawR * 2.4));
        sunGlow.addColorStop(0, '#fef9c3');
        sunGlow.addColorStop(0.45, '#f59e0b');
        sunGlow.addColorStop(1, 'rgba(245,158,11,0)');
        ctx.fillStyle = sunGlow;
        ctx.beginPath();
        ctx.arc(sunX, cy, Math.max(18, sunDrawR * 2.4), 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.arc(sunX, cy, sunDrawR, 0, Math.PI * 2);
        ctx.fill();

        // Sun Pointer Callout when Sun becomes tiny pixel next to Hypergiant
        ctx.fillStyle = '#fde047';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(isHindi ? 'हमारा सूर्य (1× R☉)' : 'OUR SUN (1× R☉)', sunX, cy + Math.max(28, sunDrawR + 18));
        if (ratio >= 500) {
          ctx.fillStyle = '#94a3b8';
          ctx.font = '10px monospace';
          ctx.fillText(isHindi ? '(1 पिक्सल बिंदु जितना!)' : '(Microscopic dot at true scale!)', sunX, cy + Math.max(42, sunDrawR + 32));
        }

        // Draw TARGET STAR (Right)
        const targetGlow = ctx.createRadialGradient(starX, cy, starDrawR * 0.3, starX, cy, starDrawR * 1.55);
        targetGlow.addColorStop(0, star.coreColor);
        targetGlow.addColorStop(0.58, star.color);
        targetGlow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = targetGlow;
        ctx.beginPath();
        ctx.arc(starX, cy, starDrawR * 1.55, 0, Math.PI * 2);
        ctx.fill();

        const targetBody = ctx.createRadialGradient(starX - starDrawR * 0.25, cy - starDrawR * 0.25, 2, starX, cy, starDrawR);
        targetBody.addColorStop(0, '#ffffff');
        targetBody.addColorStop(0.32, star.coreColor);
        targetBody.addColorStop(1, star.color);
        ctx.fillStyle = targetBody;
        ctx.beginPath();
        ctx.arc(starX, cy, starDrawR, 0, Math.PI * 2);
        ctx.fill();

        // Labels & Live Multiplier Counter
        const animatedMult = ratio >= 1 ? 1 + (ratio - 1) * ease : ratio;
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('CHAPTER 2/3 · LIVE SUN vs STAR SIZE COMPARISON', 14, 22);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 13px monospace';
        ctx.textAlign = 'right';
        ctx.fillText(
          `${animatedMult >= 10 ? Math.round(animatedMult).toLocaleString() : animatedMult.toFixed(2)}× SUN RADIUS`,
          w - 14,
          22
        );

        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(
          isHindi ? star.sunRadiusTextHi : star.sunRadiusTextEn,
          w * 0.5,
          h - 14
        );
      } else {
        // CHAPTER 3: Volume Capacity & Breakthrough Discovery Infographic
        const cx = w * 0.5;
        ctx.fillStyle = '#34d399';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('CHAPTER 3/3 · COSMIC VOLUME & SCIENTIFIC DISCOVERY', 14, 22);

        // Glowing central badge
        const pulse = 1 + 0.04 * Math.sin(t * 4);
        ctx.fillStyle = 'rgba(15, 23, 42, 0.82)';
        ctx.strokeStyle = star.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(18, 38, w - 36, h - 56, 14);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#fbbf24';
        ctx.font = `bold ${Math.round(16 * pulse)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(
          isHindi ? star.sunsVolumeFitHi : star.sunsVolumeFitEn,
          cx,
          76
        );

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 12px monospace';
        ctx.fillText(
          `TEMP: ${star.temperature}  ·  LUMINOSITY: ${star.luminositySolar}`,
          cx,
          104
        );

        ctx.fillStyle = '#e2e8f0';
        ctx.font = '12px sans-serif';
        const fullDisc = isHindi ? star.whatWasDiscoveredHi : star.whatWasDiscoveredEn;
        // Word-wrap into 3 clean lines
        const words = fullDisc.split(' ');
        const lines: string[] = [];
        let line = '';
        for (const word of words) {
          const test = line ? `${line} ${word}` : word;
          if (ctx.measureText(test).width > w - 68) {
            lines.push(line);
            line = word;
          } else {
            line = test;
          }
        }
        if (line) lines.push(line);
        lines.slice(0, 4).forEach((ln, idx) => {
          ctx.fillText(ln, cx, 134 + idx * 19);
        });
      }

      // Bottom Progress Bar inside Video Frame
      const progW = (t / TOTAL_DURATION_SEC) * w;
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ctx.fillRect(0, h - 4, w, 4);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(0, h - 4, progW, 4);

      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  }, [star, isHindi]);

  const formatSec = (s: number) => `0:${String(Math.floor(s)).padStart(2, '0')}`;

  return (
    <div className="rounded-2xl bg-[#050a18] border border-slate-700/90 overflow-hidden shadow-xl">
      <div className="relative w-full aspect-[16/9] bg-black">
        <canvas
          ref={canvasRef}
          width={560}
          height={250}
          className="w-full h-full block"
        />
        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-red-600/90 text-white font-mono text-[9px] font-bold tracking-wider">
          HD DOCUMENTARY
        </div>
      </div>

      {/* Video Transport Controls */}
      <div className="p-2.5 bg-[#0a1328] border-t border-slate-800 space-y-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying((p) => !p)}
            className="px-3 py-1 rounded-lg bg-amber-400 text-slate-950 font-display font-bold text-xs cursor-pointer shrink-0"
          >
            {isPlaying ? '⏸ Pause' : '▶ Play'}
          </button>

          <input
            type="range"
            min={0}
            max={TOTAL_DURATION_SEC}
            step={0.5}
            value={currentTime}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              timeRef.current = v;
              setCurrentTime(v);
            }}
            className="flex-1 accent-amber-400 h-1.5 cursor-pointer"
          />

          <span className="font-mono text-[10px] text-slate-300 shrink-0">
            {formatSec(currentTime)} / 0:30
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 text-[11px]">
          <div className="flex gap-1">
            {[
              { label: isHindi ? '1. खोज' : '1. Discovery', sec: 0 },
              { label: isHindi ? '2. सूर्य से तुलना' : '2. Sun Scale', sec: 8.2 },
              { label: isHindi ? '3. आयतन' : '3. Volume', sec: 21.2 },
            ].map((ch) => (
              <button
                key={ch.sec}
                onClick={() => {
                  timeRef.current = ch.sec;
                  setCurrentTime(ch.sec);
                  setIsPlaying(true);
                }}
                className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-sky-300 font-mono text-[10px] cursor-pointer"
              >
                {ch.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleToggleVoice}
            className={`px-2.5 py-1 rounded-md font-display font-bold text-[10px] cursor-pointer ${
              voiceActive
                ? 'bg-emerald-400 text-slate-950'
                : 'bg-sky-500/20 border border-sky-400/50 text-sky-200'
            }`}
          >
            {voiceActive
              ? isHindi
                ? '⏹ आवाज़ रोकें'
                : '⏹ Stop Voice'
              : isHindi
                ? '🎙️ हिंदी डॉक्यूमेंट्री सुनें'
                : '🎙️ Voice Narration'}
          </button>
        </div>
      </div>
    </div>
  );
};
