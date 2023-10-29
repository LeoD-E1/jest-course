import {
	PasswordChecker,
	PasswordErrors,
} from '../../app/pass-checker/PasswordChecker'

describe('PasswordChecker test suite', () => {
	let sut: PasswordChecker

	beforeEach(() => {
		sut = new PasswordChecker()
	})

	it('Password with less than 8 chars is invalid', () => {
		const actual = sut.checkPassword('1234567')
		expect(actual.valid).toBe(false)
		expect(actual.reasons).toContain(PasswordErrors.SHORT)
	})

	// it('Password with more than 8 chars is ok', () => {
	// 	const actual = sut.checkPassword('12345678Ab')
	// 	expect(actual.valid).toBe(true)
	// 	expect(actual.reasons).not.toContain(PasswordErrors.SHORT)
	// })

	it('Password with no upper case chars is invalid', () => {
		const actual = sut.checkPassword('1234abcd')
		expect(actual.valid).toBe(false)
		expect(actual.reasons).toContain(PasswordErrors.NO_UPPER_CASE)
	})

	it('Password with upper case chars is ok', () => {
		const actual = sut.checkPassword('1234abcD')
		expect(actual.valid).toBe(true)
		expect(actual.reasons).not.toContain(PasswordErrors.NO_UPPER_CASE)
	})

	// it('Password with no lower case chars is invalid', () => {
	// 	const actual = sut.checkPassword('1234ABCD')
	// 	expect(actual.valid).toBe(false)
	// 	expect(actual.reasons).toContain(PasswordErrors.NO_LOWER_CASE)
	// })

	it('Password with lower case chars is ok', () => {
		const actual = sut.checkPassword('1234ABCd')
		expect(actual.valid).toBe(true)
		expect(actual.reasons).not.toContain(PasswordErrors.NO_LOWER_CASE)
	})

	// Admin passwords

	it('Admin password with no numbers is invalid', () => {
		const actual = sut.checkAdminPassword('ABCdEFSGss')
		expect(actual.valid).toBe(false)
		expect(actual.reasons).toContain(PasswordErrors.NO_NUMBER)
	})

	it('Admin password with numbers is valid', () => {
		const actual = sut.checkAdminPassword('ABCdEFSGss21')
		expect(actual.reasons).not.toContain(PasswordErrors.NO_NUMBER)
	})
})
