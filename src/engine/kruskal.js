/**
 * Kruskal's Minimum Spanning Tree (MST) Algorithm
 * Disjoint Set Union (DSU) with path compression and union by rank.
 * Time Complexity: O(E log E) = O(E log V)
 */

class DSU {
  constructor(elements) {
    this.parent = {};
    this.rank = {};
    for (const el of elements) {
      this.parent[el] = el;
      this.rank[el] = 0;
    }
  }

  find(i) {
    if (this.parent[i] === i) return i;
    this.parent[i] = this.find(this.parent[i]);
    return this.parent[i];
  }

  union(i, j) {
    const rootI = this.find(i);
    const rootJ = this.find(j);
    if (rootI === rootJ) return false;

    if (this.rank[rootI] < this.rank[rootJ]) {
      this.parent[rootI] = rootJ;
    } else if (this.rank[rootI] > this.rank[rootJ]) {
      this.parent[rootJ] = rootI;
    } else {
      this.parent[rootJ] = rootI;
      this.rank[rootI]++;
    }
    return true;
  }
}

/**
 * Runs Kruskal's MST algorithm.
 * @param {Array<string>} nodes - Array of node IDs
 * @param {Array<{id: string, source: string, target: string, weight: number, cost?: number}>} edges
 * @param {'weight'|'cost'} metricKey - Metric to optimize ('cost' for cable cost, 'weight' for latency)
 * @returns {Object} { mstEdges, mstEdgeIds, totalCost, componentsCount, executionTimeMs }
 */
export function runKruskal(nodes, edges, metricKey = "cost") {
  const startTime = performance.now();

  const dsu = new DSU(nodes);
  // Sort edges ascending by specified metric
  const sortedEdges = [...edges].sort((a, b) => {
    const valA = metricKey === "cost" ? (a.cost ?? a.weight) : a.weight;
    const valB = metricKey === "cost" ? (b.cost ?? b.weight) : b.weight;
    return valA - valB;
  });

  const mstEdges = [];
  const mstEdgeIds = new Set();
  let totalCost = 0;

  for (const edge of sortedEdges) {
    if (dsu.union(edge.source, edge.target)) {
      mstEdges.push(edge);
      mstEdgeIds.add(edge.id);
      totalCost += metricKey === "cost" ? (edge.cost ?? edge.weight) : edge.weight;
      if (mstEdges.length === nodes.length - 1) break;
    }
  }

  // Count connected components
  const components = new Set();
  for (const n of nodes) {
    components.add(dsu.find(n));
  }

  const endTime = performance.now();

  return {
    mstEdges,
    mstEdgeIds: Array.from(mstEdgeIds),
    totalCost: Number(totalCost.toFixed(2)),
    componentsCount: components.size,
    isFullyConnected: components.size <= 1,
    executionTimeMs: Number((endTime - startTime).toFixed(4)),
  };
}
