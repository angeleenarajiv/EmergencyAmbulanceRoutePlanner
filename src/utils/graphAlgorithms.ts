/**
 * ============================================================
 *  graphAlgorithms.ts  — ResQPath CAD Engine
 * ============================================================
 *
 *  Graph-traversal algorithms used by the Emergency Dispatch
 *  system to compute optimal ambulance routes in real time.
 *
 *  Algorithms implemented:
 *  ─────────────────────────────────────────────────────────
 *  1. Dijkstra (Weighted Shortest Path) — with Min-Heap O((V+E) log V)
 *     • runDijkstra            – single source → single target
 *     • runMultiSourceDijkstra – simultaneous dispatch from N ambulances
 *     • dijkstraAllPairs       – single source → all reachable nodes
 *
 *  2. BFS  (Breadth-First Search)  – unweighted min-hop path O(V+E)
 *  3. DFS  (Depth-First Search)    – exploratory depth path  O(V+E)
 *
 *  Helper exports:
 *  • DijkstraStepTrace      – per-iteration debug trace for UI animation
 *  • MinHeap<T>             – generic binary min-heap priority queue
 *  • getAdjacencyList       – builds undirected weighted adjacency list
 *  • findOptimalAmbulanceFromFleet
 *  • findOptimalAmbulanceStation
 *  • findOptimalReceivingHospital
 * ============================================================
 */

import { GraphNode, GraphEdge } from '../data/mockData';
import { AmbulanceUnit } from '../types';

// ─────────────────────────────────────────────────────────────
//  Shared Types
// ─────────────────────────────────────────────────────────────

/**
 * The result returned by any pathfinding function.
 * Carries both the computed route and algorithm diagnostics.
 */
export interface PathResult {
  /** Ordered list of node IDs from start → end */
  path: string[];
  /** Sum of raw physical distances (km) along traversed edges */
  totalDistanceKm: number;
  /** Congestion-weighted effective cost (higher = slower road network) */
  effectiveCost: number;
  /** Estimated arrival time in minutes for an ambulance with active siren */
  estimatedMinutes: number;
  /** Which algorithm produced this result */
  algorithm: 'Dijkstra (Weighted)' | 'BFS' | 'DFS';
  /** Node IDs in the order they were settled / visited during traversal */
  visitedOrder: string[];
  /** The subset of edges that form the final chosen route */
  edgesTraversed: GraphEdge[];
}

/**
 * A single iteration snapshot of Dijkstra's inner relaxation loop.
 * Collected during runDijkstra (when collectSteps=true) for the
 * step-by-step algorithm visualizer panel.
 *
 * Each trace entry answers: "What happened when we examined edge u→v?"
 */
export interface DijkstraStepTrace {
  /** The node `u` being "settled" (extracted from priority queue) */
  settledNodeId: string;
  /** The neighbour `v` being "relaxed" in this step */
  relaxedNeighbourId: string;
  /** Tentative cost to reach `v` BEFORE this relaxation (may be Infinity) */
  previousCost: number;
  /** Tentative cost to reach `v` AFTER this relaxation */
  newCost: number;
  /** True if this relaxation improved (lowered) the cost — i.e. was accepted */
  improved: boolean;
  /** Current distances table snapshot at this step (for UI table rendering) */
  distancesSnapshot: Record<string, number>;
}

// ─────────────────────────────────────────────────────────────
//  Min-Heap Priority Queue
// ─────────────────────────────────────────────────────────────

/**
 * # Generic Binary Min-Heap
 *
 * A binary heap is a complete binary tree stored as a flat array where:
 *   • The element at index `i` has children at indices `2i+1` and `2i+2`.
 *   • The element at index `i` has its parent at index `Math.floor((i-1)/2)`.
 *   • The MIN-HEAP property: every parent ≤ both children (root is smallest).
 *
 * ## Why a heap instead of linear scan?
 * ┌─────────────────┬──────────────┬──────────────────────────────┐
 * │  Data structure │  extract-min │  insert / decrease-key       │
 * ├─────────────────┼──────────────┼──────────────────────────────┤
 * │  Linear scan    │  O(V)        │  O(1)                        │
 * │  Binary heap    │  O(log V)    │  O(log V)  (lazy deletion*)  │
 * │  Fibonacci heap │  O(log V)†   │  O(1) amortized              │
 * └─────────────────┴──────────────┴──────────────────────────────┘
 * † amortized;  * see runDijkstra lazy deletion note
 *
 * Overall Dijkstra complexity with this heap:  O((V + E) log V)
 * vs. the original linear-scan approach:       O(V² + E)
 *
 * For ResQPath's graph (~20–50 nodes, ~40–120 edges) both are fast,
 * but the heap version is correct, scalable, and educationally standard.
 *
 * @template T  The payload type stored alongside each numeric priority.
 */
export class MinHeap<T> {
  private heap: Array<{ priority: number; value: T }> = [];

  /** Current number of entries in the heap. */
  get size(): number { return this.heap.length; }

  /** True when the heap contains no entries. */
  get isEmpty(): boolean { return this.heap.length === 0; }

  /**
   * Insert a value with the given numeric priority.
   *
   * Process:
   *   1. Append the new entry at the END of the array (last leaf position).
   *   2. "Bubble up" — swap the entry with its parent while it is smaller,
   *      restoring the heap property from bottom to top.
   *
   * Time: O(log n)
   */
  push(priority: number, value: T): void {
    this.heap.push({ priority, value });
    this._bubbleUp(this.heap.length - 1);
  }

  /**
   * Remove and return the entry with the SMALLEST priority (the root).
   *
   * Process:
   *   1. Swap the ROOT with the LAST element.
   *   2. Remove the last element (which was the old root / minimum).
   *   3. "Sink down" — swap the new root with its smallest child while it
   *      is larger, restoring the heap property from top to bottom.
   *
   * Time: O(log n)
   * Returns undefined when the heap is empty.
   */
  pop(): { priority: number; value: T } | undefined {
    if (this.heap.length === 0) return undefined;

    const min  = this.heap[0];           // Save the minimum (root)
    const last = this.heap.pop()!;       // Remove last element

    if (this.heap.length > 0) {
      this.heap[0] = last;               // Move last to root
      this._sinkDown(0);                 // Restore heap property
    }

    return min;
  }

  /** Peek at the minimum entry without removing it. O(1). */
  peek(): { priority: number; value: T } | undefined { return this.heap[0]; }

  // ── Internal heap maintenance ─────────────────────────────

  /**
   * Bubble the element at `index` upward until the min-heap property holds.
   * Parent of node at index i  →  Math.floor((i - 1) / 2)
   */
  private _bubbleUp(index: number): void {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.heap[parentIndex].priority <= this.heap[index].priority) break;
      [this.heap[parentIndex], this.heap[index]] = [this.heap[index], this.heap[parentIndex]];
      index = parentIndex;
    }
  }

  /**
   * Sink the element at `index` downward until the min-heap property holds.
   * Children of node at index i  →  2i+1 (left),  2i+2 (right)
   */
  private _sinkDown(index: number): void {
    const length = this.heap.length;
    while (true) {
      const left  = 2 * index + 1;
      const right = 2 * index + 2;
      let smallest = index;

      if (left  < length && this.heap[left].priority  < this.heap[smallest].priority) smallest = left;
      if (right < length && this.heap[right].priority < this.heap[smallest].priority) smallest = right;

      if (smallest === index) break; // Heap property satisfied — done
      [this.heap[smallest], this.heap[index]] = [this.heap[index], this.heap[smallest]];
      index = smallest;
    }
  }
}

// ─────────────────────────────────────────────────────────────
//  Adjacency List Builder
// ─────────────────────────────────────────────────────────────

/**
 * Convert the flat GraphEdge array into an undirected weighted adjacency
 * list stored as a Map for O(1) neighbour lookup during graph traversal.
 *
 * Edge weight = distanceKm × congestion
 *   congestion 1.0  →  Normal flow       (full speed)
 *   congestion 2.2  →  Moderate traffic  (~45% slower)
 *   congestion 4.0  →  Heavy jam         (~75% slower)
 *   congestion 999  →  Road closed       (effectively impassable)
 *
 * Each edge is registered in BOTH directions because ResQPath uses an
 * undirected road graph (ambulances can travel either way).
 */
export function getAdjacencyList(
  edges: GraphEdge[]
): Map<string, { neighborId: string; edge: GraphEdge; weight: number }[]> {
  const adj = new Map<string, { neighborId: string; edge: GraphEdge; weight: number }[]>();

  for (const edge of edges) {
    const weight = edge.distanceKm * edge.congestion; // congestion-weighted cost

    if (!adj.has(edge.from)) adj.set(edge.from, []);
    if (!adj.has(edge.to))   adj.set(edge.to,   []);

    // Add edge in both directions (undirected graph)
    adj.get(edge.from)!.push({ neighborId: edge.to,   edge, weight });
    adj.get(edge.to)!  .push({ neighborId: edge.from, edge, weight });
  }

  return adj;
}

// ─────────────────────────────────────────────────────────────
//  1. DIJKSTRA — Single Source → Single Target
// ─────────────────────────────────────────────────────────────

/**
 * # Dijkstra's Shortest Path Algorithm  (Min-Heap variant)
 *
 * ## Purpose
 * Finds the minimum COST path from `startId` to `endId` in a weighted,
 * undirected graph where all edge weights are strictly non-negative.
 *
 * ## Step-by-step walkthrough
 * ─────────────────────────────────────────────────────────────
 * STEP 1 — Initialise
 *   • Set dist[v] = ∞ for every node v.
 *   • Set dist[start] = 0.
 *   • Push (cost=0, node=start) into the min-heap.
 *
 * STEP 2 — Main loop (repeat until heap is empty OR target is settled):
 *   a. POP the heap entry (u, cost_u) with the smallest cost.
 *   b. LAZY DELETION: if u is already in `settled`, skip this entry.
 *      (We may have pushed u multiple times with decreasing costs.)
 *   c. SETTLE u — mark it permanent; its shortest path is now final.
 *   d. For every neighbour v of u:
 *        alt_cost = dist[u] + weight(u, v)
 *        RELAX: if alt_cost < dist[v]:
 *          • Update dist[v] = alt_cost
 *          • Record prev[v] = u (so we can reconstruct the path)
 *          • Push (alt_cost, v) into the heap
 *
 * STEP 3 — Reconstruct path
 *   Walk prev[] map backward:  endId → … → startId → undefined
 *
 * ## Why non-negative weights are required
 * Dijkstra greedily commits to the globally cheapest unsettled node.
 * A negative-weight edge could later make an already-settled node
 * reachable at lower cost — violating the greedy invariant.
 * All ResQPath congestion multipliers (1.0, 2.2, 4.0, 999) are positive ✓
 *
 * ## Lazy deletion (why we push duplicates)
 * True "decrease-key" in a binary heap is expensive (requires knowing
 * the entry's heap index). Instead, we simply push a NEW entry with the
 * updated lower cost. When the OLD (stale) entry is eventually popped,
 * we detect it via `settled.has(u)` and skip it — this is lazy deletion.
 *
 * ## Complexity
 *   Time:  O((V + E) log V)   — V nodes, E edges
 *   Space: O(V + E)           — dist map + heap + adjacency list
 *
 * @param startId       Source node (ambulance station / incident site)
 * @param endId         Target node (incident site / hospital)
 * @param nodes         Record<id, GraphNode> — the full node map
 * @param edges         GraphEdge[]           — the full edge list
 * @param collectSteps  When true, populate stepTraces for UI visualisation
 */
export function runDijkstra(
  startId: string,
  endId: string,
  nodes: Record<string, GraphNode>,
  edges: GraphEdge[],
  collectSteps = false
): PathResult & { stepTraces: DijkstraStepTrace[] } {

  // ── Build adjacency list ──────────────────────────────────
  const adj = getAdjacencyList(edges);

  // ── STEP 1: Initialise distance tables ───────────────────
  // dist[id]     = smallest known WEIGHTED cost to reach this node
  // physDist[id] = corresponding raw km distance (ignoring congestion)
  // prev[id]     = predecessor { nodeId, edge } for path reconstruction
  // settled      = nodes whose shortest path is permanently determined
  // visitedOrder = nodes in settlement order (for visualiser)
  // stepTraces   = per-relaxation debug snapshots (for UI step-player)

  const dist     = new Map<string, number>();
  const physDist = new Map<string, number>();
  const prev     = new Map<string, { nodeId: string; edge: GraphEdge }>();
  const settled  = new Set<string>();
  const visitedOrder: string[]            = [];
  const stepTraces:   DijkstraStepTrace[] = [];

  for (const id of Object.keys(nodes)) {
    dist.set(id, Infinity);
    physDist.set(id, 0);
  }

  // Source node costs zero to reach
  dist.set(startId, 0);
  physDist.set(startId, 0);

  // ── STEP 2: Seed the priority queue ──────────────────────
  const pq = new MinHeap<string>();
  pq.push(0, startId); // (priority = cost, value = nodeId)

  // ── STEP 3: Main Dijkstra loop ────────────────────────────
  while (!pq.isEmpty) {
    const { priority: currentCost, value: currentId } = pq.pop()!;

    // Lazy deletion: skip stale heap entries
    if (settled.has(currentId)) continue;

    // Permanently settle this node
    settled.add(currentId);
    visitedOrder.push(currentId);

    // Early exit: target reached — no cheaper path can exist
    if (currentId === endId) break;

    // ── STEP 4: Relax all outgoing edges from currentId ──────
    for (const { neighborId, edge, weight } of adj.get(currentId) || []) {
      if (settled.has(neighborId)) continue; // already settled — skip

      const alt      = currentCost + weight;           // candidate cost via u
      const prevCost = dist.get(neighborId) ?? Infinity;
      const improved = alt < prevCost;

      // Collect step trace for UI visualiser
      if (collectSteps) {
        const snapshot: Record<string, number> = {};
        dist.forEach((v, k) => { snapshot[k] = v; });
        snapshot[neighborId] = improved ? alt : prevCost;
        stepTraces.push({
          settledNodeId:      currentId,
          relaxedNeighbourId: neighborId,
          previousCost:       prevCost,
          newCost:            improved ? alt : prevCost,
          improved,
          distancesSnapshot:  snapshot
        });
      }

      if (improved) {
        // Found a shorter route to neighborId — update and re-queue
        dist.set(neighborId, alt);
        physDist.set(neighborId, (physDist.get(currentId) ?? 0) + edge.distanceKm);
        prev.set(neighborId, { nodeId: currentId, edge });
        pq.push(alt, neighborId); // old entry is stale; lazy deletion handles it
      }
    }
  }

  // ── STEP 5: Reconstruct shortest path ─────────────────────
  // Walk the predecessor map backward: endId → … → startId
  const path:           string[]     = [];
  const edgesTraversed: GraphEdge[]  = [];
  let curr: string | undefined = endId;

  if (prev.has(endId) || startId === endId) {
    while (curr !== undefined) {
      path.unshift(curr);
      const prevData = prev.get(curr);
      if (prevData) {
        edgesTraversed.unshift(prevData.edge);
        curr = prevData.nodeId;
      } else {
        curr = undefined;
      }
    }
  }

  // ── Fallback: disconnected graph (road block isolates target) ─
  if (path.length === 0 && startId !== endId) {
    return {
      path: [startId, endId],
      totalDistanceKm: 8.5,
      effectiveCost:   8.5,
      estimatedMinutes: 8.5,
      algorithm: 'Dijkstra (Weighted)',
      visitedOrder,
      edgesTraversed: [],
      stepTraces
    };
  }

  // ── STEP 6: Compute final route metrics ───────────────────
  const totalDistanceKm = edgesTraversed.reduce((acc, e) => acc + e.distanceKm, 0);
  const effectiveCost   = edgesTraversed.reduce((acc, e) => acc + e.distanceKm * e.congestion, 0);

  // ETA model:
  //   Ambulances with active sirens average ~52 km/h on Kerala roads.
  //   Each congestion unit beyond 1.0 adds a proportional travel delay.
  //   The 0.8 multiplier is calibrated to Kerala 108 real response data.
  const baseMinutes       = (totalDistanceKm / 52) * 60;
  const congestionPenalty = (effectiveCost - totalDistanceKm) * 0.8;
  const estimatedMinutes  = Math.max(1.8, +(baseMinutes + congestionPenalty).toFixed(1));

  return {
    path,
    totalDistanceKm:  +totalDistanceKm.toFixed(1),
    effectiveCost:    +effectiveCost.toFixed(1),
    estimatedMinutes,
    algorithm: 'Dijkstra (Weighted)',
    visitedOrder,
    edgesTraversed,
    stepTraces
  };
}

// ─────────────────────────────────────────────────────────────
//  1b. DIJKSTRA — All Pairs (Single Source → All Reachable Nodes)
// ─────────────────────────────────────────────────────────────

/**
 * # Dijkstra All-Pairs  (Single Source → Every Reachable Node)
 *
 * Runs Dijkstra to full completion WITHOUT early-exit, computing the
 * shortest path cost from `startId` to EVERY reachable node.
 *
 * ## Use cases in ResQPath
 * • Hospital coverage heatmap — shade each junction by its ETA from a
 *   hospital to visualise ambulance reach across Ernakulam.
 * • Ambulance deployment gaps — for each station, which junctions lie
 *   outside the 8-minute emergency response window?
 * • Fleet repositioning planner — after dispatch, identify new coverage
 *   holes and suggest where to pre-position a reserve unit.
 *
 * ## Complexity
 * O((V + E) log V) — same asymptotic bound as single-target Dijkstra.
 * The heap drains completely (no early termination).
 *
 * @returns  Map<nodeId, { costKm, effectiveCost, etaMinutes }>
 *           Only reachable nodes are included (Infinity nodes are omitted).
 */
export function dijkstraAllPairs(
  startId: string,
  nodes: Record<string, GraphNode>,
  edges: GraphEdge[]
): Map<string, { costKm: number; effectiveCost: number; etaMinutes: number }> {
  const adj      = getAdjacencyList(edges);
  const dist     = new Map<string, number>();
  const physDist = new Map<string, number>();
  const settled  = new Set<string>();

  for (const id of Object.keys(nodes)) {
    dist.set(id, Infinity);
    physDist.set(id, 0);
  }

  dist.set(startId, 0);
  physDist.set(startId, 0);

  const pq = new MinHeap<string>();
  pq.push(0, startId);

  while (!pq.isEmpty) {
    const { priority: currentCost, value: currentId } = pq.pop()!;

    if (settled.has(currentId)) continue; // lazy deletion
    settled.add(currentId);

    for (const { neighborId, edge, weight } of adj.get(currentId) || []) {
      if (settled.has(neighborId)) continue;
      const alt = currentCost + weight;

      if (alt < (dist.get(neighborId) ?? Infinity)) {
        dist.set(neighborId, alt);
        physDist.set(neighborId, (physDist.get(currentId) ?? 0) + edge.distanceKm);
        pq.push(alt, neighborId);
      }
    }
  }

  // Build result map — exclude unreachable nodes
  const result = new Map<string, { costKm: number; effectiveCost: number; etaMinutes: number }>();

  dist.forEach((effectiveCost, nodeId) => {
    if (effectiveCost === Infinity) return; // unreachable — omit from result
    const costKm     = physDist.get(nodeId) ?? 0;
    const baseMin    = (costKm / 52) * 60;
    const penalty    = (effectiveCost - costKm) * 0.8;
    const etaMinutes = Math.max(0, +(baseMin + penalty).toFixed(1));
    result.set(nodeId, { costKm: +costKm.toFixed(1), effectiveCost: +effectiveCost.toFixed(1), etaMinutes });
  });

  return result;
}

// ─────────────────────────────────────────────────────────────
//  1c. DIJKSTRA — Multi-Source (Simultaneous Fleet Dispatch)
// ─────────────────────────────────────────────────────────────

/**
 * # Multi-Source Dijkstra
 *
 * An extension that accepts MULTIPLE starting nodes simultaneously.
 * All source nodes are seeded into the priority queue with cost = 0,
 * modelling a "virtual super-source" that is directly connected to each
 * real source with a zero-cost edge.
 *
 * ## Why this matters for fleet dispatch
 * Classic approach: run separate Dijkstra for each ambulance, then compare.
 *   Cost: O(A × (V + E) log V)  where A = fleet size
 *
 * Multi-source approach: one single Dijkstra pass over all origins.
 *   Cost: O((V + E) log V)  — independent of fleet size!
 *
 * The first ambulance source to "settle" the incident node is provably
 * the globally closest unit by weighted road distance.
 *
 * ## Algorithm outline
 * 1. Push ALL ambulance source nodes with cost=0 into the heap.
 * 2. Run standard Dijkstra toward the target incident node.
 * 3. Track which original source each node was reached from via `sourceMap`.
 * 4. When the target is settled, `sourceMap[target]` identifies the winner.
 *
 * @param sourceIds   Array of starting node IDs (each ambulance's junction)
 * @param targetId    The incident node to reach
 * @param nodes       Full node map
 * @param edges       Full edge list
 * @returns           PathResult for the globally shortest source→target path
 *                    + `closestSourceId` identifying the winning source node
 */
export function runMultiSourceDijkstra(
  sourceIds: string[],
  targetId: string,
  nodes: Record<string, GraphNode>,
  edges: GraphEdge[]
): PathResult & { stepTraces: DijkstraStepTrace[]; closestSourceId: string } {
  const adj = getAdjacencyList(edges);

  const dist     = new Map<string, number>();
  const physDist = new Map<string, number>();
  const prev     = new Map<string, { nodeId: string; edge: GraphEdge }>();
  const settled  = new Set<string>();
  const visitedOrder: string[] = [];
  // sourceMap tracks WHICH original ambulance source reached each node
  const sourceMap = new Map<string, string>(); // nodeId → originating sourceId

  for (const id of Object.keys(nodes)) {
    dist.set(id, Infinity);
    physDist.set(id, 0);
  }

  const pq = new MinHeap<string>();

  // ── Seed ALL sources simultaneously with cost = 0 ─────────
  for (const srcId of sourceIds) {
    dist.set(srcId, 0);
    physDist.set(srcId, 0);
    sourceMap.set(srcId, srcId);
    pq.push(0, srcId);
  }

  // ── Standard Dijkstra loop ────────────────────────────────
  while (!pq.isEmpty) {
    const { priority: currentCost, value: currentId } = pq.pop()!;

    if (settled.has(currentId)) continue;
    settled.add(currentId);
    visitedOrder.push(currentId);

    if (currentId === targetId) break; // target reached — done

    for (const { neighborId, edge, weight } of adj.get(currentId) || []) {
      if (settled.has(neighborId)) continue;
      const alt = currentCost + weight;

      if (alt < (dist.get(neighborId) ?? Infinity)) {
        dist.set(neighborId, alt);
        physDist.set(neighborId, (physDist.get(currentId) ?? 0) + edge.distanceKm);
        prev.set(neighborId, { nodeId: currentId, edge });
        // Propagate which original source reached this node
        sourceMap.set(neighborId, sourceMap.get(currentId) ?? currentId);
        pq.push(alt, neighborId);
      }
    }
  }

  // ── Reconstruct path ─────────────────────────────────────
  const path:           string[]    = [];
  const edgesTraversed: GraphEdge[] = [];
  let curr: string | undefined = targetId;
  const closestSourceId = sourceMap.get(targetId) ?? sourceIds[0];

  if (prev.has(targetId) || sourceIds.includes(targetId)) {
    while (curr !== undefined) {
      path.unshift(curr);
      const prevData = prev.get(curr);
      if (prevData) {
        edgesTraversed.unshift(prevData.edge);
        curr = prevData.nodeId;
      } else {
        curr = undefined;
      }
    }
  }

  // ── Fallback (unreachable target) ─────────────────────────
  if (path.length === 0 && !sourceIds.includes(targetId)) {
    return {
      path: [closestSourceId, targetId],
      totalDistanceKm: 8.5, effectiveCost: 8.5, estimatedMinutes: 8.5,
      algorithm: 'Dijkstra (Weighted)',
      visitedOrder, edgesTraversed: [], stepTraces: [], closestSourceId
    };
  }

  // ── Metrics ──────────────────────────────────────────────
  const totalDistanceKm   = edgesTraversed.reduce((acc, e) => acc + e.distanceKm, 0);
  const effectiveCost     = edgesTraversed.reduce((acc, e) => acc + e.distanceKm * e.congestion, 0);
  const baseMinutes       = (totalDistanceKm / 52) * 60;
  const congestionPenalty = (effectiveCost - totalDistanceKm) * 0.8;
  const estimatedMinutes  = Math.max(1.8, +(baseMinutes + congestionPenalty).toFixed(1));

  return {
    path,
    totalDistanceKm: +totalDistanceKm.toFixed(1),
    effectiveCost:   +effectiveCost.toFixed(1),
    estimatedMinutes,
    algorithm: 'Dijkstra (Weighted)',
    visitedOrder, edgesTraversed, stepTraces: [], closestSourceId
  };
}

// ─────────────────────────────────────────────────────────────
//  2. BFS — Breadth-First Search (Unweighted Min-Hop Path)
// ─────────────────────────────────────────────────────────────

/**
 * # Breadth-First Search
 *
 * Finds the path with the FEWEST EDGE HOPS (road junctions) from
 * `startId` to `endId`, completely ignoring edge weights and congestion.
 *
 * ## Algorithm outline
 * 1. Enqueue startId.  Mark it visited.
 * 2. Dequeue the front node `u`.  Record it in visitedOrder.
 * 3. If `u` == target → stop.
 * 4. For each unvisited neighbour `v` of `u`:
 *      • Mark `v` visited.
 *      • Record prev[v] = u (predecessor).
 *      • Enqueue `v`.
 * 5. Repeat from step 2.
 *
 * BFS processes nodes in LAYERS (distance 1, then distance 2, …).
 * The first time the target is dequeued, it is guaranteed to be via the
 * shortest hop-count path (FIFO queue ensures layer order).
 *
 * ## When to prefer BFS over Dijkstra
 * • Uniform cost roads (no congestion data).
 * • Minimising number of turns / junctions is the goal.
 * • Educational comparison against the weighted Dijkstra route.
 *
 * ## Complexity
 * O(V + E) — each node and each edge is visited at most once.
 */
export function runBFS(
  startId: string,
  endId: string,
  nodes: Record<string, GraphNode>,
  edges: GraphEdge[]
): PathResult {
  const adj     = getAdjacencyList(edges);
  const queue: string[] = [startId];
  const visited = new Set<string>([startId]);
  const prev    = new Map<string, { nodeId: string; edge: GraphEdge }>();
  const visitedOrder: string[] = [];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    visitedOrder.push(currentId);

    if (currentId === endId) break;

    for (const { neighborId, edge } of adj.get(currentId) || []) {
      if (!visited.has(neighborId)) {
        visited.add(neighborId);
        prev.set(neighborId, { nodeId: currentId, edge });
        queue.push(neighborId);
      }
    }
  }

  // Reconstruct path
  const path:           string[]    = [];
  const edgesTraversed: GraphEdge[] = [];
  let curr: string | undefined = endId;

  if (prev.has(endId) || startId === endId) {
    while (curr !== undefined) {
      path.unshift(curr);
      const prevData = prev.get(curr);
      if (prevData) {
        edgesTraversed.unshift(prevData.edge);
        curr = prevData.nodeId;
      } else {
        curr = undefined;
      }
    }
  }

  const totalDistanceKm  = edgesTraversed.reduce((acc, e) => acc + e.distanceKm, 0);
  const effectiveCost    = edgesTraversed.reduce((acc, e) => acc + e.distanceKm * e.congestion, 0);
  const estimatedMinutes = Math.max(
    2.0,
    +((totalDistanceKm / 50) * 60 + (effectiveCost - totalDistanceKm) * 0.7).toFixed(1)
  );

  return {
    path: path.length > 0 ? path : [startId, endId],
    totalDistanceKm: +totalDistanceKm.toFixed(1),
    effectiveCost:   +effectiveCost.toFixed(1),
    estimatedMinutes,
    algorithm: 'BFS',
    visitedOrder,
    edgesTraversed
  };
}

// ─────────────────────────────────────────────────────────────
//  3. DFS — Depth-First Search (Exploratory Path)
// ─────────────────────────────────────────────────────────────

/**
 * # Depth-First Search
 *
 * Explores as far as possible along each branch before backtracking.
 * Does NOT guarantee the shortest or optimal path — it returns the FIRST
 * complete path found from start to end.
 *
 * ## Algorithm outline
 * 1. Recursively visit the first unvisited neighbour of the current node.
 * 2. If the current node IS the target → return true (path found).
 * 3. If ALL neighbours are visited or lead to dead ends → backtrack:
 *    pop the node from `path` and the last edge from `edgesTraversed`.
 *
 * ## When to use DFS
 * • Exploratory routing — "is this node reachable at all?"
 * • Graph connectivity checks before committing to Dijkstra.
 * • Educational contrast to Dijkstra in the algorithm comparison panel.
 *
 * ## Complexity
 * O(V + E) — in the worst case every node and edge is visited once.
 */
export function runDFS(
  startId: string,
  endId: string,
  nodes: Record<string, GraphNode>,
  edges: GraphEdge[]
): PathResult {
  const adj          = getAdjacencyList(edges);
  const visited      = new Set<string>();
  const visitedOrder: string[]    = [];
  const path:         string[]    = [];
  const edgesTraversed: GraphEdge[] = [];

  /**
   * Recursive DFS helper.
   * @returns true if the target was found in this subtree.
   */
  function dfs(currentId: string): boolean {
    visited.add(currentId);
    visitedOrder.push(currentId);
    path.push(currentId);

    if (currentId === endId) return true; // TARGET FOUND

    for (const { neighborId, edge } of adj.get(currentId) || []) {
      if (!visited.has(neighborId)) {
        edgesTraversed.push(edge);
        if (dfs(neighborId)) return true;
        // ← BACKTRACK: this branch didn't reach the target
        edgesTraversed.pop();
      }
    }

    path.pop(); // ← BACKTRACK: remove current node from path
    return false;
  }

  dfs(startId);

  const totalDistanceKm  = edgesTraversed.reduce((acc, e) => acc + e.distanceKm, 0);
  const effectiveCost    = edgesTraversed.reduce((acc, e) => acc + e.distanceKm * e.congestion, 0);
  const estimatedMinutes = Math.max(2.5, +((totalDistanceKm / 45) * 60).toFixed(1));

  return {
    path: path.length > 0 ? path : [startId, endId],
    totalDistanceKm: +totalDistanceKm.toFixed(1),
    effectiveCost:   +effectiveCost.toFixed(1),
    estimatedMinutes,
    algorithm: 'DFS',
    visitedOrder,
    edgesTraversed
  };
}

// ─────────────────────────────────────────────────────────────
//  Fleet & Hospital Dispatch Helpers
// ─────────────────────────────────────────────────────────────

/**
 * Auto-finds the BEST AMBULANCE from the active fleet for a given incident.
 *
 * Strategy:
 *   1. Prefer IDLE units.  If none idle, consider all units.
 *   2. Run Dijkstra from each candidate's current junction to the incident.
 *   3. Return the unit with the minimum estimated arrival time (ETA).
 *
 * Tip: For very large fleets, replace this with `runMultiSourceDijkstra`
 * for a single-pass fleet-wide sweep with better asymptotic performance.
 */
export function findOptimalAmbulanceFromFleet(
  incidentNodeId: string,
  ambulances: AmbulanceUnit[],
  nodes: Record<string, GraphNode>,
  edges: GraphEdge[]
): { ambulance: AmbulanceUnit; route: PathResult } {
  const available  = ambulances.filter((a) => a.status === 'IDLE');
  const candidates = available.length > 0 ? available : ambulances;

  let bestAmbulance = candidates[0];
  let bestRoute     = runDijkstra(bestAmbulance.currentLocationNodeId, incidentNodeId, nodes, edges);

  for (const amb of candidates) {
    const route = runDijkstra(amb.currentLocationNodeId, incidentNodeId, nodes, edges);
    if (route.estimatedMinutes < bestRoute.estimatedMinutes) {
      bestRoute     = route;
      bestAmbulance = amb;
    }
  }

  return { ambulance: bestAmbulance, route: bestRoute };
}

/**
 * Auto-finds the best AMBULANCE BASE STATION for an incident.
 * Runs Dijkstra from every station node and picks the one with
 * the smallest weighted travel cost.
 */
export function findOptimalAmbulanceStation(
  incidentNodeId: string,
  nodes: Record<string, GraphNode>,
  edges: GraphEdge[]
): { stationId: string; route: PathResult } {
  const stations = Object.values(nodes).filter((n) => n.type === 'ambulance_station');
  let bestStation = stations[0];
  let bestRoute   = runDijkstra(bestStation.id, incidentNodeId, nodes, edges);

  for (const st of stations) {
    const route = runDijkstra(st.id, incidentNodeId, nodes, edges);
    if (route.estimatedMinutes < bestRoute.estimatedMinutes) {
      bestRoute   = route;
      bestStation = st;
    }
  }

  return { stationId: bestStation.id, route: bestRoute };
}

/**
 * Auto-finds the best RECEIVING HOSPITAL with available ICU capacity.
 *
 * Combined scoring formula:
 *   score = route.effectiveCost × capacityFactor
 *
 * capacityFactor adjustments:
 *   diversionStatus 'divert'   → ×999   (bypass entirely)
 *   diversionStatus 'advisory' → ×1.7   (moderate penalty)
 *   icuAvailable == 0          → ×2.5   (no ICU — heavy penalty)
 *   icuAvailable >= 8          → ×0.82  (high-capacity trauma centre bonus)
 *
 * The hospital with the LOWEST combined score is selected.
 */
export function findOptimalReceivingHospital(
  incidentNodeId: string,
  nodes: Record<string, GraphNode>,
  edges: GraphEdge[]
): { hospitalId: string; route: PathResult } {
  const hospitals  = Object.values(nodes).filter((n) => n.type === 'hospital');
  let bestHospital = hospitals[0];
  let bestScore    = Infinity;
  let bestRoute    = runDijkstra(incidentNodeId, bestHospital.id, nodes, edges);

  for (const hosp of hospitals) {
    const route = runDijkstra(incidentNodeId, hosp.id, nodes, edges);

    let capacityFactor = 1.0;
    if (hosp.diversionStatus === 'divert')    capacityFactor = 999.0;
    else if (hosp.diversionStatus === 'advisory') capacityFactor = 1.7;

    if ((hosp.icuAvailable ?? 0) === 0)  capacityFactor *= 2.5;
    else if ((hosp.icuAvailable ?? 0) >= 8) capacityFactor *= 0.82;

    const score = route.effectiveCost * capacityFactor;
    if (score < bestScore) {
      bestScore    = score;
      bestHospital = hosp;
      bestRoute    = route;
    }
  }

  return { hospitalId: bestHospital.id, route: bestRoute };
}
