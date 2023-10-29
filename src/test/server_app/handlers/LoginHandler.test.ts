import { Authorizer } from '../../../app/server_app/auth/Authorizer'
import { LoginHandler } from '../../../app/server_app/handlers/LoginHandler'
import { IncomingMessage, ServerResponse } from 'http'
import {
	HTTP_CODES,
	HTTP_METHODS,
} from '../../../app/server_app/model/ServerModel'
import { Account } from '../../../app/server_app/model/AuthModel'

const getRequestBodyMock = jest.fn()

jest.mock('../../../app/server_app/utils/Utils', () => ({
	getRequestBody: () => getRequestBodyMock(),
}))

describe('LoginHandler suite test', () => {
	let sut: LoginHandler

	const request = {
		method: undefined,
	}

	const responseMock = {
		statusCode: 0,
		write: jest.fn(),
		writeHead: jest.fn(),
	}

	const authorizerMock = {
		login: jest.fn(),
	}

	const someAccount: Account = {
		id: '',
		password: 'somePassword',
		userName: 'someUserName',
	}

	const someToken = 'asvf3434ver34'

	beforeEach(() => {
		sut = new LoginHandler(
			request as IncomingMessage,
			responseMock as any as ServerResponse,
			authorizerMock as any as Authorizer
		)
	})

	afterEach(() => {
		jest.clearAllMocks()
	})

	it('should login valid accounts in requests', async () => {
		request.method = HTTP_METHODS.POST
		getRequestBodyMock.mockResolvedValueOnce(someAccount)
		authorizerMock.login.mockResolvedValueOnce(someToken)

		await sut.handleRequest()

		expect(responseMock.statusCode).toBe(HTTP_CODES.CREATED)
		expect(responseMock.write).toBeCalledWith(
			JSON.stringify({ token: someToken })
		)
		expect(responseMock.writeHead).toBeCalledWith(HTTP_CODES.CREATED, {
			'Content-Type': 'application/json',
		})
	})

	it('should reject the login for user do not registered', async () => {
		request.method = HTTP_METHODS.POST
		getRequestBodyMock.mockResolvedValueOnce(someAccount)
		authorizerMock.login()

		await sut.handleRequest()

		expect(responseMock.statusCode).toBe(HTTP_CODES.NOT_fOUND)
		expect(responseMock.write).toBeCalledWith(
			JSON.stringify('wrong username or password')
		)
	})

	it('should do nothing if user or password is not provided', async () => {
		request.method = HTTP_METHODS.POST
		getRequestBodyMock.mockResolvedValueOnce({})

		await sut.handleRequest()

		expect(responseMock.statusCode).toBe(HTTP_CODES.BAD_REQUEST)
		expect(responseMock.writeHead).toBeCalledWith(HTTP_CODES.BAD_REQUEST, {
			'Content-Type': 'application/json',
		})
		expect(responseMock.write).toBeCalledWith(
			JSON.stringify('userName and password required')
		)
	})

	it('should do nothing for different to POST HTTP method', async () => {
		request.method = HTTP_METHODS.GET

		await sut.handleRequest()

		expect(getRequestBodyMock).not.toBeCalled()
		expect(responseMock.write).not.toBeCalled()
		expect(responseMock.writeHead).not.toBeCalled()
	})
})
