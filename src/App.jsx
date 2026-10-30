import React, { useState, useEffect } from "react";
import { ControlPanel } from "./components/ControlPanel.jsx";
import { Canvas } from "./components/Canvas.jsx";
import { InspectorSidebar } from "./components/InspectorSidebar.jsx";
import { Analytics } from "./components/Analytics.jsx";
import { useNetworkStore } from "./store/useNetworkStore.js";
import { ArrowRight, Activity, Cpu, ShieldCheck, AlertCircle } from "lucide-react";

export function App() {
  const [activeTab, setActiveTab] = useState("canvas"); // 'canvas' | 'analytics'
  const { recalculate, simulationResults, sourceNode, targetNode, algorithm } =
    useNetworkStore();

  useEffect(() => {
    recalculate();
  }, [recalculate]);

  const isMst = algorithm === "kruskal" || algorithm === "prim";

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Top Enterprise Control Bar */}
      <ControlPanel activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Workspace Area */}
      <div className="flex-1 flex overflow-hidden">
        {activeTab === "canvas" ? (
          <>
            <Canvas />
            <InspectorSidebar />
          </>
        ) : (
          <Analytics />
        )}
      </div>

      {/* High-Density Network Operator Telemetry Footer */}
      <footer className="h-8 border-t border-slate-800 bg-slate-950/95 px-4 flex items-center justify-between text-[11px] font-mono text-slate-400 select-none">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">ENGINE:</span>
            <span className="text-sky-400 font-semibold uppercase">{algorithm}</span>
          </div>

          <div className="h-3 w-px bg-slate-800" />

          {isMst ? (
            <div className="flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>
                MST Cost Optimized: ${simulationResults.totalDistance}k ({simulationResults.mstEdges?.length || 0} Spans)
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-slate-400">PATH:</span>
              {simulationResults.path.length > 0 ? (
                <div className="flex items-center gap-1 text-slate-200">
                  {simulationResults.path.map((nodeId, idx) => (
                    <React.Fragment key={nodeId}>
                      <span
                        className={
                          idx === 0
                            ? "text-emerald-400 font-bold"
                            : idx === simulationResults.path.length - 1
                            ? "text-amber-400 font-bold"
                            : "text-slate-300"
                        }
                      >
                        {nodeId}
                      </span>
                      {idx < simulationResults.path.length - 1 && (
                        <ArrowRight className="w-2.5 h-2.5 text-slate-600" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              ) : (
                <span className="text-rose-400 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> NO ROUTE (NETWORK PARTITIONED)
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">E2E DELAY:</span>
            <span className="text-slate-200 font-semibold">
              {typeof simulationResults.totalDistance === "number"
                ? `${simulationResults.totalDistance} ms`
                : simulationResults.totalDistance}
            </span>
          </div>

          <div className="h-3 w-px bg-slate-800" />

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">COMPUTE:</span>
            <span className="text-emerald-400 font-semibold">
              {simulationResults.executionTimeMs} ms
            </span>
          </div>

          <div className="h-3 w-px bg-slate-800" />

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">LINKS:</span>
            <span className="text-slate-200">
              {simulationResults.activeLinkCount} UP
            </span>
            {simulationResults.failedLinkCount > 0 && (
              <span className="text-rose-400 font-semibold">
                / {simulationResults.failedLinkCount} DOWN
              </span>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
