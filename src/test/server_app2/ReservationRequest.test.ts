import { DataBase } from '../../app/server_app/data/DataBase'
import {
	HTTP_CODES,
	HTTP_METHODS,
} from '../../app/server_app/model/ServerModel'
import { Server } from '../../app/server_app/server/Server'
import { RequestTestWrapper } from './test_utils/RequestTestWrapper'
import { ResponseTestWrapper } from './test_utils/ResponseTestWrapper'

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

const someTokenId = '1234kdiokasfvm;owe'
const someId = 'someId'
const jsonHeader = { 'Content-Type': 'application/json' }

const reservationsDB = [
	{
		endDate: 'someEndDate',
		room: 'SomeRoom',
		startDate: 'someStartDate',
		user: 'someUserName',
		id: 0,
	},
	{
		endDate: 'someEndDate',
		room: 'SomeRoom',
		startDate: 'someStartDate',
		user: 'someUserName',
		id: 1,
	},
]

const someReservation = {
	endDate: 'someEndDate',
	room: 'SomeRoom',
	startDate: 'someStartDate',
	user: 'someUserName',
	id: '',
}
describe('Reservations test suite', () => {
	const getBySpy = jest.spyOn(DataBase.prototype, 'getBy')
	const insertSpy = jest.spyOn(DataBase.prototype, 'insert')
	const getAllSpy = jest.spyOn(DataBase.prototype, 'getAllElements')
	const deleteSpy = jest.spyOn(DataBase.prototype, 'delete')
	const updateSpy = jest.spyOn(DataBase.prototype, 'update')

	beforeEach(() => {
		requestWrapper.headers['user-agent'] = 'jest tests'
		requestWrapper.headers['authorization'] = 'someToken'

		// authenticate calls:
		getBySpy.mockResolvedValueOnce({
			valid: true,
		})
	})

	afterEach(() => {
		requestWrapper.clearFileds()
		responseWrapper.clearFields()
		jest.clearAllMocks()
	})

	describe('POST requests', () => {
		it('Should do a reservation', async () => {
			requestWrapper.method = HTTP_METHODS.POST
			requestWrapper.url = 'localhost:8080/reservation'
			requestWrapper.body = someReservation

			insertSpy.mockResolvedValueOnce(someId)

			await new Server().startServer()
			await new Promise(process.nextTick)

			expect(responseWrapper.statusCode).toBe(HTTP_CODES.CREATED)
			expect(responseWrapper.body).toEqual({
				reservationId: someId,
			})
			expect(responseWrapper.headers).toContainEqual(jsonHeader)
		})

		it('Should reject a reservation', async () => {
			requestWrapper.method = HTTP_METHODS.POST
			requestWrapper.url = 'localhost:8080/reservation'
			requestWrapper.body = {}

			await new Server().startServer()
			await new Promise(process.nextTick)

			expect(responseWrapper.statusCode).toBe(HTTP_CODES.BAD_REQUEST)
			expect(responseWrapper.body).toEqual('Incomplete reservation!')
		})
	})

	describe('GET requests', () => {
		it('should retrieve all reservations from DB', async () => {
			requestWrapper.method = HTTP_METHODS.GET
			requestWrapper.url = 'localhost:8080/reservation/all'
			getAllSpy.mockResolvedValueOnce(reservationsDB)

			await new Server().startServer()
			await new Promise(process.nextTick)

			expect(responseWrapper.statusCode).toBe(HTTP_CODES.OK)
			expect(responseWrapper.body).toStrictEqual(reservationsDB)
			expect(responseWrapper.headers).toContainEqual(jsonHeader)
		})

		it('should retrieve reservation by ID from DB', async () => {
			requestWrapper.method = HTTP_METHODS.GET
			requestWrapper.url = `localhost:8080/reservation/${someId}`
			getBySpy.mockResolvedValueOnce(someReservation)

			await new Server().startServer()
			await new Promise(process.nextTick)

			expect(responseWrapper.statusCode).toBe(HTTP_CODES.OK)
			expect(responseWrapper.body).toStrictEqual(someReservation)
			expect(responseWrapper.headers).toContainEqual(jsonHeader)
		})

		it('should reject by reservation was not found', async () => {
			requestWrapper.method = HTTP_METHODS.GET
			requestWrapper.url = `localhost:8080/reservation/${someId}`
			getBySpy.mockResolvedValueOnce(null)

			await new Server().startServer()
			await new Promise(process.nextTick)

			expect(responseWrapper.statusCode).toBe(HTTP_CODES.NOT_fOUND)
			expect(responseWrapper.body).toStrictEqual(
				`Reservation with id ${someId} not found`
			)
		})

		it('should reject by reservationId was not provided', async () => {
			requestWrapper.method = HTTP_METHODS.GET
			requestWrapper.url = `localhost:8080/reservation/`

			await new Server().startServer()
			await new Promise(process.nextTick)

			expect(responseWrapper.statusCode).toBe(HTTP_CODES.BAD_REQUEST)
			expect(responseWrapper.body).toEqual('Please provide an ID!')
		})
	})

	describe('DELETE requests', () => {
		it('should delete a reservation in DB by reservation ID', async () => {
			requestWrapper.method = HTTP_METHODS.DELETE
			requestWrapper.url = `localhost:8080/reservation/${someId}`

			deleteSpy.mockResolvedValueOnce(undefined)

			await new Server().startServer()
			await new Promise(process.nextTick)

			expect(responseWrapper.statusCode).toBe(HTTP_CODES.OK)
			expect(responseWrapper.body).toEqual(
				`Deleted reservation with id ${someId}`
			)
		})

		it('should do nothing by reservation ID not provided', async () => {
			requestWrapper.method = HTTP_METHODS.DELETE
			requestWrapper.url = `localhost:8080/reservation/`

			await new Server().startServer()
			await new Promise(process.nextTick)

			expect(responseWrapper.statusCode).toBe(HTTP_CODES.BAD_REQUEST)
			expect(responseWrapper.body).toEqual('Please provide an ID!')
		})
	})

	describe('PUT requests', () => {
		it('should do an update in a reservation by reservationId', async () => {
			requestWrapper.method = HTTP_METHODS.PUT
			requestWrapper.url = `localhost:8080/reservation/${someId}`
			requestWrapper.body = reservationsDB[0]
			getBySpy.mockResolvedValueOnce(someReservation)
			updateSpy.mockResolvedValueOnce(undefined)

			await new Server().startServer()
			await new Promise(process.nextTick)

			expect(responseWrapper.headers).toContainEqual(jsonHeader)
			expect(responseWrapper.body).toEqual(
				`Updated ${Object.keys(reservationsDB[0])} of reservation ${someId}`
			)
		})
	})

	it('should do nothing for not supported http request', async () => {
		requestWrapper.method = HTTP_METHODS.OPTIONS
		requestWrapper.url = `localhost:8080/reservation`

		await new Server().startServer()
		await new Promise(process.nextTick)

		expect(responseWrapper.statusCode).toBeUndefined()
		expect(responseWrapper.body).toBeUndefined()
	})
})
