import { DataBase } from '../../../app/server_app/data/DataBase'
import * as IdGenerator from '../../../app/server_app/data/IdGenerator'

type someTypeWithId = {
	id: string
	name: string
	color: string
}

describe('Database test suite', () => {
	let sut: DataBase<someTypeWithId>
	const fakeId = '1234'
	const someObj = {
		id: '',
		name: 'someName',
		color: 'blue',
	}

	const someObj2 = {
		id: '',
		name: 'someOtherName',
		color: 'blue',
	}

	beforeEach(() => {
		sut = new DataBase<someTypeWithId>()
		jest.spyOn(IdGenerator, 'generateRandomId').mockReturnValue(fakeId)
	})

	it('should return id after insert', async () => {
		const actual = await sut.insert({
			id: '',
		} as any)
		expect(actual).toBe(fakeId)
	})

	it('should get element after insert', async () => {
		const id = await sut.insert(someObj)
		const actual = await sut.getBy('id', id)
		expect(actual).toBe(someObj)
	})

	it('should find all elements with the same property', async () => {
		await sut.insert(someObj)
		await sut.insert(someObj2)

		const expected = [someObj, someObj2]

		const actual = await sut.findAllBy('color', 'blue')
		expect(actual).toEqual(expected)
	})

	it('should change color on object', async () => {
		const id = await sut.insert(someObj)
		const expectedColor = 'red'

		await sut.update(id, 'color', expectedColor)
		const object = await sut.getBy('id', id)
		const actualColor = object.color

		expect(actualColor).toBe(expectedColor)
	})

	it('should delete object', async () => {
		const id = await sut.insert(someObj)

		await sut.delete(id)
		const actual = await sut.getBy('id', id)

		expect(actual).toBeUndefined()
	})

	it('should return all elements', async () => {
		await sut.insert(someObj)
		await sut.insert(someObj2)
		const expected = [someObj, someObj2]

		const actual = await sut.getAllElements()

		expect(actual).toEqual(expected)
	})
})
