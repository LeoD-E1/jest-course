import { Authorizer } from '../../../app/server_app/auth/Authorizer'
import { SessionTokenDataAccess } from '../../../app/server_app/data/SessionTokenDataAccess'
import { UserCredentialsDataAccess } from '../../../app/server_app/data/UserCredentialsDataAccess'

// SessionTokenDataAccess mocks
const isValidTokenMock = jest.fn()
const generateTokenMock = jest.fn()
const invalidateTokenMock = jest.fn()

jest.mock('../../../app/server_app/data/SessionTokenDataAccess', () => {
	return {
		SessionTokenDataAccess: jest.fn().mockImplementation(() => {
			return {
				isValidToken: isValidTokenMock,
				generateToken: generateTokenMock,
				invalidateToken: invalidateTokenMock,
			}
		}),
	}
})

// UserCredentialsDataAccess mocks
const AddUserMock = jest.fn()
const getUserByUserNameMock = jest.fn()

jest.mock('../../../app/server_app/data/UserCredentialsDataAccess', () => {
	return {
		UserCredentialsDataAccess: jest.fn().mockImplementation(() => {
			return {
				getUserByUserName: getUserByUserNameMock,
				addUser: AddUserMock,
			}
		}),
	}
})

describe('Authorizer test suite', () => {
	let sut: Authorizer
	const someID = 'someToken'
	const somePassword = 'somePassword'
	const someUserName = 'someUserName'

	beforeEach(() => {
		sut = new Authorizer()
		expect(SessionTokenDataAccess).toBeCalledTimes(1)
		expect(UserCredentialsDataAccess).toBeCalledTimes(1)
	})

	afterEach(() => {
		jest.clearAllMocks()
	})

	it('should validate token', async () => {
		isValidTokenMock.mockResolvedValueOnce(false)
		const actual = await sut.validateToken(someID)
		expect(actual).toBe(false)
	})

	it('should return user id for new registered user', async () => {
		AddUserMock.mockResolvedValueOnce(someID)

		const actual = await sut.registerUser(someUserName, somePassword)

		expect(actual).toBe(someID)
		expect(AddUserMock).toBeCalledWith({
			id: '',
			password: somePassword,
			userName: someUserName,
		})
	})

	it('should return token id for valid credentials', async () => {
		getUserByUserNameMock.mockResolvedValueOnce({ password: somePassword })
		generateTokenMock.mockResolvedValueOnce(someID)

		const actual = await sut.login(someUserName, somePassword)

		expect(actual).toBe(someID)
	})

	it('should invalidate the credentials', async () => {
		const actual = await sut.logout(someID)

		expect(invalidateTokenMock).toHaveBeenCalledWith(someID)
	})
})
