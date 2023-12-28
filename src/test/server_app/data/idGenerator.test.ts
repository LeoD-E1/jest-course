import { generateRandomId } from '../../../app/server_app/data/IdGenerator'

describe('idGenerator test suite', () => {
	it('should return a random string', () => {
		const randomId = generateRandomId()
		expect(randomId.length).toBe(20)
	})
})
