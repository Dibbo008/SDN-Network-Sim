/**
 * Bellman-Ford Shortest Path Algorithm
 * Supports negative edge weights and detects negative weight cycles.
 * Time Complexity: O(V * E)
 */

/**
 * Executes Bellman-Ford algorithm.
 * @param {Array<string>} nodes - Array of node IDs
 * @param {Array<{source: string, target: string, weight: number, id?: string}>} edges - Undirected or directed edge list
 * @param {string} sourceId - Starting node
 * @param {string|null} targetId - Optional target node
 * @param {boolean} isDirected - Whether graph is directed (default false for SDN mesh)
 * @returns {Object} { distances, predecessors, path, pathEdges, hasNegativeCycle, executionTimeMs, totalDistance }
 */
export function runBellmanFord(nodes, edges, sourceId, targetId = null, isDirected = false) {
  const startTime = performance.now();

  const distances = {};
  const predecessors = {};
  const predecessorEdges = {};

  for (const n of nodes) {
    distances[n] = Infinity;
    predecessors[n] = null;
    predecessorEdges[n] = null;
  }

  if (distances[sourceId] !== undefined) {
    distances[sourceId] = 0;
  }

  // Flatten edges for undirected graph representation
  const edgeList = [];
  for (const e of edges) {
    edgeList.push({ u: e.source, v: e.target, weight: e.weight, id: e.id });
    if (!isDirected) {
      edgeList.push({ u: e.target, v: e.source, weight: e.weight, id: e.id });
    }
  }

  const vCount = nodes.length;

  // Relax edges |V| - 1 times
  for (let i = 1; i <= vCount - 1; i++) {
    let updated = false;
    for (const { u, v, weight, id } of edgeList) {
      if (distances[u] !== Infinity && distances[u] + weight < distances[v]) {
        distances[v] = distances[u] + weight;
        predecessors[v] = u;
        predecessorEdges[v] = id;
        updated = true;
      }
    }
    // Early termination optimization if no relaxations occurred in this pass
    if (!updated) break;
  }

  // Check for negative weight cycles
  let hasNegativeCycle = false;
  for (const { u, v, weight } of edgeList) {
    if (distances[u] !== Infinity && distances[u] + weight < distances[v]) {
      hasNegativeCycle = true;
      break;
    }
  }

  const endTime = performance.now();

  // Path reconstruction
  const path = [];
  const pathEdges = [];
  let totalDistance = Infinity;

  if (!hasNegativeCycle && targetId && distances[targetId] !== Infinity) {
    totalDistance = distances[targetId];
    let curr = targetId;
    let visited = new Set();
    while (curr && !visited.has(curr)) {
      visited.add(curr);
      path.unshift(curr);
      if (predecessorEdges[curr]) {
        pathEdges.unshift(predecessorEdges[curr]);
      }
      curr = predecessors[curr];
    }
  }

  return {
    distances,
    predecessors,
    path,
    pathEdges,
    hasNegativeCycle,
    executionTimeMs: Number((endTime - startTime).toFixed(4)),
    totalDistance,
  };
}
