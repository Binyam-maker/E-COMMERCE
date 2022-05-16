const Review = require('../models/Review');
const Product = require('../models/Product');
const customError = require('../errors');
const {StatusCodes} = require('http-status-codes');
const {checkPermissions} = require('../utils');


const createReview = async (req, res) => {

    const {product: reviewId} = req.body;

    const isValidProduct = await Product.findById(reviewId);

    if(!isValidProduct){
        throw new customError.NotFoundError(`No product with id: ${reviewId} `);
    }

    const alreadySubmitted = await Review.findOne({
        product: reviewId,
        user: req.user.userId
    });

    if(alreadySubmitted){
        throw new customError.BadRequestError('Already submitted review for this product');
    }    

    
    req.body.user = req.user.userId;
    

    const review = await Review.create(req.body);

    res.status(StatusCodes.CREATED).json({review});


}

const getAllReviews = async (req, res) => {
   const reviews = await Review.find({})
   .populate({path: 'product', select: 'name company price'})
   .populate({path: "user", select: 'name'});

   res.status(StatusCodes.OK).json({reviews});

}

const getSingleReview = async (req, res) => {
    const {id: reviewId} = req.params

    const review = await Review.findById(reviewId);

    if(!review){
        throw new customError.NotFoundError(`Found no review with id ${reviewId}`);        
    }
    res.status(StatusCodes.OK).json({review});
}

const updateReview = async (req, res) => {
    const {id: reviewId} = req.params;
    const {rating, title, comment} = req.body;  
      
     // check if review exists
     const review = await Review.findById(reviewId);

     if(!review) {
        throw new customError.NotFoundError(`Found no review with id: ${reviewId}`);
    }

     // check permissions 
     checkPermissions(req.user, review.user);   

     review.title = title;
     review.comment = comment;
     review.rating = rating;

     await review.save();

    res.status(StatusCodes.OK).json({review});

}

const deleteReview = async (req, res) => {

    const {id: reviewId} = req.params;      
    
    // check if review exists
    const review = await Review.findById(reviewId);

    if(!review) {
        throw new customError.NotFoundError(`Found no review with id: ${reviewId}`);
    }

    // check permissions 
    checkPermissions(req.user, review.user);

    // delete review
    await review.remove();

    res.status(StatusCodes.OK).json({msg: 'Review Deleted'});
   
}

const getSingleProductReview = async (req, res) =>{
    const {id: productId} = req.params;
    const reviews = await Review.find({product: productId});
    if(!reviews){
        throw new customError.NotFoundError(`No reviews for this product with id: ${productId}`);
    }

    res.status(StatusCodes.OK).json({reviews, count: reviews.length});    
    
}
module.exports = {
    deleteReview,
    updateReview,
    getSingleReview,
    getAllReviews,
    createReview,
    getSingleProductReview
}