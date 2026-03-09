const express = require('express')
const router = express.Router()
const videoController = require('../controllers/videoController')

// Videos CRUD
router.get('/', videoController.getAllVideos)
router.post('/', videoController.createVideo)

// Like a video
router.patch('/:id/like', videoController.likeVideo)

// Comments on a video
router.get('/:id/comments', videoController.getComments)
router.post('/:id/comments', videoController.addComment)

// Replies to a comment
router.post('/:id/comments/:commentId/replies', videoController.addReply)

module.exports = router