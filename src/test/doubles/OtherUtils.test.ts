import {
	OtherStringUtils,
	calculateComplexity,
	toUpperCaseWithCb,
} from '../../app/doubles/OtherUtils'

describe.skip('OtherUtils test suite', () => {
	describe('OtherStringUtils test with spies', () => {
		let sut: OtherStringUtils

		beforeEach(() => {
			sut = new OtherStringUtils()
		})

		test('Use spy to track calls', () => {
			const toUpperCaseSpy = jest.spyOn(sut, 'toUpperCase')
			sut.toUpperCase('asa')
			expect(toUpperCaseSpy).toBeCalledWith('asa')
		})

		test('Use spy to track calls to other modules', () => {
			const consoleLogSpy = jest.spyOn(console, 'log')
			sut.logString('abc')
			expect(consoleLogSpy).toBeCalledWith('abc')
		})

		// This test uses the other private method in the same class to execute it
		// Because that is 'as any', if you want to remove it you need to put the method as public
		test('Use spy to replace the implementation of  a method', () => {
			jest.spyOn(sut as any, 'callExternalService').mockImplementation(() => {
				console.log('calling mocked implementation')
			})
			;(sut as any).callExternalService()
		})
	})

	describe('Tracking callback with Jest mocks', () => {
		const callbackMock = jest.fn()

		// Clearing Jest mocks
		afterEach(() => jest.clearAllMocks())

		it('calls callback for invalid argunment - track calls', () => {
			// to pass a function here that is required, we need a fake data.
			const actual = toUpperCaseWithCb('', callbackMock)
			expect(actual).toBeUndefined()
			expect(callbackMock).toBeCalledWith('Invalid Argument')
			expect(callbackMock).toBeCalledTimes(1)
		})

		it('calls callback for valid argunment - track calls', () => {
			// to pass a function here that is required, we need a fake data.
			const actual = toUpperCaseWithCb('abc', callbackMock)
			expect(actual).toBe('ABC')
			expect(callbackMock).toBeCalledWith(`called function with abc`)
			expect(callbackMock).toBeCalledTimes(1)
		})
	})

	describe('Tracking callback', () => {
		let cbArgs = []
		let timesCalled = 0

		function callbackMock(arg: string) {
			cbArgs.push(arg)
			timesCalled++
		}

		afterEach(() => {
			// Clearing tracking fields
			cbArgs = []
			timesCalled = 0
		})

		it('calls callback for invalid argunment - track calls', () => {
			// to pass a function here that is required, we need a fake data.
			const actual = toUpperCaseWithCb('', callbackMock)
			expect(actual).toBeUndefined()
			expect(cbArgs).toContain('Invalid Argument')
			expect(timesCalled).toBe(1)
		})

		it('calls callback for valid argunment - track calls', () => {
			// to pass a function here that is required, we need a fake data.
			const actual = toUpperCaseWithCb('abc', callbackMock)
			expect(actual).toBe('ABC')
			expect(cbArgs).toContain(`called function with abc`)
			expect(timesCalled).toBe(1)
		})
	})

	it('ToUpperCase - calls callback for invalid argunment', () => {
		// to pass a function here that is required, we need a fake data.
		const actual = toUpperCaseWithCb('', () => {})
		expect(actual).toBeUndefined()
	})

	it('ToUpperCase - calls callback for valid argunment', () => {
		// to pass a function here that is required, we need a fake data.
		const actual = toUpperCaseWithCb('abc', () => {})
		expect(actual).toBe('ABC')
	})

	it('should calculate the complexity', () => {
		const someInfo = {
			length: 5,
			extraInfo: {
				field1: 'someInfo',
				field2: 'SomeOtherInfo',
			},
		}

		const actual = calculateComplexity(someInfo as any)
		expect(actual).toBe(10)
	})
})
