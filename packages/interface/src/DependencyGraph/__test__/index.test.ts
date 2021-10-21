import { DependencyGraph, DepGraphCycleError } from '../index'

describe('DepGraph', () => {
	it('should be able to add/remove nodes', () => {
		const graph = new DependencyGraph()

		graph.addNode('Foo')
		graph.addNode('Bar')

		expect(graph.hasNode('Foo')).toBeTruthy()
		expect(graph.hasNode('Bar')).toBeTruthy()
		expect(graph.hasNode('NotThere')).toBeFalsy()

		graph.removeNode('Bar')

		expect(graph.hasNode('Bar')).toBeFalsy()
	})

	it('should calculate its size', () => {
		const graph = new DependencyGraph()

		expect(graph.size()).toBe(0)

		graph.addNode('Foo')
		graph.addNode('Bar')

		expect(graph.size()).toBe(2)

		graph.removeNode('Bar')

		expect(graph.size()).toBe(1)
	})

	it('should treat the node data parameter as optional and use the node name as data if node data was not given', () => {
		const graph = new DependencyGraph()

		graph.addNode('Foo')

		expect(graph.getNodeData('Foo')).toBe('Foo')
	})

	it('should be able to associate a node name with data on node add', () => {
		const graph = new DependencyGraph()

		graph.addNode('Foo', 'data')

		expect(graph.getNodeData('Foo')).toBe('data')
	})

	it('should return true when using hasNode with a node which has falsy data', () => {
		const graph = new DependencyGraph()

		const falsyData = ['', 0, null, undefined, false]
		graph.addNode('Foo')

		falsyData.forEach(data => {
			graph.setNodeData('Foo', data)

			expect(graph.hasNode('Foo')).toBeTruthy()

			// Just an extra check to make sure that the saved data is correct
			expect(graph.getNodeData('Foo')).toBe(data)
		})
	})

	it('should be able to set data after a node was added', () => {
		const graph = new DependencyGraph()

		graph.addNode('Foo', 'data')
		graph.setNodeData('Foo', 'data2')

		expect(graph.getNodeData('Foo')).toBe('data2')
	})

	it('should throw an error if we try to set data for a non-existing node', () => {
		const graph = new DependencyGraph()

		expect(() => {
			graph.setNodeData('Foo', 'data')
		}).toThrow(new Error('Node does not exist: Foo'))
	})

	it('should throw an error if the node does not exists and we try to get data', () => {
		const graph = new DependencyGraph()

		expect(() => {
			graph.getNodeData('Foo')
		}).toThrow(new Error('Node does not exist: Foo'))
	})

	it('should do nothing if creating a node that already exists', () => {
		const graph = new DependencyGraph()

		graph.addNode('a')
		graph.addNode('b')

		graph.addDependency('a', 'b')

		graph.addNode('a')

		expect(graph.dependenciesOf('a')).toEqual(['b'])
	})

	it('should do nothing if removing a node that does not exist', () => {
		const graph = new DependencyGraph()

		graph.addNode('a')
		expect(graph.hasNode('a')).toBeTruthy()

		graph.removeNode('a')
		expect(graph.hasNode('Foo')).toBeFalsy()

		graph.removeNode('a')
		expect(graph.hasNode('Foo')).toBeFalsy()
	})

	it('should be able to add dependencies between nodes', () => {
		const graph = new DependencyGraph()

		graph.addNode('a')
		graph.addNode('b')
		graph.addNode('c')

		graph.addDependency('a', 'b')
		graph.addDependency('a', 'c')

		expect(graph.dependenciesOf('a')).toEqual(['b', 'c'])
	})

	it('should find entry nodes', () => {
		const graph = new DependencyGraph()

		graph.addNode('a')
		graph.addNode('b')
		graph.addNode('c')

		graph.addDependency('a', 'b')
		graph.addDependency('a', 'c')

		expect(graph.entryNodes()).toEqual(['a'])
	})

	it('should throw an error if a node does not exist and a dependency is added', () => {
		const graph = new DependencyGraph()

		graph.addNode('a')

		expect(() => {
			graph.addDependency('a', 'b')
		}).toThrow(new Error('Node does not exist: b'))
	})

	it('should detect cycles', () => {
		const graph = new DependencyGraph()

		graph.addNode('a')
		graph.addNode('b')
		graph.addNode('c')
		graph.addNode('d')

		graph.addDependency('a', 'b')
		graph.addDependency('b', 'c')
		graph.addDependency('c', 'a')
		graph.addDependency('d', 'a')

		expect(() => {
			graph.dependenciesOf('b')
		}).toThrow(new DepGraphCycleError(['b', 'c', 'a', 'b']))
	})

	it('should detect cycles in overall order', () => {
		const graph = new DependencyGraph()

		graph.addNode('a')
		graph.addNode('b')
		graph.addNode('c')
		graph.addNode('d')

		graph.addDependency('a', 'b')
		graph.addDependency('b', 'c')
		graph.addDependency('c', 'a')
		graph.addDependency('d', 'a')

		expect(() => {
			graph.overallOrder()
		}).toThrow(new DepGraphCycleError(['a', 'b', 'c', 'a']))
	})

	it('should detect cycles in overall order when all nodes have dependants (incoming edges)', () => {
		const graph = new DependencyGraph()

		graph.addNode('a')
		graph.addNode('b')
		graph.addNode('c')

		graph.addDependency('a', 'b')
		graph.addDependency('b', 'c')
		graph.addDependency('c', 'a')

		expect(() => {
			graph.overallOrder()
		}).toThrow(new DepGraphCycleError(['a', 'b', 'c', 'a']))
	})

	it(
		'should detect cycles in overall order when there are several ' +
			'disconnected subgraphs (with one that does not have a cycle',
		() => {
			const graph = new DependencyGraph()

			graph.addNode('a_1')
			graph.addNode('a_2')
			graph.addNode('b_1')
			graph.addNode('b_2')
			graph.addNode('b_3')

			graph.addDependency('a_1', 'a_2')
			graph.addDependency('b_1', 'b_2')
			graph.addDependency('b_2', 'b_3')
			graph.addDependency('b_3', 'b_1')

			expect(() => {
				graph.overallOrder()
			}).toThrow(new DepGraphCycleError(['b_1', 'b_2', 'b_3', 'b_1']))
		}
	)

	it('should retrieve dependencies and dependants in the correct order', () => {
		const graph = new DependencyGraph()

		graph.addNode('a')
		graph.addNode('b')
		graph.addNode('c')
		graph.addNode('d')

		graph.addDependency('a', 'd')
		graph.addDependency('a', 'b')
		graph.addDependency('b', 'c')
		graph.addDependency('d', 'b')

		expect(graph.dependenciesOf('a')).toEqual(['c', 'b', 'd'])
		expect(graph.dependenciesOf('b')).toEqual(['c'])
		expect(graph.dependenciesOf('c')).toEqual([])
		expect(graph.dependenciesOf('d')).toEqual(['c', 'b'])

		expect(graph.dependantsOf('a')).toEqual([])
		expect(graph.dependantsOf('b')).toEqual(['a', 'd'])
		expect(graph.dependantsOf('c')).toEqual(['a', 'd', 'b'])
		expect(graph.dependantsOf('d')).toEqual(['a'])
	})

	it('should be able to retrieve direct dependencies/dependants', () => {
		const graph = new DependencyGraph()

		graph.addNode('a')
		graph.addNode('b')
		graph.addNode('c')
		graph.addNode('d')

		graph.addDependency('a', 'd')
		graph.addDependency('a', 'b')
		graph.addDependency('b', 'c')
		graph.addDependency('d', 'b')

		expect(graph.directDependenciesOf('a')).toEqual(['d', 'b'])
		expect(graph.directDependenciesOf('b')).toEqual(['c'])
		expect(graph.directDependenciesOf('c')).toEqual([])
		expect(graph.directDependenciesOf('d')).toEqual(['b'])

		expect(graph.directDependantsOf('a')).toEqual([])
		expect(graph.directDependantsOf('b')).toEqual(['a', 'd'])
		expect(graph.directDependantsOf('c')).toEqual(['b'])
		expect(graph.directDependantsOf('d')).toEqual(['a'])
	})

	it('should be able to resolve the overall order of things', () => {
		const graph = new DependencyGraph()

		graph.addNode('a')
		graph.addNode('b')
		graph.addNode('c')
		graph.addNode('d')
		graph.addNode('e')

		graph.addDependency('a', 'b')
		graph.addDependency('a', 'c')
		graph.addDependency('b', 'c')
		graph.addDependency('c', 'd')

		expect(graph.overallOrder()).toEqual(['d', 'c', 'b', 'a', 'e'])
	})

	it('should be able to only retrieve the "leaves" in the overall order', () => {
		const graph = new DependencyGraph()

		graph.addNode('a')
		graph.addNode('b')
		graph.addNode('c')
		graph.addNode('d')
		graph.addNode('e')

		graph.addDependency('a', 'b')
		graph.addDependency('a', 'c')
		graph.addDependency('b', 'c')
		graph.addDependency('c', 'd')

		expect(graph.overallOrder(true)).toEqual(['d', 'e'])
	})

	it('should be able to give the overall order for a graph with several disconnected subgraphs', () => {
		const graph = new DependencyGraph()

		graph.addNode('a_1')
		graph.addNode('a_2')
		graph.addNode('b_1')
		graph.addNode('b_2')
		graph.addNode('b_3')

		graph.addDependency('a_1', 'a_2')
		graph.addDependency('b_1', 'b_2')
		graph.addDependency('b_2', 'b_3')

		expect(graph.overallOrder()).toEqual(['a_2', 'a_1', 'b_3', 'b_2', 'b_1'])
	})

	it('should give an empty overall order for an empty graph', () => {
		const graph = new DependencyGraph()

		expect(graph.overallOrder()).toEqual([])
	})

	it('should still work after nodes are removed', () => {
		const graph = new DependencyGraph()

		graph.addNode('a')
		graph.addNode('b')
		graph.addNode('c')
		graph.addDependency('a', 'b')
		graph.addDependency('b', 'c')

		expect(graph.dependenciesOf('a')).toEqual(['c', 'b'])

		graph.removeNode('c')

		expect(graph.dependenciesOf('a')).toEqual(['b'])
	})

	it('should clone an empty graph', () => {
		const graph = new DependencyGraph()
		expect(graph.size()).toEqual(0)
		const cloned = graph.clone()
		expect(cloned.size()).toEqual(0)

		expect(graph === cloned).toBeFalsy()
	})

	it('should clone a non-empty graph', () => {
		const graph = new DependencyGraph()

		graph.addNode('a')
		graph.addNode('b')
		graph.addNode('c')
		graph.addDependency('a', 'b')
		graph.addDependency('b', 'c')

		const cloned = graph.clone()

		expect(graph === cloned).toBeFalsy()
		expect(cloned.hasNode('a')).toBeTruthy()
		expect(cloned.hasNode('b')).toBeTruthy()
		expect(cloned.hasNode('c')).toBeTruthy()
		expect(cloned.dependenciesOf('a')).toEqual(['c', 'b'])
		expect(cloned.dependantsOf('c')).toEqual(['a', 'b'])

		// Changes to the original graph shouldn't affect the clone
		graph.removeNode('c')
		expect(graph.dependenciesOf('a')).toEqual(['b'])
		expect(cloned.dependenciesOf('a')).toEqual(['c', 'b'])

		graph.addNode('d')
		graph.addDependency('b', 'd')
		expect(graph.dependenciesOf('a')).toEqual(['d', 'b'])
		expect(cloned.dependenciesOf('a')).toEqual(['c', 'b'])
	})

	it('should only be a shallow clone', () => {
		const graph = new DependencyGraph<{ a: number }>()

		const data = { a: 42 }
		graph.addNode('a', data)

		const cloned = graph.clone()
		expect(graph === cloned).toBeFalsy()
		expect(graph.getNodeData('a') === cloned.getNodeData('a')).toBeTruthy()

		graph.getNodeData('a').a = 43
		expect(cloned.getNodeData('a').a).toBe(43)

		cloned.setNodeData('a', { a: 42 })
		expect(cloned.getNodeData('a').a).toBe(42)
		expect(graph.getNodeData('a') === cloned.getNodeData('a')).toBeFalsy()
	})
})

describe('DepGraph Performance', () => {
	it('should not exceed max call stack with a very deep graph', () => {
		const g = new DependencyGraph()
		const expected = []
		for (let i = 0; i < 100_000; i++) {
			const istr = i.toString()
			g.addNode(istr)
			expected.push(istr)
			if (i > 0) {
				g.addDependency(istr, (i - 1).toString())
			}
		}

		const order = g.overallOrder()
		expect(order).toEqual(expected)
	})

	it('should run an a reasonable amount of time for a very large graph', () => {
		const randInt = function (min: number, max: number) {
			return Math.floor(Math.random() * (max - min + 1)) + min
		}

		const g = new DependencyGraph()
		const nodes = []
		// Create a graph with 100000 nodes in it with 10 random connections to
		// lower numbered nodes
		for (let i = 0; i < 100_000; i++) {
			nodes.push(i.toString())
			g.addNode(i.toString())
			for (let j = 0; j < 10; j++) {
				const dep = randInt(0, i)
				if (i !== dep) {
					g.addDependency(i.toString(), dep.toString())
				}
			}
		}

		const start = Date.now()
		g.overallOrder()
		const end = Date.now()
		expect(start - end).toBeLessThan(1000)
	})
})

describe('DepGraphCycleError', () => {
	it('should have a message', () => {
		const error = new DepGraphCycleError(['a', 'b', 'c', 'a'])
		expect(error.message).toEqual('Dependency Cycle Found: a -> b -> c -> a')
	})

	it('should have a cyclePath', () => {
		const cyclePath = ['a', 'b', 'c', 'a']
		const error = new DepGraphCycleError(cyclePath)
		expect(error.cyclePath).toEqual(cyclePath)
	})
})
