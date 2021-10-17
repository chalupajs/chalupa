'use strict'
/**
 * A simple dependency graph
 */
Object.defineProperty(exports, '__esModule', { value: true })
exports.DepGraphCycleError = exports.DependencyGraph = void 0
/**
 * Helper for creating a Topological Sort using Depth-First-Search on a set of edges.
 *
 * Detects cycles and throws an Error if one is detected (unless the "circular"
 * parameter is "true" in which case it ignores them).
 *
 * @param edges The set of edges to DFS through
 * @param leavesOnly Whether to only return "leaf" nodes (ones who have no edges)
 * @param result An array in which the results will be populated
 * @param circular A boolean to allow circular dependencies
 */
function createDFS(edges, leavesOnly, result, circular) {
	const visited = {}
	return function (start) {
		if (visited[start]) {
			return
		}

		const inCurrentPath = {}
		const currentPath = []
		const todo = [] // Used as a stack
		todo.push({ node: start, processed: false })
		while (todo.length > 0) {
			const current = todo[todo.length - 1] // Peek at the todo stack
			const { processed } = current
			const { node } = current
			if (!processed) {
				// Haven't visited edges yet (visiting phase)
				if (visited[node]) {
					todo.pop()
					continue
				} else if (inCurrentPath[node]) {
					// It's not a DAG
					if (circular) {
						todo.pop()
						// If we're tolerating cycles, don't revisit the node
						continue
					}

					currentPath.push(node)
					throw new DepGraphCycleError(currentPath)
				}

				inCurrentPath[node] = true
				currentPath.push(node)
				const nodeEdges = edges[node]
				// (push edges onto the todo stack in reverse order to be order-compatible with the old DFS implementation)
				for (let i = nodeEdges.length - 1; i >= 0; i--) {
					todo.push({ node: nodeEdges[i], processed: false })
				}

				current.processed = true
			} else {
				// Have visited edges (stack unrolling phase)
				todo.pop()
				currentPath.pop()
				inCurrentPath[node] = false
				visited[node] = true
				if (!leavesOnly || edges[node].length === 0) {
					result.push(node)
				}
			}
		}
	}
}

class DependencyGraph {
	constructor() {
		this.nodes = {}
		this.outgoingEdges = {}
		this.incomingEdges = {}
	}

	/**
	 * The number of nodes in the graph.
	 */
	size() {
		return Object.keys(this.nodes).length
	}

	/**
	 * Add a node to the dependency graph. If a node already exists, this method will do nothing.
	 */
	addNode(nodeName, data) {
		if (!this.hasNode(nodeName)) {
			// @ts-ignore
			this.nodes[nodeName] = data ?? nodeName
			this.outgoingEdges[nodeName] = []
			this.incomingEdges[nodeName] = []
		}
	}

	/**
	 * Remove a node from the dependency graph. If a node does not exist, this method will do nothing.
	 */
	removeNode(nodeName) {
		if (this.hasNode(nodeName)) {
			delete this.nodes[nodeName]
			delete this.outgoingEdges[nodeName]
			delete this.incomingEdges[nodeName]
			;[this.incomingEdges, this.outgoingEdges].forEach(edgeList => {
				Object.keys(edgeList).forEach(key => {
					const idx = edgeList[key].indexOf(nodeName)
					if (idx >= 0) {
						edgeList[key].splice(idx, 1)
					}
				})
			})
		}
	}

	/**
	 * Check if a node exists in the graph
	 */
	hasNode(nodeName) {
		return this.nodes.hasOwnProperty(nodeName)
	}

	/**
	 * Get the data associated with a node name
	 */
	getNodeData(nodeName) {
		if (this.hasNode(nodeName)) {
			return this.nodes[nodeName]
		}

		throw new Error('Node does not exist: ' + nodeName)
	}

	/**
	 * Set the associated data for a given node name. If the node does not exist, this method will throw an error
	 */
	setNodeData(nodeName, data) {
		if (this.hasNode(nodeName)) {
			this.nodes[nodeName] = data
		} else {
			throw new Error('Node does not exist: ' + nodeName)
		}
	}

	/**
	 * Add a dependency between two nodes. If either of the nodes does not exist,
	 * an Error will be thrown.
	 */
	addDependency(from, to) {
		if (!this.hasNode(from)) {
			throw new Error('Node does not exist: ' + from)
		}

		if (!this.hasNode(to)) {
			throw new Error('Node does not exist: ' + to)
		}

		if (!this.outgoingEdges[from].includes(to)) {
			this.outgoingEdges[from].push(to)
		}

		if (!this.incomingEdges[to].includes(from)) {
			this.incomingEdges[to].push(from)
		}

		return true
	}

	/**
	 * Remove a dependency between two nodes.
	 */
	removeDependency(from, to) {
		let idx
		if (this.hasNode(from)) {
			idx = this.outgoingEdges[from].indexOf(to)
			if (idx >= 0) {
				this.outgoingEdges[from].splice(idx, 1)
			}
		}

		if (this.hasNode(to)) {
			idx = this.incomingEdges[to].indexOf(from)
			if (idx >= 0) {
				this.incomingEdges[to].splice(idx, 1)
			}
		}
	}

	/**
	 * Return a clone of the dependency graph. If any custom data is attached
	 * to the nodes, it will only be shallow copied.
	 */
	clone() {
		const source = this
		const result = new DependencyGraph()
		const keys = Object.keys(source.nodes)
		keys.forEach(n => {
			result.nodes[n] = source.nodes[n]
			result.outgoingEdges[n] = [...source.outgoingEdges[n]]
			result.incomingEdges[n] = [...source.incomingEdges[n]]
		})
		return result
	}

	/**
	 * Get an array containing the direct dependencies of the specified node.
	 *
	 * Throws an Error if the specified node does not exist.
	 */
	directDependenciesOf(nodeName) {
		if (this.hasNode(nodeName)) {
			return [...this.outgoingEdges[nodeName]]
		}

		throw new Error('Node does not exist: ' + nodeName)
	}

	/**
	 * Get an array containing the nodes that directly depend on the specified node.
	 *
	 * Throws an Error if the specified node does not exist.
	 */
	directDependantsOf(nodeName) {
		if (this.hasNode(nodeName)) {
			return [...this.incomingEdges[nodeName]]
		}

		throw new Error('Node does not exist: ' + nodeName)
	}

	/**
	 * Get an array containing the nodes that the specified node depends on (transitively).
	 *
	 * Throws an Error if the graph has a cycle, or the specified node does not exist.
	 *
	 * If `leavesOnly` is true, only nodes that do not depend on any other nodes will be returned
	 * in the array.
	 */
	dependenciesOf(nodeName, leavesOnly) {
		if (this.hasNode(nodeName)) {
			const result = []
			const DFS = createDFS(this.outgoingEdges, leavesOnly, result, false)
			DFS(nodeName)
			const idx = result.indexOf(nodeName)
			if (idx >= 0) {
				result.splice(idx, 1)
			}

			return result
		}

		throw new Error('Node does not exist: ' + nodeName)
	}

	/**
	 * Get an array containing the nodes that depend on the specified node (transitively).
	 *
	 * Throws an Error if the graph has a cycle, or the specified node does not exist.
	 *
	 * If `leavesOnly` is true, only nodes that do not have any dependants will be returned in the array.
	 */
	dependantsOf(node, leavesOnly) {
		if (this.hasNode(node)) {
			const result = []
			const DFS = createDFS(this.incomingEdges, leavesOnly, result, false)
			DFS(node)
			const idx = result.indexOf(node)
			if (idx >= 0) {
				result.splice(idx, 1)
			}

			return result
		}

		throw new Error('Node does not exist: ' + node)
	}

	/**
	 * Construct the overall processing order for the dependency graph.
	 *
	 * Throws an Error if the graph has a cycle.
	 *
	 * If `leavesOnly` is true, only nodes that do not depend on any other nodes will be returned.
	 */
	overallOrder(leavesOnly) {
		const self = this
		const result = []
		const keys = Object.keys(this.nodes)
		if (keys.length === 0) {
			return result // Empty graph
		}

		// Look for cycles - we run the DFS starting at all the nodes in case there
		// are several disconnected subgraphs inside this dependency graph.
		const CycleDFS = createDFS(this.outgoingEdges, false, [], false)
		keys.forEach(n => {
			CycleDFS(n)
		})
		const DFS = createDFS(this.outgoingEdges, leavesOnly, result, false)
		// Find all potential starting points (nodes with nothing depending on them) an
		// run a DFS starting at these points to get the order
		keys.filter(node => self.incomingEdges[node].length === 0).forEach(n => {
			DFS(n)
		})
		// If we're allowing cycles - we need to run the DFS against any remaining
		// nodes that did not end up in the initial result (as they are part of a
		// subgraph that does not have a clear starting point)
		// INFO: We dont allow any cycle!!!
		// if (this.circular) {
		// 	keys
		// 		.filter(function (node) {
		// 			return result.indexOf(node) === -1;
		// 		})
		// 		.forEach(function (n) {
		// 			DFS(n);
		// 		});
		// }
		return result
	}

	/**
	 * Get an array of nodes that have no dependants (i.e. nothing depends on them).
	 */
	entryNodes() {
		return Object.keys(this.nodes).filter(nodeName => this.incomingEdges[nodeName].length === 0)
	}
}
exports.DependencyGraph = DependencyGraph
class DepGraphCycleError extends Error {
	constructor(cyclePath) {
		super('Dependency Cycle Found: ' + cyclePath.join(' -> '))
		this.cyclePath = cyclePath
	}
}
exports.DepGraphCycleError = DepGraphCycleError
// # sourceMappingURL=index.js.map
