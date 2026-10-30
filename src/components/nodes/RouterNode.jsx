import React, { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { Server, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "../../lib/utils.js";

function RouterNodeComponent({ data, selected }) {
  const {
    label,
    name,
    ip,
    region,
    status = "active",
    load = 32,
    isSource = false,
    isTarget = false,
    isInPath = false,
  } = data;

  const statusColors = {
    active: "bg-emerald-500",
    "high-load": "bg-amber-500",
    offline: "bg-rose-500",
  };

  const statusBadge = {
    active: "text-emerald-400 border-emerald-900/50 bg-emerald-950/30",
    "high-load": "text-amber-400 border-amber-900/50 bg-amber-950/30",
    offline: "text-rose-400 border-rose-900/50 bg-rose-950/30",
  };

  return (
    <div
      className={cn(
        "relative rounded-md border bg-slate-900/95 text-slate-200 transition-all shadow-md select-none w-56 text-xs",
        selected
          ? "border-sky-500 ring-1 ring-sky-500/50"
          : isInPath
          ? "border-sky-500/80 bg-slate-900"
          : "border-slate-800 hover:border-slate-700",
        isSource && "border-emerald-500 ring-1 ring-emerald-500/40",
        isTarget && "border-amber-500 ring-1 ring-amber-500/40"
      )}
    >
      {/* React Flow handles for clean orthogonal & straight connectivity */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2 !h-2 !bg-slate-600 !border-slate-800"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2 !h-2 !bg-slate-600 !border-slate-800"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="!w-2 !h-2 !bg-slate-600 !border-slate-800"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="!w-2 !h-2 !bg-slate-600 !border-slate-800"
      />

      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-slate-800 px-2.5 py-1.5 bg-slate-950/60 rounded-t-md">
        <div className="flex items-center gap-1.5 font-mono font-semibold tracking-wide text-slate-100">
          <Server className="w-3.5 h-3.5 text-slate-400" />
          <span>{label}</span>
        </div>

        <div className="flex items-center gap-1.5">
          {isSource && (
            <span className="flex items-center gap-0.5 text-[10px] px-1 py-0.2 rounded font-mono font-medium bg-emerald-950/80 border border-emerald-800/80 text-emerald-400">
              <ArrowDownRight className="w-2.5 h-2.5" /> SRC
            </span>
          )}
          {isTarget && (
            <span className="flex items-center gap-0.5 text-[10px] px-1 py-0.2 rounded font-mono font-medium bg-amber-950/80 border border-amber-800/80 text-amber-400">
              <ArrowUpRight className="w-2.5 h-2.5" /> DST
            </span>
          )}
          <span
            className={cn(
              "w-2 h-2 rounded-full",
              statusColors[status] || "bg-emerald-500"
            )}
            title={`Status: ${status}`}
          />
        </div>
      </div>

      {/* Node Body Details */}
      <div className="p-2.5 space-y-2">
        <div className="flex justify-between items-baseline text-[11px]">
          <span className="text-slate-400 font-sans">{name}</span>
          <span className="text-slate-400 font-mono text-[10px] px-1 bg-slate-800/60 rounded border border-slate-800">
            {region}
          </span>
        </div>

        <div className="flex items-center justify-between font-mono text-[11px] text-slate-300">
          <span className="text-slate-500 text-[10px]">IPv4:</span>
          <span>{ip}</span>
        </div>

        {/* Load bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>CPU UTIL</span>
            <span
              className={cn(
                load > 75
                  ? "text-amber-400"
                  : load > 90
                  ? "text-rose-400"
                  : "text-slate-400"
              )}
            >
              {load}%
            </span>
          </div>
          <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-300",
                load > 75
                  ? "bg-amber-500"
                  : load > 90
                  ? "bg-rose-500"
                  : "bg-slate-400"
              )}
              style={{ width: `${load}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export const RouterNode = memo(RouterNodeComponent);
