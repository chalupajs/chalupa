/**
 * A simple dependency graph
 */
export interface IDependencyGraph<T> {
	/**
	 * The number of nodes in the graph.
	 */
	size(): number
	/**
	 * Add a node in the graph with optional data. If data is not given, name will be used as data.
	 * @param {string} name
	 * @param data
	 */
	addNode(name: string, data?: T): void
	/**
	 * Remove a node from the graph.
	 * @param {string} name
	 */
	removeNode(name: string): void
	/**
	 * Check if a node exists in the graph.
	 * @param {string} name
	 */
	hasNode(name: string): boolean
	/**
	 * Get the data associated with a node (will throw an Error if the node does not exist).
	 * @param {string} name
	 */
	getNodeData(name: string): T
	/**
	 * Set the data for an existing node (will throw an Error if the node does not exist).
	 * @param {string} name
	 * @param data
	 */
	setNodeData(name: string, data?: T): void
	/**
	 * Add a dependency between two nodes (will throw an Error if one of the nodes does not exist).
	 * @param {string} from
	 * @param {string} to
	 */
	addDependency(from: string, to: string): void
	/**
	 * Remove a dependency between two nodes.
	 * @param {string} from
	 * @param {string} to
	 */
	removeDependency(from: string, to: string): void
	/**
	 * Return a clone of the dependency graph (If any custom data is attached
	 * to the nodes, it will only be shallow copied).
	 */
	clone(): IDependencyGraph<T>
	/**
	 * Get an array containing the direct dependency nodes of the specified node.
	 * @param name
	 */
	directDependenciesOf(name: string): string[]
	/**
	 * Get an array containing the nodes that directly depend on the specified node.
	 * @param name
	 */
	directDependantsOf(name: string): string[]
	/**
	 * Get an array containing the nodes that the specified node depends on (transitively). If leavesOnly is true, only nodes that do not depend on any other nodes will be returned in the array.
	 * @param {string} name
	 * @param {boolean} leavesOnly
	 */
	dependenciesOf(name: string, leavesOnly?: boolean): string[]
	/**
	 * Get an array containing the nodes that depend on the specified node (transitively). If leavesOnly is true, only nodes that do not have any dependants will be returned in the array.
	 * @param {string} name
	 * @param {boolean} leavesOnly
	 */
	dependantsOf(name: string, leavesOnly?: boolean): string[]
	/**
	 * Get an array of nodes that have no dependants (i.e. nothing depends on them).
	 */
	entryNodes(): string[]
	/**
	 * Construct the overall processing order for the dependency graph. If leavesOnly is true, only nodes that do not depend on any other nodes will be returned.
	 * @param {boolean} leavesOnly
	 */
	overallOrder(leavesOnly?: boolean): string[]
}
export declare class DependencyGraph<T = any> implements IDependencyGraph<T> {
	nodes: Record<string, T>
	outgoingEdges: Record<string, string[]>
	incomingEdges: Record<string, string[]>
	constructor()
	/**
	 * The number of nodes in the graph.
	 */
	size(): number
	/**
	 * Add a node to the dependency graph. If a node already exists, this method will do nothing.
	 */
	addNode(nodeName: string, data?: T): void
	/**
	 * Remove a node from the dependency graph. If a node does not exist, this method will do nothing.
	 */
	removeNode(nodeName: string): void
	/**
	 * Check if a node exists in the graph
	 */
	hasNode(nodeName: string): boolean
	/**
	 * Get the data associated with a node name
	 */
	getNodeData(nodeName: string): T
	/**
	 * Set the associated data for a given node name. If the node does not exist, this method will throw an error
	 */
	setNodeData(nodeName: string, data: T): void
	/**
	 * Add a dependency between two nodes. If either of the nodes does not exist,
	 * an Error will be thrown.
	 */
	addDependency(from: string, to: string): boolean
	/**
	 * Remove a dependency between two nodes.
	 */
	removeDependency(from: string, to: string): void
	/**
	 * Return a clone of the dependency graph. If any custom data is attached
	 * to the nodes, it will only be shallow copied.
	 */
	clone(): IDependencyGraph<T>
	/**
	 * Get an array containing the direct dependencies of the specified node.
	 *
	 * Throws an Error if the specified node does not exist.
	 */
	directDependenciesOf(nodeName: string): string[]
	/**
	 * Get an array containing the nodes that directly depend on the specified node.
	 *
	 * Throws an Error if the specified node does not exist.
	 */
	directDependantsOf(nodeName: string): string[]
	/**
	 * Get an array containing the nodes that the specified node depends on (transitively).
	 *
	 * Throws an Error if the graph has a cycle, or the specified node does not exist.
	 *
	 * If `leavesOnly` is true, only nodes that do not depend on any other nodes will be returned
	 * in the array.
	 */
	dependenciesOf(nodeName: string, leavesOnly?: boolean): string[]
	/**
	 * Get an array containing the nodes that depend on the specified node (transitively).
	 *
	 * Throws an Error if the graph has a cycle, or the specified node does not exist.
	 *
	 * If `leavesOnly` is true, only nodes that do not have any dependants will be returned in the array.
	 */
	dependantsOf(node: string, leavesOnly?: boolean): string[]
	/**
	 * Construct the overall processing order for the dependency graph.
	 *
	 * Throws an Error if the graph has a cycle.
	 *
	 * If `leavesOnly` is true, only nodes that do not depend on any other nodes will be returned.
	 */
	overallOrder(leavesOnly?: boolean): string[]
	/**
	 * Get an array of nodes that have no dependants (i.e. nothing depends on them).
	 */
	entryNodes(): string[]
}
export declare class DepGraphCycleError extends Error {
	cyclePath: string[]
	constructor(cyclePath: string[])
}
