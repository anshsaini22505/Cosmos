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
    <div className="relative w-16 h-16 rounded-full bg-[#050914]/95 border border-slate-700/90 shadow-inner overflow-hidden shrink-0">
      <svg viewBox="-50 -50 100 100" className="w-full h-full">
        <circle
          cx="0"
          cy="0"
          r="46"
          fill="none"
          stroke="rgba(56, 189, 248, 0.25)"
          strokeWidth="0.9"
        />
        <circle
          cx="0"
          cy="0"
          r="25"
          fill="none"
          stroke="rgba(148, 163, 184, 0.18)"
          strokeWidth="0.7"
          strokeDasharray="2 2"
        />
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
        <path
          d="M 0 0 L -18 -46 L 18 -46 Z"
          fill="rgba(56, 189, 248, 0.08)"
        />
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
                  fontSize="6"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {b.label}
                </text>
              )}
            </g>
          );
        })}
        <polygon points="0,-4.5 -3.5,3.5 0,1.8 3.5,3.5" fill="#f8fafc" />
      </svg>
    </div>
  );
};

interface MobileTouchControllerProps {
  touchInputRef: React.MutableRefObject<TouchInputState>;
  onScanPlanet: () => void;
  onQuickBuildTurret?: () => void;
  onFireMissile?: () => void;
}

export const MobileTouchController: React.FC<MobileTouchControllerProps> = ({
  touchInputRef,
  onScanPlanet,
}) => {
  const stickZoneRef = useRef<HTMLDivElement>(null);
  const [knobPos, setKnobPos] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
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
    touchInputRef.current.turnAxis = -(dx / maxR);
    touchInputRef.current.thrustAxis = -(dy / maxR);
  };

  const resetStick = () => {
    setKnobPos({ x: 0, y: 0 });
    touchInputRef.current.turnAxis = 0;
    touchInputRef.current.thrustAxis = 0;
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 sm:bottom-24 z-20 flex items-end justify-between px-4 sm:px-8">
      {/* LEFT THUMB: Clean Research Spacecraft Flight Stick */}
      <div
        ref={stickZoneRef}
        onPointerDown={(e) => {
          e.stopPropagation();
          e.currentTarget.setPointerCapture(e.pointerId);
          updateStick(e.clientX, e.clientY);
        }}
        onPointerMove={(e) => {
          e.stopPropagation();
          if (e.buttons > 0 || e.pointerType === 'touch') {
            updateStick(e.clientX, e.clientY);
          }
        }}
        onPointerUp={(e) => {
          e.stopPropagation();
          resetStick();
        }}
        onPointerCancel={resetStick}
        style={{ touchAction: 'none' }}
        className="pointer-events-auto relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#070c1a]/85 border border-sky-400/40 flex items-center justify-center shadow-xl"
      >
        <div className="text-[8px] font-mono text-slate-400 uppercase tracking-wider pointer-events-none">
          FLY / STEER
        </div>
        <div
          style={{
            transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
          }}
          className="absolute w-10 h-10 rounded-full bg-sky-400/90 border-2 border-white shadow-md pointer-events-none flex items-center justify-center"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-slate-950" />
        </div>
      </div>

      {/* RIGHT THUMB: Clean 2-Button Observatory Controls (Warp Boost + Inspect World) */}
      <div
        style={{ touchAction: 'none' }}
        className="pointer-events-auto flex flex-col gap-2"
      >
        <button
          onPointerDown={(e) => {
            e.stopPropagation();
            touchInputRef.current.boosting = true;
            setIsBoosting(true);
          }}
          onPointerUp={(e) => {
            e.stopPropagation();
            touchInputRef.current.boosting = false;
            setIsBoosting(false);
          }}
          onPointerLeave={() => {
            touchInputRef.current.boosting = false;
            setIsBoosting(false);
          }}
          className={`min-w-[110px] min-h-[44px] px-3.5 py-2 rounded-xl border font-display font-bold text-xs tracking-wide transition-transform active:scale-95 cursor-pointer ${
            isBoosting
              ? 'bg-amber-400 text-slate-950 border-white'
              : 'bg-[#0b152c]/90 text-amber-300 border-amber-400/50'
          }`}
        >
          WARP BOOST
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onScanPlanet();
          }}
          className="min-w-[110px] min-h-[44px] px-3.5 py-2 rounded-xl bg-[#0b152c]/90 border border-sky-400/50 text-sky-200 font-display font-bold text-xs tracking-wide active:scale-95 cursor-pointer"
        >
          INSPECT 3D
        </button>
      </div>
    </div>
  );
};
