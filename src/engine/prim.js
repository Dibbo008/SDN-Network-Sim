/**
 * Prim's Minimum Spanning Tree (MST) Algorithm
 * Greedy node-based cut property using priority queue.
 * Time Complexity: O(E log V)
 */

class MinHeap {
  constructor() {
    this.heap = [];
  }

  push(item) {
    this.heap.push(item);
    this._bubbleUp(this.heap.length - 1);
  }

  pop() {
    if (this.heap.length === 0) return null;
    const top = this.heap[0];
    const bottom = this.heap.pop();
    if (this.heap.length > 0) {
      this.heap[0] = bottom;
      this._sinkDown(0);
    }
    return top;
  }

  isEmpty() {
    return this.heap.length === 0;
  }

  _bubbleUp(index) {
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (this.heap[index].key >= this.heap[parent].key) break;
      [this.heap[index], this.heap[parent]] = [this.heap[parent], this.heap[index]];
      index = parent;
    }
  }

  _sinkDown(index) {
    const len = this.heap.length;
    while (true) {
      let left = 2 * index + 1;
      let right = 2 * index + 2;
      let smallest = index;

      if (left < len && this.heap[left].key < this.heap[smallest].key) {
        smallest = left;
      }
      if (right < len && this.heap[right].key < this.heap[smallest].key) {
        smallest = right;
      }
      if (smallest === index) break;
      [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
      index = smallest;
    }
  }
}

/**
 * Runs Prim's MST algorithm.
 * @param {Array<string>} nodes - Node IDs
 * @param {Array<{id: string, source: string, target: string, weight: number, cost?: number}>} edges
 * @param {string|null} startNodeId - Optional start node
 * @param {'weight'|'cost'} metricKey - 'cost' or 'weight'
 * @returns {Object} { mstEdges, mstEdgeIds, totalCost, executionTimeMs }
 */
export function runPrim(nodes, edges, startNodeId = null, metricKey = "cost") {
  const startTime = performance.now();

  if (nodes.length === 0) {
    return {
      mstEdges: [],
      mstEdgeIds: [],
      totalCost: 0,
      executionTimeMs: 0,
    };
  }

  const adj = {};
  for (const n of nodes) {
    adj[n] = [];
  }

  for (const edge of edges) {
    const val = metricKey === "cost" ? (edge.cost ?? edge.weight) : edge.weight;
    if (!adj[edge.source]) adj[edge.source] = [];
    if (!adj[edge.target]) adj[edge.target] = [];
    adj[edge.source].push({ neighbor: edge.target, edge, value: val });
    adj[edge.target].push({ neighbor: edge.source, edge, value: val });
  }

  const root = startNodeId && nodes.includes(startNodeId) ? startNodeId : nodes[0];
  const visited = new Set([root]);
  const pq = new MinHeap();

  for (const item of adj[root] || []) {
    pq.push({ key: item.value, u: root, v: item.neighbor, edge: item.edge });
  }

  const mstEdges = [];
  const mstEdgeIds = new Set();
  let totalCost = 0;

  while (!pq.isEmpty() && visited.size < nodes.length) {
    const { key, u, v, edge } = pq.pop();

    if (visited.has(v)) continue;

    visited.add(v);
    mstEdges.push(edge);
    mstEdgeIds.add(edge.id);
    totalCost += key;

    for (const item of adj[v] || []) {
      if (!visited.has(item.neighbor)) {
        pq.push({ key: item.value, u: v, v: item.neighbor, edge: item.edge });
      }
    }
  }

  const endTime = performance.now();

  return {
    mstEdges,
    mstEdgeIds: Array.from(mstEdgeIds),
    totalCost: Number(totalCost.toFixed(2)),
    executionTimeMs: Number((endTime - startTime).toFixed(4)),
  };
}
