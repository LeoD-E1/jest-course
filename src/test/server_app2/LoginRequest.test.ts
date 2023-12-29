import { RequestTestWrapper } from './test_utils/RequestTestWrapper'
import { ResponseTestWrapper } from './test_utils/ResponseTestWrapper'
import { DataBase } from '../../app/server_app/data/DataBase'
import {
	HTTP_CODES,
	HTTP_METHODS,
} from '../../app/server_app/model/ServerModel'
import { Server } from '../../app/server_app/server/Server'
import { Account } from '../../app/server_app/model/AuthModel'

jest.mock('../../app/server_app/data/DataBase')

const requestWrapper = new RequestTestWrapper()
const responseWrapper = new ResponseTestWrapper()

const fakeServer = {
	listen: () => {},
	close: () => {},
}

jest.mock('http', () => ({
	createServer: (cb: Function) => {
		cb(requestWrapper, responseWrapper)
		return fakeServer
	},
}))

const someAccount: Account = {
	id: '',
	password: 'somePassword',
	userName: 'someUserName',
}

const someToken = '1234'

const jsonHeader = { 'Content-Type': 'application/json' }

describe('LoginHandler test suite', () => {
	const getBySpy = jest.spyOn(DataBase.prototype, 'getBy')
	const insertSpy = jest.spyOn(DataBase.prototype, 'insert')

	beforeEach(() => {
		requestWrapper.headers['user-agent'] = 'jest tests'
	})

	afterEach(() => {
		requestWrapper.clearFileds()
		responseWrapper.clearFields()
		jest.clearAllMocks()
	})

	it('should return a token, indicator that i already have logged in', async () => {
		requestWrapper.method = HTTP_METHODS.POST
		requestWrapper.body = someAccount
		requestWrapper.url = 'localhost:8080/login'
		getBySpy.mockResolvedValueOnce(someAccount)
		insertSpy.mockResolvedValueOnce(someToken)

		await new Server().startServer()
		await new Promise(process.nextTick) // this solves timing issues

		expect(responseWrapper.statusCode).toBe(HTTP_CODES.CREATED)
		expect(responseWrapper.headers).toContainEqual(jsonHeader)
		expect(responseWrapper.body).toEqual({
			token: someToken,
		})
	})

	it('should reject by user not found', async () => {
		requestWrapper.method = HTTP_METHODS.POST
		requestWrapper.body = someAccount
		requestWrapper.url = 'localhost:8080/login'
		getBySpy.mockResolvedValueOnce(someAccount)

		await new Server().startServer()
		await new Promise(process.nextTick)

		expect(responseWrapper.statusCode).toBe(HTTP_CODES.NOT_fOUND)
		expect(responseWrapper.body).toEqual('wrong username or password')
	})

	it('should reject by user not provided', async () => {
		requestWrapper.method = HTTP_METHODS.POST
		requestWrapper.body = {}
		requestWrapper.url = 'localhost:8080/login'
		getBySpy.mockResolvedValueOnce(null)

		await new Server().startServer()
		await new Promise(process.nextTick)

		expect(responseWrapper.statusCode).toBe(HTTP_CODES.BAD_REQUEST)
		expect(responseWrapper.headers).toContainEqual(jsonHeader)
		expect(responseWrapper.body).toEqual('userName and password required')
	})

	it('should do nothing for invalid http method', async () => {
		requestWrapper.method = HTTP_METHODS.GET
		requestWrapper.url = 'localhost:8080/login'

		await new Server().startServer()
		await new Promise(process.nextTick)

		expect(responseWrapper.statusCode).toBeUndefined()
		expect(responseWrapper.body).toBeUndefined()
	})
})
