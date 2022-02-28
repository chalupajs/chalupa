import { Case } from '../../src/index'

Case('ExampleCase', ({ describe, it, I }) => {
	describe('Example Test', () => {
		it('should asd', () => {
			I.say('asd')
			I.expect(false).to.be.true
		})
	})
})
