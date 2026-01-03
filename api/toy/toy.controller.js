import { toyService } from './toy.service.js'
import { logger } from '../../services/logger.service.js'

export async function getToys(req, res) {
    // let { labels } = req.query
    let labels = req.query.labels || req.query['labels[]']

    if (labels && typeof labels === 'string') {
        labels = [labels]
    }
    const filterBy = {
        txt: req.query.txt || '',
        maxPrice: +req.query.maxPrice || 0,
        pageIdx: req.query.pageIdx || undefined,
        sortBy: req.query.sortBy,
        desc: req.query.desc,
        inStock: req.query.inStock,
        labels: labels || []
    }
    try {
        const toyData = await toyService.query(filterBy)
        // console.log('------filter by: ', filterBy);
        // console.log('toy data: ', toyData);        
        res.json(toyData)
    } catch (err) {
        logger.error('Cannot get toys', err)
        res.status(400).send('Cannot get toys')
    }
}

export async function getToyById(req, res) {
    try {
        const toyId = req.params.id
        const toy = await toyService.getById(toyId)
        res.json(toy)
    } catch (err) {
        logger.error('Failed to get toy', err)
        res.status(500).send({ err: 'Failed to get toy' })
    }
}

export async function addToy(req, res) {
    const { body: toy } = req
    try {
        const addedToy = await toyService.add(toy)
        res.json(addedToy)
    } catch (err) {
        logger.error('Failed to add toy', err)
        res.status(500).send({ err: 'Failed to add toy' })
    }
}

export async function updateToy(req, res) {
    const { body: toy } = req

    try {
        const updatedToy = await toyService.update(toy)
        res.json(updatedToy)
    } catch (err) {
        logger.error('Failed to update toy', err)
        res.status(500).send({ err: 'Failed to update toy' })
    }
}

export async function removeToy(req, res) {
    try {
        const toyId = req.params.id
        const deletedCount = await toyService.remove(toyId)
        res.send(`${deletedCount} toys removed`)
    } catch (err) {
        logger.error('Failed to remove toy', err)
        res.status(500).send({ err: 'Failed to remove toy' })
    }
}

export async function addToyMsg(req, res) {
    const { loggedinUser } = req
    try {
        const toyId = req.params.id
        const msg = {
            txt: req.body.txt,
            by: {
                _id: loggedinUser._id,
                fullname: loggedinUser.fullname
            },
            createdAt: Date.now(),
        }
        const savedMsg = await toyService.addToyMsg(toyId, msg)
        res.json(savedMsg)
    } catch (err) {
        logger.error('Failed to update toy', err)
        res.status(500).send({ err: 'Failed to update toy' })
    }
}

export async function removeToyMsg(req, res) {
    try {
        const { id: toyId, msgId } = req.params

        const removedId = await toyService.removeToyMsg(toyId, msgId)
        res.send(removedId)
    } catch (err) {
        logger.error('Failed to remove toy msg', err)
        res.status(500).send({ err: 'Failed to remove toy msg' })
    }
}

export async function getToyLabels(req, res) {
    const labels = await toyService.getLabels()
    res.json(labels)
}

export async function addGalleryImg(req, res) {
    const { loggedinUser } = req
    // console.log('loggedinUser: ',loggedinUser);
    if (!loggedinUser) return res.status(401).send('Not Logged In')
    try {
        const toyId = req.params.id
        const { imgUrl } = req.body

        const savedImg = await toyService.addToyImg(toyId, imgUrl, loggedinUser?._id)    
        res.json(savedImg)
    } catch (err) {
        logger.error('Failed to add toy img', err)
        res.status(500).send({ err: 'Failed to add toy img (toy.controller-backend)' })
    }
}

export async function removeGalleryImg(req, res) {
  const { loggedInUser } = req
  try {
    const { id, imgId } = req.params
    const removedId = await toyService.removeToyImg(id, imgId, loggedInUser)
    res.send(removedId)
  } catch (err) {
    logger.error('Failed to remove toy img', err)
    res.status(500).send({ err: 'Failed to remove toy img' })
  }
}