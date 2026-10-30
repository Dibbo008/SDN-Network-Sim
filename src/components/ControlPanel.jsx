import React from "react";
import {
  Network,
  RotateCcw,
  Zap,
  Activity,
  GitBranch,
  Layers,
  ArrowRight,
  ShieldCheck,
  BarChart3,
  Flame,
} from "lucide-react";
import { useNetworkStore } from "../store/useNetworkStore.js";
import { TOPOLOGY_PRESETS } from "../data/topologies.js";
import { cn } from "../lib/utils.js";

export function ControlPanel({ activeTab, setActiveTab }) {
  const {
    presetKey,
    loadPreset,
    algorithm,
    setAlgorithm,
    nodes,
    edges,
    sourceNode,
    setSourceNode,
    targetNode,
    setTargetNode,
    recalculate,
    resetAllFailures,
    simulationResults,
  } = useNetworkStore();

  const isMstAlgo = algorithm === "kruskal" || algorithm === "prim";

  return (
    <header className="h-14 border-b border-slate-800 bg-slate-950 px-4 flex items-center justify-between gap-4 text-xs select-none">
      {/* Brand & Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 font-mono font-bold text-slate-100 text-sm tracking-tight">
          <div className="p-1.5 rounded bg-sky-950 border border-sky-800/80 text-sky-400">
            <Network className="w-4 h-4" />
          </div>
          <span>SDN-Sim</span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 hidden sm:inline-block">
          v2.4-Enterprise
        </span>
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 border-l border-slate-800 pl-3">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="hidden md:inline">CONTROLLER SYNCHRONIZED</span>
        </div>
      </div>

      {/* Control Toggles: Topology Preset, Algorithm, Endpoints */}
      <div className="flex items-center gap-2.5 overflow-x-auto py-1">
        {/* Topology Preset Selector */}
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2 py-1 rounded">
          <span className="text-slate-400 text-[11px] font-mono">Preset:</span>
          <select
            value={presetKey}
            onChange={(e) => loadPreset(e.target.value)}
            className="bg-transparent text-slate-200 font-mono text-xs focus:outline-none cursor-pointer"
          >
            {Object.values(TOPOLOGY_PRESETS).map((p) => (
              <option key={p.id} value={p.id} className="bg-slate-900 text-slate-200">
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Algorithm Selector */}
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2 py-1 rounded">
          <span className="text-slate-400 text-[11px] font-mono">Algorithm:</span>
          <select
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value)}
            className="bg-transparent text-slate-200 font-mono text-xs focus:outline-none cursor-pointer font-semibold"
          >
            <optgroup label="Shortest Path Routing" className="bg-slate-950 text-slate-400">
              <option value="dijkstra" className="bg-slate-900 text-slate-200">
                Dijkstra (SPF)
              </option>
              <option value="bellman-ford" className="bg-slate-900 text-slate-200">
                Bellman-Ford (Vector)
              </option>
              <option value="floyd-warshall" className="bg-slate-900 text-slate-200">
                Floyd-Warshall (APSP)
              </option>
              <option value="johnson" className="bg-slate-900 text-slate-200">
                Johnson's Algorithm (APSP)
              </option>
            </optgroup>
            <optgroup label="Infrastructure Cost Optimizer (MST)" className="bg-slate-950 text-slate-400">
              <option value="kruskal" className="bg-slate-900 text-slate-200">
                Kruskal's MST (DSU)
              </option>
              <option value="prim" className="bg-slate-900 text-slate-200">
                Prim's MST (Greedy)
              </option>
            </optgroup>
          </select>
        </div>

        {/* Source / Destination Endpoints (Active only for Shortest Path) */}
        {!isMstAlgo && (
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2 py-1 rounded">
            <span className="text-emerald-400 font-mono text-[11px]">Src:</span>
            <select
              value={sourceNode}
              onChange={(e) => setSourceNode(e.target.value)}
              className="bg-transparent text-slate-200 font-mono text-xs focus:outline-none cursor-pointer"
            >
              {nodes.map((n) => (
                <option key={n.id} value={n.id} className="bg-slate-900 text-slate-200">
                  {n.data.label}
                </option>
              ))}
            </select>
            <ArrowRight className="w-3 h-3 text-slate-500" />
            <span className="text-amber-400 font-mono text-[11px]">Dst:</span>
            <select
              value={targetNode}
              onChange={(e) => setTargetNode(e.target.value)}
              className="bg-transparent text-slate-200 font-mono text-xs focus:outline-none cursor-pointer"
            >
              {nodes.map((n) => (
                <option key={n.id} value={n.id} className="bg-slate-900 text-slate-200">
                  {n.data.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Primary Actions & View Toggles */}
      <div className="flex items-center gap-2">
        {/* Optimize Topology MST Quick Action */}
        <button
          onClick={() => setAlgorithm(isMstAlgo ? "dijkstra" : "kruskal")}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1.5 rounded font-mono text-[11px] border transition-colors",
            isMstAlgo
              ? "bg-emerald-950 border-emerald-700 text-emerald-300"
              : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-slate-100"
          )}
          title="Optimize Topology using Minimum Spanning Tree"
        >
          <GitBranch className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">
            {isMstAlgo ? "MST Mode (Active)" : "Optimize Topology (MST)"}
          </span>
        </button>

        {/* Clear Faults / Reset Failures */}
        {simulationResults.failedLinkCount > 0 && (
          <button
            onClick={resetAllFailures}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded font-mono text-[11px] bg-rose-950/80 border border-rose-800 text-rose-300 hover:bg-rose-900 transition-colors"
            title="Restore all simulated link failures"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset ({simulationResults.failedLinkCount} Down)</span>
          </button>
        )}

        {/* Recalculate Routes */}
        <button
          onClick={recalculate}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded font-mono text-[11px] bg-sky-950 border border-sky-800 text-sky-300 hover:bg-sky-900 hover:text-white transition-colors"
        >
          <Zap className="w-3.5 h-3.5" />
          <span className="font-semibold">Recalculate</span>
        </button>

        {/* View Switcher: Topology Canvas vs Analytics & Benchmarks */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded p-0.5 ml-1">
          <button
            onClick={() => setActiveTab("canvas")}
            className={cn(
              "flex items-center gap-1 px-2.5 py-1 rounded font-mono text-[11px] transition-colors",
              activeTab === "canvas"
                ? "bg-slate-800 text-slate-100 font-semibold"
                : "text-slate-400 hover:text-slate-200"
            )}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Canvas</span>
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={cn(
              "flex items-center gap-1 px-2.5 py-1 rounded font-mono text-[11px] transition-colors",
              activeTab === "analytics"
                ? "bg-slate-800 text-slate-100 font-semibold"
                : "text-slate-400 hover:text-slate-200"
            )}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Analytics</span>
          </button>
        </div>
      </div>
    </header>
  );
}
