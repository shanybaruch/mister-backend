import { ObjectId } from 'mongodb'

import { dbService } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'
import { utilService } from '../../services/util.service.js'

export const toyService = {
	remove,
	query,
	getById,
	add,
	update,
	addToyMsg,
	removeToyMsg,
}

async function query(filterBy = { txt: '' }) {
	try {
		const { filterCriteria, sortCriteria, skip } = _buildCriteria(filterBy)

		const collection = await dbService.getCollection('toy')
		const totalCount = await collection.countDocuments(filterCriteria)

		const filteredToys =
			await collection
				.find(filterCriteria)
				.sort(sortCriteria)
				.skip(skip)
				.limit(PAGE_SIZE).toArray()

		const maxPage = Math.ceil(totalCount / PAGE_SIZE)
		return { toys: filteredToys, maxPage }
	} catch (err) {
		logger.error('cannot find toys', err)
		throw err
	}
}

async function getById(toyId) {
	try {
		const collection = await dbService.getCollection('toy')
		const toy = await collection.findOne({ _id: ObjectId.createFromHexString(toyId) })
		toy.createdAt = toy._id.getTimestamp()
		return toy
	} catch (err) {
		logger.error(`while finding toy ${toyId}`, err)
		throw err
	}
}

async function remove(toyId) {
	try {
		const collection = await dbService.getCollection('toy')
		const { deletedCount } = await collection.deleteOne({ _id: ObjectId.createFromHexString(toyId) })
		return deletedCount
	} catch (err) {
		logger.error(`cannot remove toy ${toyId}`, err)
		throw err
	}
}

async function add(toy) {
	try {
		toy.createdAt = Date.now()
		toy.inStock = true
		if (!toy.labels) toy.labels = []
		const uniqueStr = toy.name || toy._id || 'default-toy'
		toy.imgUrl = toy.imgUrl || `https://robohash.org/${uniqueStr}?set=set4`

		const collection = await dbService.getCollection('toy')
		await collection.insertOne(toy)
		return toy
	} catch (err) {
		logger.error('cannot insert toy', err)
		throw err
	}
}

async function update(toy) {
	try {
		const { name, price, labels, inStock } = toy
		const toyToUpdate = {
			name,
			price,
			labels,
			inStock,
		}
		const collection = await dbService.getCollection('toy')
		await collection.updateOne({ _id: ObjectId.createFromHexString(toy._id) }, { $set: toyToUpdate })
		return toy
	} catch (err) {
		logger.error(`cannot update toy ${toy._id}`, err)
		throw err
	}
}

async function addToyMsg(toyId, msg) {
	try {
		msg.id = utilService.makeId()

		const collection = await dbService.getCollection('toy')
		await collection.updateOne({ _id: ObjectId.createFromHexString(toyId) }, { $push: { msgs: msg } })
		return msg
	} catch (err) {
		logger.error(`cannot add toy msg ${toyId}`, err)
		throw err
	}
}

async function removeToyMsg(toyId, msgId) {
	try {
		const collection = await dbService.getCollection('toy')
		await collection.updateOne({ _id: ObjectId.createFromHexString(toyId) }, { $pull: { msgs: { id: msgId } } })
		return msgId
	} catch (err) {
		logger.error(`cannot add toy msg ${toyId}`, err)
		throw err
	}
}

function _buildCriteria(filterBy) {
	const filterCriteria = {}

	if (filterBy.txt) {
		filterCriteria.name = { $regex: filterBy.txt, $options: 'i' }
	}
	if (filterBy.inStock) {
		filterCriteria.inStock = JSON.parse(filterBy.inStock)
	}
	if (filterBy.labels && filterBy.labels.length) {
		filterCriteria.labels = { $in: filterBy.labels }
	}
	const sortCriteria = {}
	const sortBy = filterBy.sortBy

	if (sortBy.type) {
		const sortDirection = +sortBy.sortDir
		sortCriteria[sortBy.type] = sortDirection
	} else sortCriteria.createdAt = -1

	const skip = filterBy.pageIdx !== undefined ? filterBy.pageIdx * PAGE_SIZE : 0
	return { filterCriteria, sortCriteria, skip }
}