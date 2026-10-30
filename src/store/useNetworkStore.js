import { create } from "zustand";
import { TOPOLOGY_PRESETS } from "../data/topologies.js";
import {
  runDijkstra,
  runBellmanFord,
  runFloydWarshall,
  runJohnson,
  runKruskal,
  runPrim,
} from "../engine/index.js";
import { applyNodeChanges, applyEdgeChanges } from "@xyflow/react";

const DEFAULT_PRESET = "nsfnet";

function initFromPreset(presetKey) {
  const preset = TOPOLOGY_PRESETS[presetKey] || TOPOLOGY_PRESETS.nsfnet;

  const nodes = preset.nodes.map((n) => ({
    id: n.id,
    type: "routerNode",
    position: { x: n.x, y: n.y },
    data: {
      id: n.id,
      label: n.label,
      name: n.name,
      ip: n.ip,
      region: n.region,
      status: n.status || "active",
      load: Math.floor(Math.random() * 35) + 15, // 15% - 50% CPU load
      lossRate: (Math.random() * 0.02).toFixed(3),
    },
  }));

  const edges = preset.edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    type: "carrierEdge",
    data: {
      id: e.id,
      weight: e.weight, // Latency in ms
      bandwidth: e.bandwidth, // Gbps
      loss: e.loss, // Packet Loss %
      cost: e.cost, // Infrastructure cable cost $k
      isFailed: false,
      isActivePath: false,
      isMst: false,
    },
  }));

  return { nodes, edges, preset };
}

export const useNetworkStore = create((set, get) => {
  const initial = initFromPreset(DEFAULT_PRESET);
  const initialNodes = initial.nodes;
  const initialEdges = initial.edges;
  const src = initialNodes[0]?.id || "SEA";
  const dst = initialNodes[initialNodes.length - 1]?.id || "MD";

  return {
    presetKey: DEFAULT_PRESET,
    nodes: initialNodes,
    edges: initialEdges,
    algorithm: "dijkstra", // 'dijkstra' | 'bellman-ford' | 'floyd-warshall' | 'johnson' | 'kruskal' | 'prim'
    sourceNode: src,
    targetNode: dst,
    selectedElement: null, // { type: 'node' | 'edge', data: ... }
    showFailureSimulationModal: false,

    // Execution & Telemetry Results
    simulationResults: {
      path: [],
      pathEdges: [],
      mstEdges: [],
      executionTimeMs: 0,
      totalDistance: 0,
      hasNegativeCycle: false,
      matrix: null,
      totalTopologyCost: 0,
      avgLatency: 0,
      redundancyScore: 0,
      activeLinkCount: initialEdges.length,
      failedLinkCount: 0,
    },

    loadPreset: (key) => {
      const data = initFromPreset(key);
      const newSrc = data.nodes[0]?.id || "";
      const newDst = data.nodes[data.nodes.length - 1]?.id || "";

      set({
        presetKey: key,
        nodes: data.nodes,
        edges: data.edges,
        sourceNode: newSrc,
        targetNode: newDst,
        selectedElement: null,
      });

      get().recalculate();
    },

    setAlgorithm: (algorithm) => {
      set({ algorithm });
      get().recalculate();
    },

    setSourceNode: (sourceNode) => {
      set({ sourceNode });
      get().recalculate();
    },

    setTargetNode: (targetNode) => {
      set({ targetNode });
      get().recalculate();
    },

    selectElement: (type, data) => {
      set({ selectedElement: data ? { type, data } : null });
    },

    toggleEdgeFailure: (edgeId) => {
      const { edges } = get();
      const updatedEdges = edges.map((e) => {
        if (e.id === edgeId) {
          const isFailed = !e.data.isFailed;
          return {
            ...e,
            data: {
              ...e.data,
              isFailed,
            },
          };
        }
        return e;
      });

      set({ edges: updatedEdges });
      get().recalculate();
    },

    resetAllFailures: () => {
      const { edges } = get();
      const updatedEdges = edges.map((e) => ({
        ...e,
        data: {
          ...e.data,
          isFailed: false,
        },
      }));
      set({ edges: updatedEdges });
      get().recalculate();
    },

    onNodesChange: (changes) => {
      set({
        nodes: applyNodeChanges(changes, get().nodes),
      });
    },

    onEdgesChange: (changes) => {
      set({
        edges: applyEdgeChanges(changes, get().edges),
      });
    },

    updateNodePosition: (id, position) => {
      set((state) => ({
        nodes: state.nodes.map((node) =>
          node.id === id ? { ...node, position } : node
        ),
      }));
    },

    recalculate: () => {
      const { nodes, edges, algorithm, sourceNode, targetNode } = get();
      const nodeIds = nodes.map((n) => n.id);

      // Operational edges (not failed)
      const activeEdges = edges.filter((e) => !e.data.isFailed);
      const activeEdgesSimple = activeEdges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        weight: e.data.weight,
        cost: e.data.cost,
      }));

      // High-level telemetry metrics
      const totalCost = activeEdges.reduce((acc, e) => acc + (e.data.cost || 0), 0);
      const avgLatency =
        activeEdges.length > 0
          ? Number(
              (
                activeEdges.reduce((acc, e) => acc + e.data.weight, 0) /
                activeEdges.length
              ).toFixed(2)
            )
          : 0;

      // Redundancy score: E / (V - 1) * 100
      const minEdgesForTree = Math.max(1, nodeIds.length - 1);
      const redundancyRatio = activeEdges.length / minEdgesForTree;
      const redundancyScore = Math.min(100, Math.round(redundancyRatio * 50));

      let simPath = [];
      let simPathEdges = [];
      let mstEdgeIds = [];
      let executionTimeMs = 0;
      let totalDistance = 0;
      let hasNegativeCycle = false;
      let matrix = null;

      // Execute appropriate algorithm
      if (algorithm === "dijkstra") {
        const res = runDijkstra(nodeIds, activeEdgesSimple, sourceNode, targetNode);
        simPath = res.path;
        simPathEdges = res.pathEdges;
        executionTimeMs = res.executionTimeMs;
        totalDistance = res.totalDistance;
      } else if (algorithm === "bellman-ford") {
        const res = runBellmanFord(nodeIds, activeEdgesSimple, sourceNode, targetNode);
        simPath = res.path;
        simPathEdges = res.pathEdges;
        executionTimeMs = res.executionTimeMs;
        totalDistance = res.totalDistance;
        hasNegativeCycle = res.hasNegativeCycle;
      } else if (algorithm === "floyd-warshall") {
        const res = runFloydWarshall(nodeIds, activeEdgesSimple);
        matrix = res.matrix;
        simPath = res.getPath(sourceNode, targetNode);
        executionTimeMs = res.executionTimeMs;
        hasNegativeCycle = res.hasNegativeCycle;
        totalDistance = matrix[sourceNode]?.[targetNode] ?? Infinity;

        // Find path edges
        for (let i = 0; i < simPath.length - 1; i++) {
          const u = simPath[i];
          const v = simPath[i + 1];
          const edge = activeEdges.find(
            (e) => (e.source === u && e.target === v) || (e.source === v && e.target === u)
          );
          if (edge) simPathEdges.push(edge.id);
        }
      } else if (algorithm === "johnson") {
        const res = runJohnson(nodeIds, activeEdgesSimple);
        matrix = res.matrix;
        executionTimeMs = res.executionTimeMs;
        hasNegativeCycle = res.hasNegativeCycle;
        totalDistance = matrix[sourceNode]?.[targetNode] ?? Infinity;

        // Path via Dijkstra fallback
        const dRes = runDijkstra(nodeIds, activeEdgesSimple, sourceNode, targetNode);
        simPath = dRes.path;
        simPathEdges = dRes.pathEdges;
      } else if (algorithm === "kruskal") {
        const res = runKruskal(nodeIds, activeEdgesSimple, "cost");
        mstEdgeIds = res.mstEdgeIds;
        executionTimeMs = res.executionTimeMs;
        totalDistance = res.totalCost;
      } else if (algorithm === "prim") {
        const res = runPrim(nodeIds, activeEdgesSimple, sourceNode, "cost");
        mstEdgeIds = res.mstEdgeIds;
        executionTimeMs = res.executionTimeMs;
        totalDistance = res.totalCost;
      }

      // Update edges with visual active path or MST indicators
      const pathEdgeSet = new Set(simPathEdges);
      const mstEdgeSet = new Set(mstEdgeIds);

      const refreshedEdges = edges.map((e) => ({
        ...e,
        data: {
          ...e.data,
          isActivePath: pathEdgeSet.has(e.id),
          isMst: mstEdgeSet.has(e.id),
        },
      }));

      // Update node dynamic status (e.g. load indicator, ingress/egress markers)
      const pathNodeSet = new Set(simPath);
      const refreshedNodes = nodes.map((node) => {
        let load = node.data.load;
        let status = "active";

        if (pathNodeSet.has(node.id)) {
          load = Math.min(95, load + 25);
          status = load > 75 ? "high-load" : "active";
        }

        return {
          ...node,
          data: {
            ...node.data,
            isSource: node.id === sourceNode,
            isTarget: node.id === targetNode,
            isInPath: pathNodeSet.has(node.id),
            load,
            status,
          },
        };
      });

      set({
        nodes: refreshedNodes,
        edges: refreshedEdges,
        simulationResults: {
          path: simPath,
          pathEdges: simPathEdges,
          mstEdges: mstEdgeIds,
          executionTimeMs,
          totalDistance: totalDistance === Infinity ? "Unreachable" : totalDistance,
          hasNegativeCycle,
          matrix,
          totalTopologyCost: totalCost,
          avgLatency,
          redundancyScore,
          activeLinkCount: activeEdges.length,
          failedLinkCount: edges.length - activeEdges.length,
        },
      });
    },
  };
});
