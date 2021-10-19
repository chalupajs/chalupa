import 'reflect-metadata'
import { NetworkEvent } from '../decorators'
import { Metadata } from '../../metadata/Metadata'

describe('@NetworkEvent decorator', () => {
	describe('entityAppeared', () => {
		it('should assign the correct metadata when given in name', () => {
			class ToBeDecorated {
				@NetworkEvent({ name: 'entityAppeared' })
				asd() {}
			}
			const hasEntityAppeared = Reflect.hasMetadata(Metadata.NetworkEvent.EntityAppeared, ToBeDecorated.prototype)
			expect(hasEntityAppeared).toBeTruthy()
			const entityAppearedMethodName = Reflect.getMetadata(
				Metadata.NetworkEvent.EntityAppeared,
				ToBeDecorated.prototype
			)
			expect(entityAppearedMethodName).toBe('asd')
		})
	})
})
