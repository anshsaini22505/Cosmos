import React, { useRef, useState } from 'react';

export interface TouchInputState {
  turnAxis: number; // -1 (left) to +1 (right)
  thrustAxis: number; // -1 (reverse) to +1 (forward)
  firing: boolean;
  boosting: boolean;
}

export interface RadarBlip {
  x: number; // -1 to +1 normalized relative to ship
  z: number; // -1 to +1 normalized relative to ship
  color: string;
  size: number;
  label?: string;
}

interface RadarMinimapProps {
  blips: RadarBlip[];
  shipYaw: number;
}

export const TacticalRadarMinimap: React.FC<RadarMinimapProps> = ({
  blips,
}) => {
  return (
    <div className="relative w-24 h-24 rounded-full bg-[#050914]/95 border border-slate-700/90 shadow-inner overflow-hidden shrink-0">
      <svg viewBox="-50 -50 100 100" className="w-full h-full">
        {/* Range Rings */}
        <circle
          cx="0"
          cy="0"
          r="46"
          fill="none"
          stroke="rgba(56, 189, 248, 0.2)"
          strokeWidth="0.8"
        />
        <circle
          cx="0"
          cy="0"
          r="26"
          fill="none"
          stroke="rgba(148, 163, 184, 0.16)"
          strokeWidth="0.7"
          strokeDasharray="2 2"
        />
        {/* Crosshairs */}
        <line
          x1="-48"
          y1="0"
          x2="48"
          y2="0"
          stroke="rgba(148, 163, 184, 0.14)"
          strokeWidth="0.6"
        />
        <line
          x1="0"
          y1="-48"
          x2="0"
          y2="48"
          stroke="rgba(148, 163, 184, 0.14)"
          strokeWidth="0.6"
        />

        {/* Forward Cone */}
        <path
          d="M 0 0 L -18 -46 L 18 -46 Z"
          fill="rgba(56, 189, 248, 0.06)"
        />

        {/* Blips (Planets, Pirates, Outposts) */}
        {blips.map((b, idx) => {
          const cx = Math.max(-43, Math.min(43, b.x * 43));
          const cy = Math.max(-43, Math.min(43, b.z * 43));
          return (
            <g key={idx}>
              <circle cx={cx} cy={cy} r={b.size} fill={b.color} />
              {b.label && (
                <text
                  x={cx + 3}
                  y={cy + 2}
                  fill="#cbd5e1"
                  fontSize="5.5"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {b.label}
                </text>
              )}
            </g>
          );
        })}

        {/* Player Ship Center Triangle */}
        <polygon points="0,-4.5 -3.5,3.5 0,1.8 3.5,3.5" fill="#f8fafc" />
      </svg>
      <div className="absolute bottom-1 inset-x-0 text-center text-[8px] font-mono text-sky-400/80 tracking-widest">
        RADAR
      </div>
    </div>
  );
};

interface MobileTouchControllerProps {
  touchInputRef: React.MutableRefObject<TouchInputState>;
  onScanPlanet: () => void;
  onQuickBuildTurret: () => void;
  onFireMissile: () => void;
}

export const MobileTouchController: React.FC<MobileTouchControllerProps> = ({
  touchInputRef,
  onScanPlanet,
  onQuickBuildTurret,
  onFireMissile,
}) => {
  const stickZoneRef = useRef<HTMLDivElement>(null);
  const [knobPos, setKnobPos] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [isFiring, setIsFiring] = useState(false);
  const [isBoosting, setIsBoosting] = useState(false);

  const updateStick = (clientX: number, clientY: number) => {
    const zone = stickZoneRef.current;
    if (!zone) return;
    const rect = zone.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const maxR = rect.width * 0.42;

    let dx = clientX - cx;
    let dy = clientY - cy;
    const dist = Math.hypot(dx, dy);
    if (dist > maxR) {
      dx = (dx / dist) * maxR;
      dy = (dy / dist) * maxR;
    }

    setKnobPos({ x: dx, y: dy });
    // Negative dx = turn left (+1 yaw), Positive dx = turn right (-1 yaw)
    touchInputRef.current.turnAxis = -(dx / maxR);
    // Negative dy (up) = forward thrust (+1), Positive dy (down) = reverse (-1)
    touchInputRef.current.thrustAxis = -(dy / maxR);
  };

  const resetStick = () => {
    setKnobPos({ x: 0, y: 0 });
    touchInputRef.current.turnAxis = 0;
    touchInputRef.current.thrustAxis = 0;
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 sm:bottom-28 z-20 flex items-end justify-between px-4 sm:px-8">
      {/* LEFT THUMB: Virtual Flight Analog Stick */}
      <div
        ref={stickZoneRef}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          updateStick(e.clientX, e.clientY);
        }}
        onPointerMove={(e) => {
          if (e.buttons > 0 || e.pointerType === 'touch') {
            updateStick(e.clientX, e.clientY);
          }
        }}
        onPointerUp={resetStick}
        onPointerCancel={resetStick}
        style={{ touchAction: 'none' }}
        className="pointer-events-auto relative w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-[#070c1a]/88 border-2 border-sky-400/45 flex items-center justify-center shadow-xl"
      >
        <div className="text-[9px] font-mono text-slate-400 uppercase tracking-wider pointer-events-none">
          STEER / FLY
        </div>
        <div
          style={{
            transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
          }}
          className="absolute w-12 h-12 rounded-full bg-sky-400/90 border-2 border-white shadow-md pointer-events-none flex items-center justify-center"
        >
          <div className="w-3 h-3 rounded-full bg-slate-950" />
        </div>
      </div>

      {/* RIGHT THUMB: Ergonomic Action Cluster (48x48px+ Hit Targets) */}
      <div
        style={{ touchAction: 'none' }}
        className="pointer-events-auto grid grid-cols-2 gap-2.5"
      >
        <button
          onPointerDown={() => {
            touchInputRef.current.boosting = true;
            setIsBoosting(true);
          }}
          onPointerUp={() => {
            touchInputRef.current.boosting = false;
            setIsBoosting(false);
          }}
          onPointerLeave={() => {
            touchInputRef.current.boosting = false;
            setIsBoosting(false);
          }}
          className={`min-w-[68px] min-h-[52px] px-3 py-2 rounded-2xl border font-display font-bold text-xs tracking-wide transition-transform active:scale-95 cursor-pointer ${
            isBoosting
              ? 'bg-amber-400 text-slate-950 border-white'
              : 'bg-[#0b152c]/92 text-amber-300 border-amber-400/60'
          }`}
        >
          BOOST
        </button>

        <button
          onClick={onScanPlanet}
          className="min-w-[68px] min-h-[52px] px-3 py-2 rounded-2xl bg-[#0b152c]/92 border border-sky-400/50 text-sky-300 font-display font-bold text-xs tracking-wide active:scale-95 cursor-pointer"
        >
          SCAN
        </button>

        <button
          onClick={onQuickBuildTurret}
          className="min-w-[68px] min-h-[48px] px-3 py-1.5 rounded-2xl bg-[#0b152c]/92 border border-emerald-400/50 text-emerald-300 font-display font-bold text-xs tracking-wide active:scale-95 cursor-pointer"
        >
          +TURRET
        </button>

        <button
          onClick={() => {
            onFireMissile();
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
              navigator.vibrate(25);
            }
          }}
          className="min-w-[68px] min-h-[48px] px-3 py-1.5 rounded-2xl bg-[#0b152c]/92 border border-purple-400/60 text-purple-300 font-display font-bold text-xs tracking-wide active:scale-95 cursor-pointer"
        >
          MISSILE
        </button>

        <button
          onPointerDown={() => {
            touchInputRef.current.firing = true;
            setIsFiring(true);
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
              navigator.vibrate(15);
            }
          }}
          onPointerUp={() => {
            touchInputRef.current.firing = false;
            setIsFiring(false);
          }}
          onPointerLeave={() => {
            touchInputRef.current.firing = false;
            setIsFiring(false);
          }}
          className={`col-span-2 min-w-[140px] min-h-[54px] px-4 py-2 rounded-2xl border-2 font-display font-bold text-xs tracking-wider transition-transform active:scale-95 cursor-pointer ${
            isFiring
              ? 'bg-red-500 text-white border-white'
              : 'bg-red-600/90 text-white border-red-400'
          }`}
        >
          FIRE PULSE LASERS
        </button>
      </div>
    </div>
  );
};
