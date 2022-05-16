const mongoose = require('mongoose')


const ReviewSchema = new mongoose.Schema({
    rating: {
        type: Number,
        required: [true, 'Please provide rating'],
        min: 1,
        max: 5,
    },
    title: {
        type: String,
        required: [true, 'Please provide review title'],
        trim: true,
        maxlength: 100,
    },
    comment: {
        type: String,
        required: [true, "Please provide review comment"]
    },
    user: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: 'User'
    },
    product: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: 'Product'
    }

}, { timestamps: true });

ReviewSchema.index({ product: 1, user: 1 }, { unique: true });

ReviewSchema.statics.calculateAverageRating = async function (productId) {

    
    const result = await this.aggregate([
        { $match: { product: productId } },
        {
            $group: {
                _id: null,
                averageRating: { $avg: '$rating' },
                numOfReviews: { $sum: 1 }
            }
        }
    ]);
    

    try {
        await this.model('Product').findOneAndUpdate({ _id: productId }, {
            averageRating: Math.ceil(result[0]?.averageRating || 0),
            numOfReviews: result[0]?.numOfReviews || 0
        })
    } catch (error) {
        console.log(error)
    }

}

ReviewSchema.post('save', async function () {

    await this.constructor.calculateAverageRating(this.product)

});

ReviewSchema.post('remove', async function () {

    await this.constructor.calculateAverageRating(this.product)

});

module.exports = mongoose.model('Review', ReviewSchema);