import 'jest'
import { DependencyGraph, DepGraphCycleError } from '../index'

describe("DepGraph", function () {
	it("should be able to add/remove nodes", function () {
		var graph = new DependencyGraph();

		graph.addNode("Foo");
		graph.addNode("Bar");

		expect(graph.hasNode("Foo")).toBeTruthy();
		expect(graph.hasNode("Bar")).toBeTruthy();
		expect(graph.hasNode("NotThere")).toBeFalsy();

		graph.removeNode("Bar");

		expect(graph.hasNode("Bar")).toBeFalsy();
	});

	it("should calculate its size", function () {
		var graph = new DependencyGraph();

		expect(graph.size()).toBe(0);

		graph.addNode("Foo");
		graph.addNode("Bar");

		expect(graph.size()).toBe(2);

		graph.removeNode("Bar");

		expect(graph.size()).toBe(1);
	});

	it("should treat the node data parameter as optional and use the node name as data if node data was not given", function () {
		var graph = new DependencyGraph();

		graph.addNode("Foo");

		expect(graph.getNodeData("Foo")).toBe("Foo");
	});

	it("should be able to associate a node name with data on node add", function () {
		var graph = new DependencyGraph();

		graph.addNode("Foo", "data");

		expect(graph.getNodeData("Foo")).toBe("data");
	});

	it("should return true when using hasNode with a node which has falsy data", function () {
		var graph = new DependencyGraph();

		var falsyData = ["", 0, null, undefined, false];
		graph.addNode("Foo");

		falsyData.forEach(function (data) {
			graph.setNodeData("Foo", data);

			expect(graph.hasNode("Foo")).toBeTruthy();

			// Just an extra check to make sure that the saved data is correct
			expect(graph.getNodeData("Foo")).toBe(data);
		});
	});

	it("should be able to set data after a node was added", function () {
		var graph = new DependencyGraph();

		graph.addNode("Foo", "data");
		graph.setNodeData("Foo", "data2");

		expect(graph.getNodeData("Foo")).toBe("data2");
	});

	it("should throw an error if we try to set data for a non-existing node", function () {
		var graph = new DependencyGraph();

		expect(function () {
			graph.setNodeData("Foo", "data");
		}).toThrow(new Error("Node does not exist: Foo"));
	});

	it("should throw an error if the node does not exists and we try to get data", function () {
		var graph = new DependencyGraph();

		expect(function () {
			graph.getNodeData("Foo");
		}).toThrow(new Error("Node does not exist: Foo"));
	});

	it("should do nothing if creating a node that already exists", function () {
		var graph = new DependencyGraph();

		graph.addNode("a");
		graph.addNode("b");

		graph.addDependency("a", "b");

		graph.addNode("a");

		expect(graph.dependenciesOf("a")).toEqual(["b"]);
	});

	it("should do nothing if removing a node that does not exist", function () {
		var graph = new DependencyGraph();

		graph.addNode("a");
		expect(graph.hasNode("a")).toBeTruthy();

		graph.removeNode("a");
		expect(graph.hasNode("Foo")).toBeFalsy();

		graph.removeNode("a");
		expect(graph.hasNode("Foo")).toBeFalsy();
	});

	it("should be able to add dependencies between nodes", function () {
		var graph = new DependencyGraph();

		graph.addNode("a");
		graph.addNode("b");
		graph.addNode("c");

		graph.addDependency("a", "b");
		graph.addDependency("a", "c");

		expect(graph.dependenciesOf("a")).toEqual(["b", "c"]);
	});

	it("should find entry nodes", function () {
		var graph = new DependencyGraph();

		graph.addNode("a");
		graph.addNode("b");
		graph.addNode("c");

		graph.addDependency("a", "b");
		graph.addDependency("a", "c");

		expect(graph.entryNodes()).toEqual(["a"]);
	});

	it("should throw an error if a node does not exist and a dependency is added", function () {
		var graph = new DependencyGraph();

		graph.addNode("a");

		expect(function () {
			graph.addDependency("a", "b");
		}).toThrow(new Error("Node does not exist: b"));
	});

	it("should detect cycles", function () {
		var graph = new DependencyGraph();

		graph.addNode("a");
		graph.addNode("b");
		graph.addNode("c");
		graph.addNode("d");

		graph.addDependency("a", "b");
		graph.addDependency("b", "c");
		graph.addDependency("c", "a");
		graph.addDependency("d", "a");

		expect(function () {
			graph.dependenciesOf("b");
		}).toThrow(new DepGraphCycleError(["b", "c", "a", "b"]));
	});


	it("should detect cycles in overall order", function () {
		var graph = new DependencyGraph();

		graph.addNode("a");
		graph.addNode("b");
		graph.addNode("c");
		graph.addNode("d");

		graph.addDependency("a", "b");
		graph.addDependency("b", "c");
		graph.addDependency("c", "a");
		graph.addDependency("d", "a");

		expect(function () {
			graph.overallOrder();
		}).toThrow(new DepGraphCycleError(["a", "b", "c", "a"]));
	});

	it("should detect cycles in overall order when all nodes have dependants (incoming edges)", function () {
		var graph = new DependencyGraph();

		graph.addNode("a");
		graph.addNode("b");
		graph.addNode("c");

		graph.addDependency("a", "b");
		graph.addDependency("b", "c");
		graph.addDependency("c", "a");

		expect(function () {
			graph.overallOrder();
		}).toThrow(new DepGraphCycleError(["a", "b", "c", "a"]));
	});

	it(
		"should detect cycles in overall order when there are several " +
		"disconnected subgraphs (with one that does not have a cycle",
		function () {
			var graph = new DependencyGraph();

			graph.addNode("a_1");
			graph.addNode("a_2");
			graph.addNode("b_1");
			graph.addNode("b_2");
			graph.addNode("b_3");

			graph.addDependency("a_1", "a_2");
			graph.addDependency("b_1", "b_2");
			graph.addDependency("b_2", "b_3");
			graph.addDependency("b_3", "b_1");

			expect(function () {
				graph.overallOrder();
			}).toThrow(
				new DepGraphCycleError(["b_1", "b_2", "b_3", "b_1"])
			);
		}
	);

	it("should retrieve dependencies and dependants in the correct order", function () {
		var graph = new DependencyGraph();

		graph.addNode("a");
		graph.addNode("b");
		graph.addNode("c");
		graph.addNode("d");

		graph.addDependency("a", "d");
		graph.addDependency("a", "b");
		graph.addDependency("b", "c");
		graph.addDependency("d", "b");

		expect(graph.dependenciesOf("a")).toEqual(["c", "b", "d"]);
		expect(graph.dependenciesOf("b")).toEqual(["c"]);
		expect(graph.dependenciesOf("c")).toEqual([]);
		expect(graph.dependenciesOf("d")).toEqual(["c", "b"]);

		expect(graph.dependantsOf("a")).toEqual([]);
		expect(graph.dependantsOf("b")).toEqual(["a", "d"]);
		expect(graph.dependantsOf("c")).toEqual(["a", "d", "b"]);
		expect(graph.dependantsOf("d")).toEqual(["a"]);
	});

	it("should be able to retrieve direct dependencies/dependants", function () {
		var graph = new DependencyGraph();

		graph.addNode("a");
		graph.addNode("b");
		graph.addNode("c");
		graph.addNode("d");

		graph.addDependency("a", "d");
		graph.addDependency("a", "b");
		graph.addDependency("b", "c");
		graph.addDependency("d", "b");

		expect(graph.directDependenciesOf("a")).toEqual(["d", "b"]);
		expect(graph.directDependenciesOf("b")).toEqual(["c"]);
		expect(graph.directDependenciesOf("c")).toEqual([]);
		expect(graph.directDependenciesOf("d")).toEqual(["b"]);

		expect(graph.directDependantsOf("a")).toEqual([]);
		expect(graph.directDependantsOf("b")).toEqual(["a", "d"]);
		expect(graph.directDependantsOf("c")).toEqual(["b"]);
		expect(graph.directDependantsOf("d")).toEqual(["a"]);
	});

	it("should be able to resolve the overall order of things", function () {
		var graph = new DependencyGraph();

		graph.addNode("a");
		graph.addNode("b");
		graph.addNode("c");
		graph.addNode("d");
		graph.addNode("e");

		graph.addDependency("a", "b");
		graph.addDependency("a", "c");
		graph.addDependency("b", "c");
		graph.addDependency("c", "d");

		expect(graph.overallOrder()).toEqual(["d", "c", "b", "a", "e"]);
	});

	it('should be able to only retrieve the "leaves" in the overall order', function () {
		var graph = new DependencyGraph();

		graph.addNode("a");
		graph.addNode("b");
		graph.addNode("c");
		graph.addNode("d");
		graph.addNode("e");

		graph.addDependency("a", "b");
		graph.addDependency("a", "c");
		graph.addDependency("b", "c");
		graph.addDependency("c", "d");

		expect(graph.overallOrder(true)).toEqual(["d", "e"]);
	});

	it("should be able to give the overall order for a graph with several disconnected subgraphs", function () {
		var graph = new DependencyGraph();

		graph.addNode("a_1");
		graph.addNode("a_2");
		graph.addNode("b_1");
		graph.addNode("b_2");
		graph.addNode("b_3");

		graph.addDependency("a_1", "a_2");
		graph.addDependency("b_1", "b_2");
		graph.addDependency("b_2", "b_3");

		expect(graph.overallOrder()).toEqual(["a_2", "a_1", "b_3", "b_2", "b_1"]);
	});

	it("should give an empty overall order for an empty graph", function () {
		var graph = new DependencyGraph();

		expect(graph.overallOrder()).toEqual([]);
	});

	it("should still work after nodes are removed", function () {
		var graph = new DependencyGraph();

		graph.addNode("a");
		graph.addNode("b");
		graph.addNode("c");
		graph.addDependency("a", "b");
		graph.addDependency("b", "c");

		expect(graph.dependenciesOf("a")).toEqual(["c", "b"]);

		graph.removeNode("c");

		expect(graph.dependenciesOf("a")).toEqual(["b"]);
	});

	it("should clone an empty graph", function () {
		var graph = new DependencyGraph();
		expect(graph.size()).toEqual(0);
		var cloned = graph.clone();
		expect(cloned.size()).toEqual(0);

		expect(graph === cloned).toBeFalsy();
	});

	it("should clone a non-empty graph", function () {
		var graph = new DependencyGraph();

		graph.addNode("a");
		graph.addNode("b");
		graph.addNode("c");
		graph.addDependency("a", "b");
		graph.addDependency("b", "c");

		var cloned = graph.clone();

		expect(graph === cloned).toBeFalsy();
		expect(cloned.hasNode("a")).toBeTruthy();
		expect(cloned.hasNode("b")).toBeTruthy();
		expect(cloned.hasNode("c")).toBeTruthy();
		expect(cloned.dependenciesOf("a")).toEqual(["c", "b"]);
		expect(cloned.dependantsOf("c")).toEqual(["a", "b"]);

		// Changes to the original graph shouldn't affect the clone
		graph.removeNode("c");
		expect(graph.dependenciesOf("a")).toEqual(["b"]);
		expect(cloned.dependenciesOf("a")).toEqual(["c", "b"]);

		graph.addNode("d");
		graph.addDependency("b", "d");
		expect(graph.dependenciesOf("a")).toEqual(["d", "b"]);
		expect(cloned.dependenciesOf("a")).toEqual(["c", "b"]);
	});

	it("should only be a shallow clone", function () {
		var graph = new DependencyGraph();

		var data = { a: 42 };
		graph.addNode("a", data);

		var cloned = graph.clone();
		expect(graph === cloned).toBeFalsy();
		expect(graph.getNodeData("a") === cloned.getNodeData("a")).toBeTruthy();

		graph.getNodeData("a").a = 43;
		expect(cloned.getNodeData("a").a).toBe(43);

		cloned.setNodeData("a", { a: 42 });
		expect(cloned.getNodeData("a").a).toBe(42);
		expect(graph.getNodeData("a") === cloned.getNodeData("a")).toBeFalsy();
	});
});

describe("DepGraph Performance", function () {
	it("should not exceed max call stack with a very deep graph", function () {
		var g = new DependencyGraph();
		var expected = [];
		for (var i = 0; i < 100000; i++) {
			var istr = i.toString();
			g.addNode(istr);
			expected.push(istr);
			if (i > 0) {
				g.addDependency(istr, (i - 1).toString());
			}
		}
		var order = g.overallOrder();
		expect(order).toEqual(expected);
	});

	it("should run an a reasonable amount of time for a very large graph", function () {
		var randInt = function (min: number, max: number) {
			return Math.floor(Math.random() * (max - min + 1)) + min;
		};
		var g = new DependencyGraph();
		var nodes = [];
		// Create a graph with 100000 nodes in it with 10 random connections to
		// lower numbered nodes
		for (var i = 0; i < 100000; i++) {
			nodes.push(i.toString());
			g.addNode(i.toString());
			for (var j = 0; j < 10; j++) {
				var dep = randInt(0, i);
				if (i !== dep) {
					g.addDependency(i.toString(), dep.toString());
				}
			}
		}
		var start = new Date().getTime();
		g.overallOrder();
		var end = new Date().getTime();
		expect(start - end).toBeLessThan(1000);
	});
});

describe("DepGraphCycleError", function () {
	it("should have a message", function () {
		const err = new DepGraphCycleError(["a", "b", "c", "a"]);
		expect(err.message).toEqual("Dependency Cycle Found: a -> b -> c -> a");
	});

	it("should have a cyclePath", function () {
		const cyclePath = ["a", "b", "c", "a"];
		const err = new DepGraphCycleError(cyclePath);
		expect(err.cyclePath).toEqual(cyclePath);
	});
});
