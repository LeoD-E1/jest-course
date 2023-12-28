import { Authorizer } from '../../../app/server_app/auth/Authorizer'
import { ReservationsDataAccess } from '../../../app/server_app/data/ReservationsDataAccess'
import { ReservationsHandler } from '../../../app/server_app/handlers/ReservationsHandler'
import { IncomingMessage, ServerResponse } from 'http'
import {
	HTTP_CODES,
	HTTP_METHODS,
} from '../../../app/server_app/model/ServerModel'
import { Reservation } from '../../../app/server_app/model/ReservationModel'

const getRequestBodyMock = jest.fn()

jest.mock('../../../app/server_app/utils/Utils', () => ({
	getRequestBody: () => getRequestBodyMock(),
}))

describe('ReservationHandler suite test', () => {
	let sut: ReservationsHandler

	const request = {
		url: '',
		headers: {
			authorization: 'someAuthorization',
		},
		method: undefined,
	}

	const responseMock = {
		statusCode: 0,
		write: jest.fn(),
		writeHead: jest.fn(),
	}

	const authorizerMock = {
		validateToken: jest.fn(),
	}

	const reservationsDataAccessMock = {
		createReservation: jest.fn(),
		getAllReservations: jest.fn(),
		getReservation: jest.fn(),
		deleteReservation: jest.fn(),
	}

	const validReservation: Reservation = {
		endDate: '',
		id: 'someID',
		room: 'someRoom',
		startDate: 'someStartDate',
		user: 'someUser',
	}

	const someId = 'jksdvsnjk4323'

	beforeEach(() => {
		sut = new ReservationsHandler(
			request as any as IncomingMessage,
			responseMock as any as ServerResponse,
			authorizerMock as any as Authorizer,
			reservationsDataAccessMock as any as ReservationsDataAccess
		)
	})

	afterEach(() => {
		jest.clearAllMocks()
	})

	it('should reject by unauthorized', async () => {
		const spy = jest.spyOn(sut as any, 'isOperationAuthorized')
		spy.mockResolvedValueOnce(false)

		await sut.handleRequest()

		expect(responseMock.statusCode).toBe(HTTP_CODES.UNAUTHORIZED)
		expect(responseMock.write).toBeCalledWith(
			JSON.stringify('Unauthorized operation!')
		)
	})

	// POST tests
	describe('POST methods tests', () => {
		it('should create a reservation', async () => {
			request.method = HTTP_METHODS.POST

			const spy = jest.spyOn(sut as any, 'isOperationAuthorized')
			spy.mockResolvedValueOnce(true)

			getRequestBodyMock.mockResolvedValueOnce(validReservation)
			reservationsDataAccessMock.createReservation.mockResolvedValueOnce(someId)
			await sut.handleRequest()

			expect(responseMock.statusCode).toBe(HTTP_CODES.CREATED)
			expect(responseMock.writeHead).toBeCalledWith(HTTP_CODES.CREATED, {
				'Content-Type': 'application/json',
			})
			expect(responseMock.write).toBeCalledWith(
				JSON.stringify({ reservationId: someId })
			)
		})

		it('should not create a reservation and reject by bad reservation', async () => {
			request.method = HTTP_METHODS.POST
			const spy = jest.spyOn(sut as any, 'isOperationAuthorized')
			spy.mockResolvedValueOnce(true)

			getRequestBodyMock.mockResolvedValueOnce({})

			await sut.handleRequest()

			expect(responseMock.statusCode).toBe(HTTP_CODES.BAD_REQUEST)
			expect(responseMock.writeHead).not.toBeCalled()
			expect(reservationsDataAccessMock.createReservation).not.toBeCalled()
			expect(responseMock.write).toBeCalledWith(
				JSON.stringify('Incomplete reservation!')
			)
		})
	})

	// GET methods test
	describe('GET methods tests', () => {
		it('should get all reservations when /all is sent as ID', async () => {
			request.method = HTTP_METHODS.GET
			request.url = '/someRoute/all'
			const spy = jest.spyOn(sut as any, 'isOperationAuthorized')
			spy.mockResolvedValueOnce(true)

			await sut.handleRequest()
			expect(spy).toHaveBeenCalled()
			expect(reservationsDataAccessMock.getAllReservations).toBeCalled()
			expect(responseMock.writeHead).toHaveBeenCalledWith(HTTP_CODES.OK, {
				'Content-Type': 'application/json',
			})
		})

		it('should return a bad request because the id was not provided', async () => {
			request.method = HTTP_METHODS.GET
			request.url = undefined
			const spy = jest.spyOn(sut as any, 'isOperationAuthorized')
			spy.mockResolvedValueOnce(true)

			await sut.handleRequest()

			expect(responseMock.statusCode).toBe(HTTP_CODES.BAD_REQUEST)
			expect(responseMock.write).toBeCalledWith(
				JSON.stringify('Please provide an ID!')
			)
		})

		it('should return a 404 because the reservation ID was not found', async () => {
			request.method = HTTP_METHODS.GET
			request.url = `/someRoute/${someId}`
			const spy = jest.spyOn(sut as any, 'isOperationAuthorized')
			spy.mockResolvedValueOnce(true)
			reservationsDataAccessMock.getReservation.mockReturnValueOnce(null)

			await sut.handleRequest()

			expect(responseMock.statusCode).toBe(HTTP_CODES.NOT_fOUND)
			expect(responseMock.write).toBeCalledWith(
				JSON.stringify(`Reservation with id ${someId} not found`)
			)
		})

		it('should return the reservation provided by ID', async () => {
			request.method = HTTP_METHODS.GET
			request.url = `/someRoute/${someId}`
			const spy = jest.spyOn(sut as any, 'isOperationAuthorized')
			spy.mockResolvedValueOnce(true)
			reservationsDataAccessMock.getReservation.mockResolvedValueOnce(someId)

			await sut.handleRequest()

			expect(responseMock.writeHead).toBeCalledWith(HTTP_CODES.OK, {
				'Content-Type': 'application/json',
			})
		})
	})

	// DELETE methods tests

	describe('DELETE methods tests', () => {
		it('should reject by ID is not provided', async () => {
			request.url = null
			request.method = HTTP_METHODS.DELETE
			const spy = jest.spyOn(sut as any, 'isOperationAuthorized')
			spy.mockResolvedValueOnce(true)

			await sut.handleRequest()

			expect(responseMock.statusCode).toBe(HTTP_CODES.BAD_REQUEST)
			expect(responseMock.write).toBeCalledWith(
				JSON.stringify('Please provide an ID!')
			)
		})

		it('should delete the reservation by id', async () => {
			request.url = `/someUrl/${someId}`
			request.method = HTTP_METHODS.DELETE
			const spy = jest.spyOn(sut as any, 'isOperationAuthorized')
			spy.mockResolvedValueOnce(true)
			reservationsDataAccessMock.deleteReservation.mockResolvedValueOnce(someId)

			await sut.handleRequest()

			expect(responseMock.statusCode).toBe(HTTP_CODES.OK)
			expect(responseMock.write).toBeCalledWith(
				JSON.stringify(`Deleted reservation with id ${someId}`)
			)
		})
	})
})
