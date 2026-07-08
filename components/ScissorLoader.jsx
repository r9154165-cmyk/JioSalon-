"use client";

/**
 * ScissorLoader — 3D scissor-cutting loading animation
 * Usage:
 *   import ScissorLoader from "@/components/ScissorLoader";
 *   <ScissorLoader message="Taking your seat" />
 *
 * Drop this file into: components/ScissorLoader.jsx
 * Requires: tailwind.config.js updated with the cola/vanilla/gold palette
 * and strandCut / snipTop / snipBottom animations (see tailwind.config.js).
 */
export default function ScissorLoader({ message = "Loading" }) {
  return (
    <div className="flex flex-col items-center gap-4 py-10">
      <div className="relative w-40 h-28" style={{ perspective: "600px" }}>
        {/* hair strand being cut */}
        <div
          className="absolute top-14 left-0 w-40 h-[3px] rounded-full animate-strandCut"
          style={{
            background:
              "linear-gradient(90deg, transparent, #7E1E2A 15%, #7E1E2A 85%, transparent)",
          }}
        />

        {/* scissor */}
        <div
          className="absolute left-1/2 top-1/2"
          style={{
            transform: "translate(-50%,-50%) rotateX(18deg)",
            transformStyle: "preserve-3d",
          }}
        >
          {/* pivot dot */}
          <div className="absolute left-0 top-0 w-3 h-3 rounded-full bg-cola-600 shadow-md z-10" />

          {/* top blade */}
          <div
            className="absolute left-0 top-0 w-[52px] h-[10px] rounded-r-[10px] rounded-l-[3px] shadow-md animate-snipTop"
            style={{
              transformOrigin: "6px 5px",
              background: "linear-gradient(180deg,#EAE0C8,#C9A24B)",
            }}
          />

          {/* bottom blade */}
          <div
            className="absolute left-0 top-0 w-[52px] h-[10px] rounded-r-[10px] rounded-l-[3px] shadow-md animate-snipBottom"
            style={{
              transformOrigin: "6px 5px",
              background: "linear-gradient(180deg,#D8CBA6,#B58A38)",
            }}
          />
        </div>
      </div>

      <p className="font-display text-cola-800 text-base tracking-wide">
        {message}
        <span className="inline-block animate-pulse">...</span>
      </p>
    </div>
  );
}
