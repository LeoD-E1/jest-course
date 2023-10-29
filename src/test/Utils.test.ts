import { toUpperCase, getStringInfo, StringUtils } from '../app/Utils'

describe('Utils test suite', () => {
  // Testing classes
  describe('StringUtils tests', () => {
    // Hooks
    let sut: StringUtils

    beforeEach(() => {
      sut = new StringUtils()
      console.log('Teardown - BeforeEach')
    })

    afterEach(() => {
      //clearing mocks
      console.log('Teardown - AfterEach')
    })

    it('Should return correct uppercase', () => {
      const sut = new StringUtils()

      const actual = sut.toUpperCase('abc')

      expect(actual).toBe('ABC')
      console.log('Actual test')
    })

    it('Should throw an error on invalid Argument - function', () => {
      function expectError() {
        const actual = sut.toUpperCase('')
      }
      expect(expectError).toThrow()
      expect(expectError).toThrowError('Invalid Argument')
    })

    it('Should throw an error on invalid Argument - arrow function', () => {
      expect(() => sut.toUpperCase('')).toThrowError('Invalid Argument')
    })

    it('Should throw an error on invalid Argument - try catch block', done => {
      try {
        sut.toUpperCase('')
        // i put that for mandatory fail because if you don't put a check on your code, without this line, the test passes
        done('GetStringInfo should throw error for invalid arg')
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect(error).toHaveProperty('message', 'Invalid Argument')
        done()
      }
    })
  })

  it('should return uppercase of a valid string', () => {
    // Arrange
    const sut = toUpperCase
    const expected = 'ABC'

    // act
    const actual = sut('abc')

    // Assert
    expect(actual).toBe(expected)
  })

  /*  
    Here we have a lot of use cases in which we will can test with a another syntax
    and all in one time, is similar to do a map iteration for tests
  */
  describe('ToUpperCase examples', () => {
    it.each([
      { input: 'abc', expected: 'ABC' },
      { input: 'my-string', expected: 'MY-STRING' },
      { input: 'def', expected: 'DEF' },
    ])('$input toUpperCase should be $expected ', ({ input, expected }) => {
      const actual = toUpperCase(input)
      expect(actual).toBe(expected)
    })
  })

  describe('getStringInfo for arg My-String should', () => {
    test('return right length', () => {
      const actual = getStringInfo('My-String')
      expect(actual.characters).toHaveLength(9)
    })

    test('return right lower case', () => {
      const actual = getStringInfo('My-String')
      expect(actual.lowerCase).toBe('my-string')
    })

    test('return right lower upper case', () => {
      const actual = getStringInfo('My-String')
      expect(actual.upperCase).toBe('MY-STRING')
    })

    test('return right lower right characters', () => {
      const actual = getStringInfo('My-String')
      expect(actual.characters).toEqual([
        'M',
        'y',
        '-',
        'S',
        't',
        'r',
        'i',
        'n',
        'g',
      ])
      expect(actual.characters).toContain<string>('M')
      expect(actual.characters).toEqual(
        expect.arrayContaining(['S', 't', 'r', 'i', 'n', 'g', 'M', 'y', '-'])
      )
    })

    test('return defined extra info', () => {
      const actual = getStringInfo('My-String')
      expect(actual.extraInfo).toBeDefined()
    })

    test('return right extra info', () => {
      const actual = getStringInfo('My-String')
      expect(actual.extraInfo).toEqual({})
    })
  })
})
