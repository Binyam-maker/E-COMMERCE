const express = require('express');
const router = express.Router();
const { authorizePermissions, authenticateUser } = require('../middleware/authentication')


const { uploadImage,
    deleteProduct,
    updateProduct,
    getAllProducts,
    getSingleProduct,
    createProduct,
} = require('../controller/productController');

const {getSingleProductReview} = require('../controller/reviewController');




router
    .route('/')
    .get(getAllProducts)
    .post(authenticateUser, authorizePermissions('admin'), createProduct);

router
    .route('/uploadImage').post(authenticateUser, authorizePermissions('admin'), uploadImage);

router
    .route('/:id')
    .get(getSingleProduct)
    .patch(authenticateUser, authorizePermissions('admin'), updateProduct)
    .delete(authenticateUser, authorizePermissions('admin'), deleteProduct);

router
    .route('/:id/reviews')
    .get(getSingleProductReview);

module.exports = router;

