/**
 * Dijkstra's Shortest Path Algorithm
 * Optimized with a binary MinHeap priority queue.
 * O((V + E) log V)
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
      const parentIdx = Math.floor((index - 1) / 2);
      if (this.heap[index].priority >= this.heap[parentIdx].priority) break;
      [this.heap[index], this.heap[parentIdx]] = [this.heap[parentIdx], this.heap[index]];
      index = parentIdx;
    }
  }

  _sinkDown(index) {
    const length = this.heap.length;
    while (true) {
      let left = 2 * index + 1;
      let right = 2 * index + 2;
      let smallest = index;

      if (left < length && this.heap[left].priority < this.heap[smallest].priority) {
        smallest = left;
      }
      if (right < length && this.heap[right].priority < this.heap[smallest].priority) {
        smallest = right;
      }
      if (smallest === index) break;
      [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
      index = smallest;
    }
  }
}

/**
 * Executes Dijkstra's algorithm.
 * @param {Array<string>} nodes - Array of node IDs
 * @param {Array<{source: string, target: string, weight: number, id?: string}>} edges - Active edges
 * @param {string} sourceId - Starting node
 * @param {string|null} targetId - Optional destination node
 * @returns {Object} { distances, predecessors, path, pathEdges, executionTimeMs, totalDistance }
 */
export function runDijkstra(nodes, edges, sourceId, targetId = null) {
  const startTime = performance.now();

  const adj = {};
  for (const n of nodes) {
    adj[n] = [];
  }

  for (const edge of edges) {
    if (!adj[edge.source]) adj[edge.source] = [];
    if (!adj[edge.target]) adj[edge.target] = [];
    adj[edge.source].push({ neighbor: edge.target, weight: edge.weight, edgeId: edge.id });
    adj[edge.target].push({ neighbor: edge.source, weight: edge.weight, edgeId: edge.id });
  }

  const distances = {};
  const predecessors = {};
  const predecessorEdges = {};

  for (const n of nodes) {
    distances[n] = Infinity;
    predecessors[n] = null;
    predecessorEdges[n] = null;
  }

  if (distances[sourceId] === undefined) {
    const endTime = performance.now();
    return {
      distances,
      predecessors,
      path: [],
      pathEdges: [],
      executionTimeMs: (endTime - startTime).toFixed(4),
      totalDistance: Infinity,
    };
  }

  distances[sourceId] = 0;
  const pq = new MinHeap();
  pq.push({ id: sourceId, priority: 0 });

  while (!pq.isEmpty()) {
    const { id: u, priority: d } = pq.pop();

    if (d > distances[u]) continue;
    if (targetId && u === targetId) break;

    const neighbors = adj[u] || [];
    for (const { neighbor: v, weight, edgeId } of neighbors) {
      const alt = distances[u] + weight;
      if (alt < distances[v]) {
        distances[v] = alt;
        predecessors[v] = u;
        predecessorEdges[v] = edgeId;
        pq.push({ id: v, priority: alt });
      }
    }
  }

  const endTime = performance.now();

  // Reconstruct path if targetId specified
  const path = [];
  const pathEdges = [];
  let totalDistance = Infinity;

  if (targetId && distances[targetId] !== Infinity) {
    totalDistance = distances[targetId];
    let curr = targetId;
    while (curr) {
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
    executionTimeMs: Number((endTime - startTime).toFixed(4)),
    totalDistance,
  };
}
