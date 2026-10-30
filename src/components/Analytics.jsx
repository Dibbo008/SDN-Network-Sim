import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  DollarSign,
  Clock,
  ShieldCheck,
  Zap,
  Play,
  Grid,
  BarChart2,
  GitCommit,
  CheckCircle2,
} from "lucide-react";
import { useNetworkStore } from "../store/useNetworkStore.js";
import { runFloydWarshall } from "../engine/floydWarshall.js";
import {
  DEFAULT_BENCHMARK_DATA,
  runHardwareBenchmark,
} from "../engine/benchmark.js";
import { cn } from "../lib/utils.js";

// Custom dark Recharts tooltip
function CustomChartTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-700/80 p-2.5 rounded shadow-lg text-xs font-mono space-y-1">
        <div className="text-slate-400 font-bold border-b border-slate-800 pb-1 mb-1">
          Topology Scale: {label} Nodes
        </div>
        {payload.map((entry) => (
          <div key={entry.name} className="flex justify-between items-center gap-4">
            <span style={{ color: entry.color }}>{entry.name}:</span>
            <span className="text-slate-200 font-bold">{entry.value} ms</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export function Analytics() {
  const { nodes, edges, simulationResults, sourceNode, targetNode, algorithm } =
    useNetworkStore();

  const [benchmarkData, setBenchmarkData] = useState(DEFAULT_BENCHMARK_DATA);
  const [isBenchmarking, setIsBenchmarking] = useState(false);

  // Compute APSP Routing Matrix on demand if not already in simulationResults
  const routingMatrix = useMemo(() => {
    if (simulationResults.matrix) return simulationResults.matrix;
    const nodeIds = nodes.map((n) => n.id);
    const activeEdges = edges
      .filter((e) => !e.data.isFailed)
      .map((e) => ({
        source: e.source,
        target: e.target,
        weight: e.data.weight,
      }));
    const res = runFloydWarshall(nodeIds, activeEdges);
    return res.matrix;
  }, [nodes, edges, simulationResults.matrix]);

  const handleRunLiveBenchmark = () => {
    setIsBenchmarking(true);
    setTimeout(() => {
      try {
        const liveResults = runHardwareBenchmark([10, 20, 40, 60, 80, 100]);
        setBenchmarkData(liveResults);
      } finally {
        setIsBenchmarking(false);
      }
    }, 50);
  };

  const nodeIds = nodes.map((n) => n.id);

  return (
    <div className="flex-1 h-full overflow-y-auto bg-slate-950 p-6 space-y-6 text-slate-200 select-none">
      {/* Telemetry Metric Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        {/* Total Topology Cost */}
        <div className="p-4 rounded-md border border-slate-800 bg-slate-900/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>INFRASTRUCTURE COST</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-100">
            ${simulationResults.totalTopologyCost.toLocaleString()}k
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            {algorithm.includes("mst")
              ? "Optimized Minimum Spanning Tree"
              : `${simulationResults.activeLinkCount} Operational Optical Spans`}
          </div>
        </div>

        {/* Average Latency */}
        <div className="p-4 rounded-md border border-slate-800 bg-slate-900/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>AVG PROPAGATION DELAY</span>
            <Clock className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-100">
            {simulationResults.avgLatency} ms
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Active link average (1-way DWDM)
          </div>
        </div>

        {/* Selected Route Path Latency */}
        <div className="p-4 rounded-md border border-slate-800 bg-slate-900/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>END-TO-END DELAY</span>
            <GitCommit className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-100">
            {typeof simulationResults.totalDistance === "number"
              ? `${simulationResults.totalDistance} ms`
              : simulationResults.totalDistance}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            From {sourceNode} to {targetNode} ({simulationResults.path.length} hops)
          </div>
        </div>

        {/* Network Redundancy Score & Execution Time */}
        <div className="p-4 rounded-md border border-slate-800 bg-slate-900/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>REDUNDANCY / TIMER</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-100">
              {simulationResults.redundancyScore}%
            </span>
            <span className="text-xs text-sky-400 font-mono">
              {simulationResults.executionTimeMs} ms
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Fault Tolerance: {simulationResults.redundancyScore > 70 ? "Mesh Redundant" : "Sub-Optimal"}
          </div>
        </div>
      </div>

      {/* Benchmark Comparison Charts Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-sky-400" />
            <h2 className="font-mono text-sm font-semibold tracking-wide text-slate-100 uppercase">
              Algorithmic Latency vs. Node Scale Benchmark
            </h2>
          </div>

          <button
            onClick={handleRunLiveBenchmark}
            disabled={isBenchmarking}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded font-mono text-xs bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 transition-colors"
          >
            <Play className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              {isBenchmarking ? "Running Microbenchmarks..." : "Run Live Hardware Benchmark"}
            </span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Dijkstra vs Bellman-Ford */}
          <div className="p-4 rounded-md border border-slate-800 bg-slate-900/40 space-y-3">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="font-semibold text-slate-200">
                Single-Source Shortest Path (SSSP)
              </span>
              <span className="text-slate-400">Dijkstra vs. Bellman-Ford</span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={benchmarkData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    dataKey="scale"
                    stroke="#64748b"
                    tick={{ fill: "#64748b", fontSize: 11, fontFamily: "monospace" }}
                    unit=" nodes"
                  />
                  <YAxis
                    stroke="#64748b"
                    tick={{ fill: "#64748b", fontSize: 11, fontFamily: "monospace" }}
                    unit="ms"
                  />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: "11px", fontFamily: "monospace", paddingTop: "10px" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="dijkstra"
                    name="Dijkstra O((V+E) log V)"
                    stroke="#38bdf8"
                    strokeWidth={2}
                    dot={{ r: 3, fill: "#38bdf8" }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="bellmanFord"
                    name="Bellman-Ford O(V * E)"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={{ r: 3, fill: "#f59e0b" }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Note: Bellman-Ford exhibits $O(V \cdot E)$ growth suitable for negative weights, whereas Dijkstra scales efficiently with MinHeap priority queue.
            </div>
          </div>

          {/* Chart 2: Johnson's vs Floyd-Warshall */}
          <div className="p-4 rounded-md border border-slate-800 bg-slate-900/40 space-y-3">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="font-semibold text-slate-200">
                All-Pairs Shortest Path (APSP)
              </span>
              <span className="text-slate-400">Johnson's vs. Floyd-Warshall</span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={benchmarkData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    dataKey="scale"
                    stroke="#64748b"
                    tick={{ fill: "#64748b", fontSize: 11, fontFamily: "monospace" }}
                    unit=" nodes"
                  />
                  <YAxis
                    stroke="#64748b"
                    tick={{ fill: "#64748b", fontSize: 11, fontFamily: "monospace" }}
                    unit="ms"
                  />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: "11px", fontFamily: "monospace", paddingTop: "10px" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="johnson"
                    name="Johnson's O(V² log V + VE)"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ r: 3, fill: "#10b981" }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="floydWarshall"
                    name="Floyd-Warshall O(V³)"
                    stroke="#a855f7"
                    strokeWidth={2}
                    dot={{ r: 3, fill: "#a855f7" }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Note: Johnson's sparse graph optimization outperforms Floyd-Warshall's $O(V^3)$ cubic asymptotic complexity as WAN node density expands.
            </div>
          </div>
        </div>
      </div>

      {/* All-Pairs Shortest Path Routing Matrix Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Grid className="w-4 h-4 text-emerald-400" />
            <h3 className="font-mono text-sm font-semibold tracking-wide text-slate-100 uppercase">
              Global Routing Distance Matrix (APSP ms)
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Real-time Computed End-to-End Latency
          </span>
        </div>

        <div className="border border-slate-800 rounded-md overflow-x-auto bg-slate-900/60">
          <table className="w-full text-left font-mono text-[11px] border-collapse">
            <thead>
              <tr className="bg-slate-950/90 border-b border-slate-800 text-slate-400">
                <th className="p-2.5 border-r border-slate-800 sticky left-0 bg-slate-950 z-10 text-slate-300">
                  SRC \ DST
                </th>
                {nodeIds.map((id) => (
                  <th
                    key={id}
                    className={cn(
                      "p-2.5 text-center min-w-[56px] border-r border-slate-800/60 font-semibold",
                      id === targetNode ? "bg-amber-950/50 text-amber-300" : ""
                    )}
                  >
                    {id}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {nodeIds.map((srcId) => (
                <tr
                  key={srcId}
                  className={cn(
                    "hover:bg-slate-800/40 transition-colors",
                    srcId === sourceNode ? "bg-emerald-950/30" : ""
                  )}
                >
                  <td
                    className={cn(
                      "p-2.5 font-bold border-r border-slate-800 sticky left-0 bg-slate-950 z-10",
                      srcId === sourceNode ? "text-emerald-400" : "text-slate-300"
                    )}
                  >
                    {srcId}
                  </td>
                  {nodeIds.map((dstId) => {
                    const val = routingMatrix?.[srcId]?.[dstId];
                    const isSelectedPair = srcId === sourceNode && dstId === targetNode;

                    return (
                      <td
                        key={dstId}
                        className={cn(
                          "p-2.5 text-center border-r border-slate-800/40",
                          isSelectedPair
                            ? "bg-sky-950 border-sky-600 font-bold text-sky-300 ring-1 ring-sky-500"
                            : srcId === dstId
                            ? "text-slate-600 bg-slate-950/40"
                            : val === Infinity
                            ? "text-rose-500 font-semibold"
                            : "text-slate-300"
                        )}
                      >
                        {srcId === dstId ? "0" : val === Infinity ? "∞" : val ?? "-"}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
