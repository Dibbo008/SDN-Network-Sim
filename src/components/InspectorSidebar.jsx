import React from "react";
import {
  X,
  Server,
  Activity,
  Layers,
  ArrowRight,
  ShieldAlert,
  Power,
  Zap,
  DollarSign,
  Clock,
  Radio,
} from "lucide-react";
import { useNetworkStore } from "../store/useNetworkStore.js";
import { cn } from "../lib/utils.js";

export function InspectorSidebar() {
  const {
    selectedElement,
    selectElement,
    setSourceNode,
    setTargetNode,
    toggleEdgeFailure,
    sourceNode,
    targetNode,
  } = useNetworkStore();

  if (!selectedElement) {
    return (
      <aside className="w-80 border-l border-slate-800 bg-slate-950/80 p-4 flex flex-col justify-between text-slate-400 select-none">
        <div>
          <div className="flex items-center gap-2 text-slate-200 font-mono text-xs uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
            <Radio className="w-3.5 h-3.5 text-sky-400" />
            <span>Telemetry Inspector</span>
          </div>

          <div className="p-3 bg-slate-900/50 border border-slate-800/80 rounded-md text-xs space-y-2">
            <p className="text-slate-300 font-medium">No Element Selected</p>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Click on any router node or optical carrier link on the canvas to inspect real-time interface telemetry, BGP attributes, and link diagnostics.
            </p>
          </div>

          <div className="mt-6 space-y-3">
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wide">
              Quick Hint:
            </div>
            <ul className="text-[11px] text-slate-400 space-y-2 list-disc list-inside">
              <li>Click link <span className="font-mono text-slate-300">DOWN/ms</span> badge to simulate physical fiber cut.</li>
              <li>Select routers to designate as ingress/egress endpoints.</li>
              <li>Drag nodes to reorganize topology layout.</li>
            </ul>
          </div>
        </div>

        <div className="text-[10px] font-mono text-slate-400 border-t border-slate-800 pt-3">
          SDN-Sim Controller v2.4-Enterprise
        </div>
      </aside>
    );
  }

  const { type, data } = selectedElement;

  return (
    <aside className="w-80 border-l border-slate-800 bg-slate-950 p-4 flex flex-col justify-between text-slate-300 text-xs overflow-y-auto select-none">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            {type === "node" ? (
              <Server className="w-4 h-4 text-sky-400" />
            ) : (
              <Activity className="w-4 h-4 text-emerald-400" />
            )}
            <span className="font-mono font-semibold tracking-wide text-slate-100 uppercase">
              {type === "node" ? "Router Telemetry" : "Link Telemetry"}
            </span>
          </div>
          <button
            onClick={() => selectElement(null, null)}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Node Telemetry View */}
        {type === "node" && (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 p-3 rounded-md space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="font-mono text-sm font-bold text-slate-100">
                  {data.label}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  AS64512
                </span>
              </div>
              <div className="text-slate-400 text-[11px]">{data.name}</div>
            </div>

            {/* Spec grid */}
            <div className="space-y-2">
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                Network Interfaces & OS
              </div>
              <div className="bg-slate-900/60 border border-slate-800 rounded divide-y divide-slate-800 font-mono text-[11px]">
                <div className="flex justify-between p-2">
                  <span className="text-slate-400">Loopback IPv4</span>
                  <span className="text-slate-200">{data.ip}</span>
                </div>
                <div className="flex justify-between p-2">
                  <span className="text-slate-400">Region PoP</span>
                  <span className="text-slate-200">{data.region}</span>
                </div>
                <div className="flex justify-between p-2">
                  <span className="text-slate-400">OS Architecture</span>
                  <span className="text-slate-200">SONiC Linux 2024</span>
                </div>
                <div className="flex justify-between p-2">
                  <span className="text-slate-400">MTU Envelope</span>
                  <span className="text-slate-200">9216 Bytes</span>
                </div>
              </div>
            </div>

            {/* Performance metrics */}
            <div className="space-y-2">
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                Real-time System Load
              </div>
              <div className="bg-slate-900/60 border border-slate-800 rounded p-3 space-y-3 font-mono text-[11px]">
                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>CPU Core Utilization</span>
                    <span className="text-slate-200">{data.load}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        data.load > 75 ? "bg-amber-500" : "bg-sky-400"
                      )}
                      style={{ width: `${data.load}%` }}
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-1 border-t border-slate-800">
                  <span className="text-slate-400">Forwarding Engine</span>
                  <span className="text-emerald-400 font-sans text-[11px]">Wire-Speed Line Rate</span>
                </div>
              </div>
            </div>

            {/* Ingress / Egress assignment actions */}
            <div className="pt-2 flex gap-2">
              <button
                onClick={() => setSourceNode(data.id)}
                disabled={sourceNode === data.id}
                className={cn(
                  "flex-1 py-1.5 px-2 rounded font-mono text-[11px] border transition-colors",
                  sourceNode === data.id
                    ? "bg-emerald-950/60 border-emerald-800 text-emerald-400 cursor-default"
                    : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700"
                )}
              >
                {sourceNode === data.id ? "Ingress (Active)" : "Set Ingress"}
              </button>
              <button
                onClick={() => setTargetNode(data.id)}
                disabled={targetNode === data.id}
                className={cn(
                  "flex-1 py-1.5 px-2 rounded font-mono text-[11px] border transition-colors",
                  targetNode === data.id
                    ? "bg-amber-950/60 border-amber-800 text-amber-400 cursor-default"
                    : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700"
                )}
              >
                {targetNode === data.id ? "Egress (Active)" : "Set Egress"}
              </button>
            </div>
          </div>
        )}

        {/* Edge Telemetry View */}
        {type === "edge" && (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 p-3 rounded-md space-y-2">
              <div className="flex justify-between items-center font-mono">
                <span className="font-bold text-slate-100">{data.id}</span>
                <span
                  className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded border",
                    data.isFailed
                      ? "bg-rose-950/80 border-rose-800 text-rose-300"
                      : "bg-emerald-950/80 border-emerald-800 text-emerald-300"
                  )}
                >
                  {data.isFailed ? "FAULT / DOWN" : "OPERATIONAL"}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-mono">
                <span>{data.source}</span>
                <ArrowRight className="w-3 h-3 text-slate-500" />
                <span>{data.target}</span>
              </div>
            </div>

            {/* Optical link technical metrics */}
            <div className="space-y-2">
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                Physical Layer Parameters
              </div>
              <div className="bg-slate-900/60 border border-slate-800 rounded divide-y divide-slate-800 font-mono text-[11px]">
                <div className="flex justify-between p-2">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <Clock className="w-3 h-3 text-sky-400" /> Propagation Latency
                  </span>
                  <span className="text-slate-200">{data.weight} ms</span>
                </div>
                <div className="flex justify-between p-2">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <Zap className="w-3 h-3 text-amber-400" /> Provisioned Bandwidth
                  </span>
                  <span className="text-slate-200">{data.bandwidth || 100} Gbps</span>
                </div>
                <div className="flex justify-between p-2">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <ShieldAlert className="w-3 h-3 text-rose-400" /> Packet Loss Rate
                  </span>
                  <span className="text-slate-200">{(data.loss || 0.001) * 100}%</span>
                </div>
                <div className="flex justify-between p-2">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <DollarSign className="w-3 h-3 text-emerald-400" /> Infrastructure Cost
                  </span>
                  <span className="text-slate-200">${data.cost || 50}k</span>
                </div>
              </div>
            </div>

            {/* Fault injection button */}
            <div className="pt-2">
              <button
                onClick={() => toggleEdgeFailure(data.id)}
                className={cn(
                  "w-full flex items-center justify-center gap-2 py-2 px-3 rounded font-mono text-[11px] border transition-colors",
                  data.isFailed
                    ? "bg-emerald-950 border-emerald-700 text-emerald-300 hover:bg-emerald-900"
                    : "bg-rose-950 border-rose-800 text-rose-300 hover:bg-rose-900"
                )}
              >
                <Power className="w-3.5 h-3.5" />
                <span>
                  {data.isFailed ? "Restore Link (Clear Failure)" : "Simulate Fiber Cut (Down Link)"}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-slate-800 text-[10px] font-mono text-slate-400">
        Status: <span className="text-emerald-400">POLLING NORMAL</span>
      </div>
    </aside>
  );
}
