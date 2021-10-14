import "reflect-metadata"
import {ServiceMethod, ServiceEvent} from '../decorators'
import {Metadata} from "../../metadata/Metadata";
describe('Inteface decorators', () => {
	describe('@ServiceMethod', () => {
		it('should inject METHOD_MAP into constructor metadata', () => {
			class oneMethodClass {
				@ServiceMethod()
				asd() {}
			}
			const methodMap = Reflect.getMetadata(Metadata.METADATA_SERVICE_MAP, oneMethodClass.prototype) as Map<string, string>
			expect(typeof methodMap).toBe('object')
			expect(methodMap.size).toBe(1)
		})
		it('should use the method name as externalName in MERHOD_MAP', () => {
			class oneMethodClass {
				@ServiceMethod()
				asd() {}
			}
			const methodMap = Reflect.getMetadata(Metadata.METADATA_SERVICE_MAP, oneMethodClass.prototype) as Map<string, string>
			expect(typeof methodMap).toBe('object')
			expect(methodMap.size).toBe(1)
			expect(methodMap.get('asd')).toBe('asd')
		})
		it('should use the provided name as externalName in MERHOD_MAP', () => {
			class oneMethodClass {
				@ServiceMethod({ name: 'DifferentName' })
				asd() {}
			}
			const methodMap = Reflect.getMetadata(Metadata.METADATA_SERVICE_MAP, oneMethodClass.prototype) as Map<string, string>
			expect(typeof methodMap).toBe('object')
			expect(methodMap.size).toBe(1)
			expect(methodMap.get('DifferentName')).toBe('asd')
		})
		it('should have every method in the METHOD_MAP', () => {
			class oneMethodClass {
				@ServiceMethod()
				hello() {}
				@ServiceMethod()
				asd() {}
				@ServiceMethod()
				kek() {}
				@ServiceMethod()
				lol() {}
			}
			const methodMap = Reflect.getMetadata(Metadata.METADATA_SERVICE_MAP, oneMethodClass.prototype) as Map<string, string>
			expect(typeof methodMap).toBe('object')
			expect(methodMap.size).toBe(4)
		})
	})
	describe('@ServiceEvent', () => {
		it('should inject EVENT_MAP into constructor metadata', () => {
			class oneEventClass {
				@ServiceEvent()
				asd() {}
			}
			const eventMap = Reflect.getMetadata(Metadata.METADATA_EVENT_MAP, oneEventClass.prototype) as Map<string, string>
			expect(typeof eventMap).toBe('object')
			expect(eventMap.size).toBe(1)
		})
		it('should use the event name as externalName in EVENT_MAP', () => {
			class oneEventClass {
				@ServiceEvent()
				ping() {}
			}
			const eventMap = Reflect.getMetadata(Metadata.METADATA_EVENT_MAP, oneEventClass.prototype) as Map<string, string>
			expect(typeof eventMap).toBe('object')
			expect(eventMap.size).toBe(1)
			expect(eventMap.get('ping')).toBe('ping')
		})
		it('should use a different name as externalName in EVENT_MAP', () => {
			class oneEventClass {
				@ServiceEvent({ name: 'AnotherName' })
				ping() {}
			}
			const eventMap = Reflect.getMetadata(Metadata.METADATA_EVENT_MAP, oneEventClass.prototype) as Map<string, string>
			expect(typeof eventMap).toBe('object')
			expect(eventMap.size).toBe(1)
			expect(eventMap.get('AnotherName')).toBe('ping')
		})
		it('should inject every event to the EVENT_MAP', () => {
			class oneEventClass {
				@ServiceEvent()
				ping() {}
				@ServiceEvent()
				pong() {}
				@ServiceEvent()
				lol() {}
			}
			const eventMap = Reflect.getMetadata(Metadata.METADATA_EVENT_MAP, oneEventClass.prototype) as Map<string, string>
			expect(typeof eventMap).toBe('object')
			expect(eventMap.size).toBe(3)
		})
	})
})
