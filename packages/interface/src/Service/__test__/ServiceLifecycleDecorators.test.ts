import 'reflect-metadata'
import { Service, PostInit, PreDestroy } from '../decorators'
import { Metadata } from '../../metadata/Metadata'

describe('Service lifecycle decorators', () => {
	describe('@PostInit decorator', () => {
		it('should assign the correct metadata', () => {
			@Service()
			class ToBeDecorated {
				@PostInit()
				init() {}
			}
			const hasPostInit = Reflect.hasMetadata(Metadata.ServiceLifecycle.PostInit, ToBeDecorated.prototype)
			expect(hasPostInit).toBeTruthy()
			const postInitMethodName = Reflect.getMetadata(Metadata.ServiceLifecycle.PostInit, ToBeDecorated.prototype)
			expect(postInitMethodName).toBe('init')
		})
	})
	describe('@PreDestroy decorator', () => {
		it('should assign the correct metadata', () => {
			@Service()
			class ToBeDecorated {
				@PreDestroy()
				destroy() {}
			}
			const hasPreDestroy = Reflect.hasMetadata(Metadata.ServiceLifecycle.PreDestroy, ToBeDecorated.prototype)
			expect(hasPreDestroy).toBeTruthy()
			const preDestroyMethodName = Reflect.getMetadata(
				Metadata.ServiceLifecycle.PreDestroy,
				ToBeDecorated.prototype
			)
			expect(preDestroyMethodName).toBe('destroy')
		})
	})
})
