// Prerequisite-graph utilities: cycle detection and prioritised topological ordering.

export interface GraphNode {
  id: string;
  prerequisites: string[];
}

/**
 * Returns the ids of every node that lies on a prerequisite cycle
 * (strongly connected component of size > 1, or a self-reference).
 * Implements Tarjan's SCC algorithm iteratively-safe for curriculum sizes.
 */
export function detectCircularDependencies(nodes: GraphNode[]): Set<string> {
  const ids = new Set(nodes.map((n) => n.id));
  const edges = new Map<string, string[]>();
  for (const node of nodes) {
    edges.set(
      node.id,
      node.prerequisites.filter((p) => ids.has(p)),
    );
  }

  let index = 0;
  const indices = new Map<string, number>();
  const lowLink = new Map<string, number>();
  const stack: string[] = [];
  const onStack = new Set<string>();
  const inCycle = new Set<string>();

  const strongConnect = (v: string) => {
    indices.set(v, index);
    lowLink.set(v, index);
    index += 1;
    stack.push(v);
    onStack.add(v);

    for (const w of edges.get(v) ?? []) {
      if (!indices.has(w)) {
        strongConnect(w);
        lowLink.set(v, Math.min(lowLink.get(v)!, lowLink.get(w)!));
      } else if (onStack.has(w)) {
        lowLink.set(v, Math.min(lowLink.get(v)!, indices.get(w)!));
      }
    }

    if (lowLink.get(v) === indices.get(v)) {
      const component: string[] = [];
      let w: string;
      do {
        w = stack.pop()!;
        onStack.delete(w);
        component.push(w);
      } while (w !== v);
      const selfLoop = component.length === 1 && (edges.get(v) ?? []).includes(v);
      if (component.length > 1 || selfLoop) component.forEach((c) => inCycle.add(c));
    }
  };

  for (const node of nodes) {
    if (!indices.has(node.id)) strongConnect(node.id);
  }
  return inCycle;
}

/** Would adding `prerequisiteId` as a prerequisite of `topicId` create a cycle? */
export function wouldCreateCycle(nodes: GraphNode[], topicId: string, prerequisiteId: string): boolean {
  if (topicId === prerequisiteId) return true;
  const byId = new Map(nodes.map((n) => [n.id, n]));
  // A cycle appears if topicId is already reachable from prerequisiteId's prerequisite chain.
  const visited = new Set<string>();
  const stack = [prerequisiteId];
  while (stack.length > 0) {
    const current = stack.pop()!;
    if (current === topicId) return true;
    if (visited.has(current)) continue;
    visited.add(current);
    for (const p of byId.get(current)?.prerequisites ?? []) stack.push(p);
  }
  return false;
}

export interface TopologicalResult {
  order: string[];
  /** Nodes that could not be ordered because they depend on a cycle. */
  blocked: string[];
}

/**
 * Kahn's algorithm where, at every step, the highest-ranked available node
 * (according to `compare`) is emitted next. Only edges between nodes in `nodes`
 * constrain the order; prerequisites outside the set are assumed satisfied.
 */
export function prioritizedTopologicalOrder<T extends GraphNode>(
  nodes: T[],
  compare: (a: T, b: T) => number,
): TopologicalResult {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const inDegree = new Map<string, number>();
  const dependents = new Map<string, string[]>();

  for (const node of nodes) {
    const internal = [...new Set(node.prerequisites)].filter((p) => byId.has(p) && p !== node.id);
    inDegree.set(node.id, internal.length + (node.prerequisites.includes(node.id) ? 1 : 0));
    for (const p of internal) {
      dependents.set(p, [...(dependents.get(p) ?? []), node.id]);
    }
  }

  const available = nodes.filter((n) => inDegree.get(n.id) === 0);
  const order: string[] = [];

  while (available.length > 0) {
    available.sort(compare);
    const next = available.shift()!;
    order.push(next.id);
    for (const dependentId of dependents.get(next.id) ?? []) {
      const remaining = (inDegree.get(dependentId) ?? 0) - 1;
      inDegree.set(dependentId, remaining);
      if (remaining === 0) available.push(byId.get(dependentId)!);
    }
  }

  const placed = new Set(order);
  const blocked = nodes.filter((n) => !placed.has(n.id)).sort(compare).map((n) => n.id);
  return { order, blocked };
}

/** Number of topics that list each topic as a prerequisite. */
export function countDependents(nodes: GraphNode[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const node of nodes) {
    for (const p of new Set(node.prerequisites)) counts.set(p, (counts.get(p) ?? 0) + 1);
  }
  return counts;
}
