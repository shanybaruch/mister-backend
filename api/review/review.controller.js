import { logger } from '../../services/logger.service.js'
import { socketService } from '../../services/socket.service.js'
import { userService } from '../user/user.service.js'
import { authService } from '../auth/auth.service.js'
import { reviewService } from './review.service.js'
import { toyService } from '../toy/toy.service.js'


export async function getReviews(req, res) {
	
	try {
		const reviews = await reviewService.query(req.query)
		// console.log('---reviews in controller: ',reviews);
		res.send(reviews)
	} catch (err) {
		logger.error('Cannot get reviews', err)
		res.status(400).send({ err: 'Failed to get reviews' })
	}
}

export async function deleteReview(req, res) {
	var { loggedinUser } = req
	const { id: reviewId } = req.params

	try {
		const review = await reviewService.getById(reviewId)
		if (!review) return res.status(404).send({ err: 'Review not found' })

		const reviewOwnerId = review.userId.toString()
		const loggedInId = loggedinUser._id.toString()
		if (!loggedinUser.isAdmin && reviewOwnerId !== loggedInId) {
			return res.status(403).send({ err: 'Not authorized to delete this review' })
		}

		const deletedCount = await reviewService.remove(reviewId)
		if (deletedCount === 1) {
			socketService.broadcast({ type: 'review-removed', data: reviewId, userId: loggedinUser._id })
			res.send({ msg: 'Deleted successfully' })
		} else {
			res.status(400).send({ err: 'Cannot remove review' })
		}
	} catch (err) {
		logger.error('Failed to delete review', err)
		res.status(400).send({ err: 'Failed to delete review' })
	}
}

export async function addReview(req, res) {
	var { loggedinUser } = req

	try {
		var review = req.body
		const { toyId } = review
		review.userId = loggedinUser._id
		review = await reviewService.add(review)

		// Give the user credit for adding a review
		var user = await userService.getById(loggedinUser._id)
		user.score += 10

		await userService.update(user)

		// prepare the updated review for sending out
		const toy = await toyService.getById(toyId)

		review.user = user
		review.toy = { _id: toy._id, name: toy.name, price: toy.price }

		delete review.toy.givenReviews
		delete review.toyId
		delete review.userId

		socketService.broadcast({ type: 'review-added', data: review, userId: loggedinUser._id })
		// socketService.emitToUser({ type: 'review-about-you', data: review, userId: review.toy._id })

		const fullUser = await userService.getById(loggedinUser._id)
		
		socketService.emitTo({ type: 'user-updated', data: fullUser, label: fullUser._id })

		res.send(review)
	} catch (err) {
		logger.error('Failed to add review', err)
		res.status(400).send({ err: 'Failed to add review' })
	}
}
