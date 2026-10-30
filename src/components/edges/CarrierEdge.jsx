import React, { memo } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getStraightPath,
} from "@xyflow/react";
import { AlertTriangle, Power, Check } from "lucide-react";
import { cn } from "../../lib/utils.js";
import { useNetworkStore } from "../../store/useNetworkStore.js";

function CarrierEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data = {},
  selected,
}) {
  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  const { toggleEdgeFailure, selectElement } = useNetworkStore();

  const {
    weight = 10,
    bandwidth = 100,
    loss = 0.001,
    cost = 50,
    isFailed = false,
    isActivePath = false,
    isMst = false,
  } = data;

  // Determine line styling based on network state
  let strokeColor = "#334155"; // slate-700
  let strokeWidth = 1.5;
  let strokeDasharray = undefined;

  if (isFailed) {
    strokeColor = "#e11d48"; // rose-600
    strokeDasharray = "4 4";
    strokeWidth = 1.5;
  } else if (isActivePath) {
    strokeColor = "#38bdf8"; // sky-400
    strokeDasharray = "6 4";
    strokeWidth = 2.2;
  } else if (isMst) {
    strokeColor = "#10b981"; // emerald-500
    strokeWidth = 2;
  } else if (selected) {
    strokeColor = "#94a3b8"; // slate-400
    strokeWidth = 2;
  }

  const handleToggle = (e) => {
    e.stopPropagation();
    toggleEdgeFailure(id);
  };

  const handleSelect = (e) => {
    e.stopPropagation();
    selectElement("edge", { id, ...data });
  };

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: strokeColor,
          strokeWidth,
          strokeDasharray,
          transition: "stroke 0.2s ease, stroke-width 0.2s ease",
        }}
      />

      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
          }}
          onClick={handleSelect}
          className="group cursor-pointer select-none"
        >
          <div
            className={cn(
              "flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono border backdrop-blur-md transition-all shadow-sm",
              isFailed
                ? "bg-rose-950/90 border-rose-800 text-rose-300"
                : isActivePath
                ? "bg-sky-950/90 border-sky-700 text-sky-200"
                : isMst
                ? "bg-emerald-950/90 border-emerald-700 text-emerald-300"
                : "bg-slate-900/90 border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-200"
            )}
          >
            {isFailed ? (
              <span className="flex items-center gap-1 text-rose-400 font-semibold">
                <AlertTriangle className="w-2.5 h-2.5" />
                DOWN
              </span>
            ) : (
              <span>{weight}ms</span>
            )}

            {/* Quick interactive failure toggle button */}
            <button
              onClick={handleToggle}
              title={isFailed ? "Restore Link" : "Simulate Link Failure"}
              className={cn(
                "p-0.5 rounded transition-colors opacity-70 hover:opacity-100",
                isFailed
                  ? "bg-rose-900 hover:bg-rose-800 text-rose-200"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-300"
              )}
            >
              <Power className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export const CarrierEdge = memo(CarrierEdgeComponent);
