/**
 * Floyd-Warshall All-Pairs Shortest Path (APSP) Algorithm
 * Dynamic Programming: O(V^3)
 * Yields complete SDN global routing matrix.
 */

/**
 * Executes Floyd-Warshall algorithm.
 * @param {Array<string>} nodes - Array of node IDs
 * @param {Array<{source: string, target: string, weight: number}>} edges - Edge list
 * @param {boolean} isDirected - Graph direction flag
 * @returns {Object} { matrix, nextHop, hasNegativeCycle, executionTimeMs, getPath(u, v) }
 */
export function runFloydWarshall(nodes, edges, isDirected = false) {
  const startTime = performance.now();

  const matrix = {};
  const nextHop = {};

  // Initialize matrices
  for (const u of nodes) {
    matrix[u] = {};
    nextHop[u] = {};
    for (const v of nodes) {
      if (u === v) {
        matrix[u][v] = 0;
        nextHop[u][v] = v;
      } else {
        matrix[u][v] = Infinity;
        nextHop[u][v] = null;
      }
    }
  }

  // Populate edge weights
  for (const { source, target, weight } of edges) {
    if (matrix[source] && matrix[source][target] !== undefined) {
      if (weight < matrix[source][target]) {
        matrix[source][target] = weight;
        nextHop[source][target] = target;
      }
    }
    if (!isDirected && matrix[target] && matrix[target][source] !== undefined) {
      if (weight < matrix[target][source]) {
        matrix[target][source] = weight;
        nextHop[target][source] = source;
      }
    }
  }

  // Triple nested loop
  const n = nodes.length;
  for (let kIdx = 0; kIdx < n; kIdx++) {
    const k = nodes[kIdx];
    for (let iIdx = 0; iIdx < n; iIdx++) {
      const i = nodes[iIdx];
      if (matrix[i][k] === Infinity) continue;

      for (let jIdx = 0; jIdx < n; jIdx++) {
        const j = nodes[jIdx];
        if (matrix[k][j] === Infinity) continue;

        const combined = matrix[i][k] + matrix[k][j];
        if (combined < matrix[i][j]) {
          matrix[i][j] = combined;
          nextHop[i][j] = nextHop[i][k];
        }
      }
    }
  }

  // Check diagonal for negative cycle
  let hasNegativeCycle = false;
  for (const u of nodes) {
    if (matrix[u][u] < 0) {
      hasNegativeCycle = true;
      break;
    }
  }

  const endTime = performance.now();

  /**
   * Helper function to reconstruct path between any pair
   */
  const getPath = (u, v) => {
    if (matrix[u]?.[v] === Infinity || !nextHop[u]?.[v]) return [];
    const path = [u];
    let curr = u;
    const visited = new Set();
    while (curr !== v) {
      if (visited.has(curr)) return []; // Loop detection
      visited.add(curr);
      curr = nextHop[curr][v];
      if (!curr) return [];
      path.push(curr);
    }
    return path;
  };

  return {
    matrix,
    nextHop,
    hasNegativeCycle,
    executionTimeMs: Number((endTime - startTime).toFixed(4)),
    getPath,
  };
}
