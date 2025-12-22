import { ObjectId } from 'mongodb'

import { dbService } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'
import { utilService } from '../../services/util.service.js'
import { log } from 'console'

export const toyService = {
	remove,
	query,
	getById,
	add,
	update,
	addToyMsg,
	removeToyMsg,
	getLabels
}

async function query(filterBy = { txt: '' }) {
	try {
		const criteria = {
			name: { $regex: filterBy.txt, $options: 'i' },
		}
		if (filterBy.maxPrice) {
			criteria.price = { $lte: +filterBy.maxPrice }
		}

		if (filterBy.inStock && filterBy.inStock !== 'all') {
			criteria.inStock = filterBy.inStock === 'true'
		}

		if (filterBy.labels && filterBy.labels.length > 0) {
			criteria.labels = { $in: filterBy.labels }
		}

		const collection = await dbService.getCollection('toy')

		const labels = await collection.distinct('labels')
		const totalCount = await collection.countDocuments(criteria)
		const sort = {}
		if (filterBy.sortBy) {
			const direction = +filterBy.desc || 1
			sort[filterBy.sortBy] = direction
		}
		const pageIdx = +filterBy.pageIdx || 0
		const PAGE_SIZE = 8

		var toys = await collection.find(criteria)
			.sort(sort)
			.skip(pageIdx * PAGE_SIZE)
			.limit(PAGE_SIZE)
			.toArray()

		const maxPage = Math.ceil(totalCount / PAGE_SIZE)

		console.log('toys: ', toys)
		return { toys, maxPage, totalCount, labels }
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

async function getLabels() {
	const collection = await dbService.getCollection('toy')
	const toys = await collection.find({}).toArray()

	const labels = toys.flatMap(toy => toy.labels || [])
	return [...new Set(labels)]
}

