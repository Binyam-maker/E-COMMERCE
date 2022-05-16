const express = require('express');
const router = express.Router();
const {authenticateUser, authorizePermissions} = require('../middleware/authentication');

const {
    deleteReview,
    updateReview,
    getSingleReview,
    getAllReviews,
    createReview
} = require('../controller/reviewController');

router
.route('/')
.get(getAllReviews)
.post(authenticateUser,createReview);

router
.route('/:id')
.get(getSingleReview)
.patch(authenticateUser, updateReview)
.delete(authenticateUser,  deleteReview);

module.exports = router;

