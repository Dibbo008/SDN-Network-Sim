/**
 * Johnson's Algorithm for All-Pairs Shortest Paths
 * Combines Bellman-Ford potential reweighting with Dijkstra from every vertex.
 * Time Complexity: O(V^2 log V + V * E), faster than Floyd-Warshall on sparse networks.
 */

import { runDijkstra } from "./dijkstra.js";
import { runBellmanFord } from "./bellmanFord.js";

/**
 * Executes Johnson's algorithm.
 * @param {Array<string>} nodes - Array of node IDs
 * @param {Array<{source: string, target: string, weight: number}>} edges - Edge list
 * @param {boolean} isDirected - Graph direction flag
 * @returns {Object} { matrix, hasNegativeCycle, executionTimeMs }
 */
export function runJohnson(nodes, edges, isDirected = false) {
  const startTime = performance.now();

  const matrix = {};
  for (const u of nodes) {
    matrix[u] = {};
    for (const v of nodes) {
      matrix[u][v] = u === v ? 0 : Infinity;
    }
  }

  if (nodes.length === 0) {
    return {
      matrix,
      hasNegativeCycle: false,
      executionTimeMs: 0,
    };
  }

  // Step 1: Add a new node 'q' connected to all existing nodes with 0 weight
  const qNode = "__q_super_source__";
  const augmentedNodes = [...nodes, qNode];
  const augmentedEdges = [];

  for (const e of edges) {
    augmentedEdges.push({ source: e.source, target: e.target, weight: e.weight });
    if (!isDirected) {
      augmentedEdges.push({ source: e.target, target: e.source, weight: e.weight });
    }
  }

  for (const n of nodes) {
    augmentedEdges.push({ source: qNode, target: n, weight: 0 });
  }

  // Step 2: Run Bellman-Ford from 'q' to find potential function h(u)
  const bfResult = runBellmanFord(augmentedNodes, augmentedEdges, qNode, null, true);

  if (bfResult.hasNegativeCycle) {
    const endTime = performance.now();
    return {
      matrix,
      hasNegativeCycle: true,
      executionTimeMs: Number((endTime - startTime).toFixed(4)),
    };
  }

  const h = bfResult.distances;

  // Step 3: Reweight edges using h: w'(u, v) = w(u, v) + h(u) - h(v) >= 0
  const reweightedEdges = [];
  for (const e of edges) {
    const wHatUV = e.weight + h[e.source] - h[e.target];
    reweightedEdges.push({
      source: e.source,
      target: e.target,
      weight: Math.max(0, wHatUV),
      id: e.id,
    });

    if (!isDirected) {
      const wHatVU = e.weight + h[e.target] - h[e.source];
      reweightedEdges.push({
        source: e.target,
        target: e.source,
        weight: Math.max(0, wHatVU),
        id: e.id,
      });
    }
  }

  // Step 4: Run Dijkstra from every vertex in the reweighted graph
  for (const u of nodes) {
    const dijkstraResult = runDijkstra(nodes, reweightedEdges, u, null);
    for (const v of nodes) {
      const dHat = dijkstraResult.distances[v];
      if (dHat !== Infinity) {
        // Step 5: d(u, v) = d'(u, v) - h(u) + h(v)
        matrix[u][v] = Number((dHat - h[u] + h[v]).toFixed(4));
      } else {
        matrix[u][v] = Infinity;
      }
    }
  }

  const endTime = performance.now();

  return {
    matrix,
    hasNegativeCycle: false,
    executionTimeMs: Number((endTime - startTime).toFixed(4)),
  };
}
