import { getRequestBody } from '../../../app/server_app/utils/Utils'
import type { IncomingMessage } from 'http'

const requestMock = {
	on: jest.fn(),
}

const someObject = {
	name: 'Leonardo',
	age: 23,
	country: 'Argentina',
}

const someObjAsString = JSON.stringify(someObject)

describe('getRequestBody test suite', () => {
	it('should return object for valid JSON', async () => {
		requestMock.on.mockImplementation((event, cb) => {
			if (event === 'data') {
				cb(someObjAsString)
			} else {
				cb()
			}
		})

		const actual = await getRequestBody(requestMock as any as IncomingMessage)

		expect(actual).toEqual(someObject)
	})

	it('should throw an error for invalid JSON', async () => {
		requestMock.on.mockImplementation((event, cb) => {
			if (event === 'data') {
				cb('a' + someObjAsString)
			} else {
				cb()
			}
		})

		await expect(getRequestBody(requestMock as any)).rejects.toThrow(
			'Unexpected token a in JSON at position 0'
		)
	})

	it('should throw an error for unexpected error', async () => {
		const someError = new Error('Something went wrong!')
		requestMock.on.mockImplementation((event, cb) => {
			if (event === 'error') {
				cb(someError)
			}
		})

		await expect(getRequestBody(requestMock as any)).rejects.toThrow(
			someError.message
		)
	})
})
