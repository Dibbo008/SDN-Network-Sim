import React, { useMemo, useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  applyNodeChanges,
  applyEdgeChanges,
} from "@xyflow/react";
import { RouterNode } from "./nodes/RouterNode.jsx";
import { CarrierEdge } from "./edges/CarrierEdge.jsx";
import { useNetworkStore } from "../store/useNetworkStore.js";

export function Canvas() {
  const {
    nodes,
    edges,
    selectElement,
    onNodesChange,
    onEdgesChange,
  } = useNetworkStore();

  const nodeTypes = useMemo(() => ({ routerNode: RouterNode }), []);
  const edgeTypes = useMemo(() => ({ carrierEdge: CarrierEdge }), []);

  const onNodeClick = useCallback(
    (_, node) => {
      selectElement("node", node.data);
    },
    [selectElement]
  );

  const onEdgeClick = useCallback(
    (_, edge) => {
      selectElement("edge", edge.data);
    },
    [selectElement]
  );

  const onPaneClick = useCallback(() => {
    selectElement(null, null);
  }, [selectElement]);

  return (
    <div className="flex-1 h-full w-full relative bg-slate-950 overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={1.8}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          color="#1e293b"
          gap={24}
          size={1.2}
          className="bg-slate-950"
        />

        <Controls
          className="!bg-slate-900 !border-slate-800 !text-slate-400"
          showInteractive={false}
        />

        <MiniMap
          nodeStrokeColor="#475569"
          nodeColor="#1e293b"
          nodeBorderRadius={2}
          maskColor="rgba(2, 6, 23, 0.7)"
          className="!bg-slate-950 !border !border-slate-800 !rounded-md !overflow-hidden"
          style={{ width: 150, height: 100 }}
        />
      </ReactFlow>

      {/* Subtle canvas HUD legend */}
      <div className="absolute bottom-4 left-4 z-10 flex items-center gap-4 px-3 py-1.5 rounded-md bg-slate-900/90 border border-slate-800/90 text-[11px] font-mono text-slate-400 backdrop-blur-sm shadow-sm select-none">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-slate-600 inline-block" />
          <span>Operational Link</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-sky-400 border-dashed inline-block" />
          <span className="text-sky-300">Active Path</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-rose-500 border-dashed inline-block" />
          <span className="text-rose-400">Failed / Cut</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-emerald-500 inline-block" />
          <span className="text-emerald-300">MST Backbone</span>
        </div>
      </div>
    </div>
  );
}
