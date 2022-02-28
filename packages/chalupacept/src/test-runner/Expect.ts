interface NumberComparer {
	(value: number | Date, message?: string): Assertion
}

interface TypeComparison {
	(type: string, message?: string): Assertion
	instanceof: InstanceOf
	instanceOf: InstanceOf
}

interface InstanceOf {
	(constructor: any, message?: string): Assertion
}

interface CloseTo {
	(expected: number, delta: number, message?: string): Assertion
}

interface Nested {
	include: Include
	includes: Include
	contain: Include
	contains: Include
	property: Property
	members: Members
}

interface Own {
	include: Include
	includes: Include
	contain: Include
	contains: Include
	property: Property
}

interface Deep extends KeyFilter {
	be: Assertion
	equal: Equal
	equals: Equal
	eq: Equal
	include: Include
	includes: Include
	contain: Include
	contains: Include
	property: Property
	ordered: Ordered
	nested: Nested
	oneOf: OneOf
	own: Own
}

interface Ordered {
	members: Members
}

interface KeyFilter {
	keys: Keys
	members: Members
}

interface Equal {
	(value: any, message?: string): Assertion
}

interface Property {
	(name: string | symbol, value: any, message?: string): Assertion
	(name: string | symbol, message?: string): Assertion
}

interface OwnPropertyDescriptor {
	(name: string | symbol, descriptor: PropertyDescriptor, message?: string): Assertion
	(name: string | symbol, message?: string): Assertion
}

interface Length extends LanguageChains, NumericComparison {
	(length: number, message?: string): Assertion
}

interface Include {
	(value: any, message?: string): Assertion
	keys: Keys
	deep: Deep
	ordered: Ordered
	members: Members
	any: KeyFilter
	all: KeyFilter
	oneOf: OneOf
}

interface OneOf {
	(list: ReadonlyArray<unknown>, message?: string): Assertion
}

interface Match {
	(regexp: RegExp, message?: string): Assertion
}

interface Keys {
	(...keys: string[]): Assertion
	(keys: ReadonlyArray<any> | Object): Assertion
}

interface Throw {
	(expected?: string | RegExp, message?: string): Assertion
	(constructor: Error | Function, expected?: string | RegExp, message?: string): Assertion
}

interface RespondTo {
	(method: string, message?: string): Assertion
}

interface Satisfy {
	(matcher: Function, message?: string): Assertion
}

interface Members {
	(set: ReadonlyArray<any>, message?: string): Assertion
}

interface PropertyChange {
	(object: Object, property?: string, message?: string): DeltaAssertion
}

interface DeltaAssertion extends Assertion {
	by(delta: number, message?: string): Assertion
}

interface LanguageChains {
	to: Assertion
	be: Assertion
	been: Assertion
	is: Assertion
	that: Assertion
	which: Assertion
	and: Assertion
	has: Assertion
	have: Assertion
	with: Assertion
	at: Assertion
	of: Assertion
	same: Assertion
	but: Assertion
	does: Assertion
}

interface NumericComparison {
	above: NumberComparer
	gt: NumberComparer
	greaterThan: NumberComparer
	least: NumberComparer
	gte: NumberComparer
	greaterThanOrEqual: NumberComparer
	below: NumberComparer
	lt: NumberComparer
	lessThan: NumberComparer
	most: NumberComparer
	lte: NumberComparer
	lessThanOrEqual: NumberComparer
	within(start: number, finish: number, message?: string): Assertion
	within(start: Date, finish: Date, message?: string): Assertion
}

export interface Assertion extends LanguageChains, NumericComparison, TypeComparison {
	not: Assertion
	deep: Deep
	ordered: Ordered
	nested: Nested
	own: Own
	any: KeyFilter
	all: KeyFilter
	a: Assertion
	an: Assertion
	include: Include
	includes: Include
	contain: Include
	contains: Include
	ok: Assertion
	true: Assertion
	false: Assertion
	null: Assertion
	undefined: Assertion
	NaN: Assertion
	exist: Assertion
	empty: Assertion
	arguments: Assertion
	Arguments: Assertion
	finite: Assertion
	equal: Equal
	equals: Equal
	eq: Equal
	eql: Equal
	eqls: Equal
	property: Property
	ownProperty: Property
	haveOwnProperty: Property
	ownPropertyDescriptor: OwnPropertyDescriptor
	haveOwnPropertyDescriptor: OwnPropertyDescriptor
	length: Length
	lengthOf: Length
	match: Match
	matches: Match
	string(string: string, message?: string): Assertion
	keys: Keys
	key(string: string): Assertion
	throw: Throw
	throws: Throw
	Throw: Throw
	respondTo: RespondTo
	respondsTo: RespondTo
	itself: Assertion
	satisfy: Satisfy
	satisfies: Satisfy
	closeTo: CloseTo
	approximately: CloseTo
	members: Members
	increase: PropertyChange
	increases: PropertyChange
	decrease: PropertyChange
	decreases: PropertyChange
	change: PropertyChange
	changes: PropertyChange
	extensible: Assertion
	sealed: Assertion
	frozen: Assertion
	oneOf: OneOf
}

export type Operator = string // "==" | "===" | ">" | ">=" | "<" | "<=" | "!=" | "!==";

export interface Expect {
	(value: any, message?: string): Assertion
	fail(message?: string): never
	fail(actual: any, expected: any, message?: string, operator?: Operator): never
}
